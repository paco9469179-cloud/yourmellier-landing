import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ========================================
// SANITIZZAZIONE E VALIDAZIONE
// ========================================

function sanitizeText(input: string | undefined | null): string | null {
  if (!input || typeof input !== 'string') return null
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isTextSafe(text: string): boolean {
  const dangerousPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\b.*\b(from|into|where|table)\b)/i,
    /(;|\-\-|\/\*|\*\/|xp_)/i,
    /<script|<iframe|<object|<embed|<img.*onerror/i,
    /(\||&|;|\$\(|`|>|<)/,
    /\.\.[\/\\]/,
    /\x00/,
  ]
  return !dangerousPatterns.some((pattern) => pattern.test(text))
}

function validateScore(value: unknown, min = 1, max = 5): number | null {
  if (value === undefined || value === null) return null
  const num = Number(value)
  if (Number.isNaN(num) || !Number.isInteger(num)) return null
  if (num < min || num > max) return null
  return num
}

/** NPS 0–10. */
function validateNps(value: unknown): number | null {
  if (value === undefined || value === null) return null
  const num = Number(value)
  if (Number.isNaN(num)) return null
  const r = Math.round(num)
  if (r < 0 || r > 10) return null
  return r
}

function validateEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  if (typeof value !== 'string') return null
  return allowed.includes(value as T) ? (value as T) : null
}

// ========================================
// PAYLOAD (piatto; allineato a survey_responses)
// ========================================

interface SurveyPayload {
  clarity_score?: number
  ease_of_use_score?: number
  first_impression?: string

  relevance_score?: number
  explanation_clarity?: 'clear' | 'partial' | 'unclear'
  suggestions_improvement?: string

  navigation_score?: number
  least_intuitive_part?: 'dish_input' | 'filtering' | 'wine_card' | 'purchase_link' | 'other'
  least_intuitive_other?: string
  technical_issues?: string

  amazon_link_usefulness?: number
  purchase_confidence?: 'yes' | 'no' | 'depends_on_price'
  clicked_purchase_link?: boolean

  real_situation_usefulness?: number
  /** DB: INTEGER 1–5 (Likert), come il questionario v2 in app. */
  future_usage_likelihood?: number
  nps_score?: number

  preferred_platform?: 'web' | 'mobile_app'
  most_liked?: string
  most_disliked?: string
  feature_request?: string

  language?: string
  is_draft?: boolean
  metadata?: {
    user_agent?: string
    referrer?: string
    session_id?: string
  }
}

function numberOrUndef(v: unknown): number | undefined {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string' && v !== '') {
    const n = Number(v)
    if (!Number.isNaN(n)) return n
  }
  return undefined
}

/** Payload legacy: `{ version: 2, answers, locale }` come da `SurveyForm`. */
function mapV2AnswersToSurveyPayload(body: Record<string, unknown>): SurveyPayload {
  const a = body.answers as Record<string, unknown> | undefined
  if (!a || typeof a !== 'object') return {}

  const ym = a.ym_reason_useful
  let explanation: 'clear' | 'partial' | 'unclear' | undefined
  if (ym === 'yes') explanation = 'clear'
  else if (ym === 'partially') explanation = 'partial'
  else if (ym === 'no') explanation = 'unclear'

  const ux = a.ux_least_intuitive
  const uxMap: Record<
    string,
    'dish_input' | 'filtering' | 'wine_card' | 'purchase_link' | 'other'
  > = {
    dish: 'dish_input',
    filter: 'filtering',
    wine_sheet: 'wine_card',
    purchase_link: 'purchase_link',
    other: 'other',
  }
  const least = typeof ux === 'string' ? uxMap[ux] : undefined

  const pc = a.purchase_confidence
  let pcDb: 'yes' | 'no' | 'depends_on_price' | undefined
  if (pc === 'yes' || pc === 'no') pcDb = pc
  else if (pc === 'depends_price_rarity') pcDb = 'depends_on_price'

  const click = a.purchase_clicked_link
  let clicked: boolean | undefined
  if (click === 'yes') clicked = true
  else if (click === 'no') clicked = false

  const mod = a.modality_web_vs_app
  let plat: 'web' | 'mobile_app' | undefined
  if (mod === 'web') plat = 'web'
  else if (mod === 'app') plat = 'mobile_app'

  const loc = body.locale
  let language: string | undefined
  if (typeof loc === 'string') language = loc.split('-')[0]

  return {
    clarity_score: numberOrUndef(a.onboarding_scope_clarity),
    ease_of_use_score: numberOrUndef(a.onboarding_ease_without_instructions),
    first_impression: a.onboarding_first_impression as string | undefined,
    relevance_score: numberOrUndef(a.ym_suggestions_relevance),
    explanation_clarity: explanation,
    suggestions_improvement: a.ym_improve_suggestions as string | undefined,
    navigation_score: numberOrUndef(a.ux_navigation_fluidity),
    least_intuitive_part: least,
    least_intuitive_other: a.ux_least_intuitive_other as string | undefined,
    technical_issues: a.ux_technical_issues as string | undefined,
    amazon_link_usefulness: numberOrUndef(a.purchase_links_usefulness),
    purchase_confidence: pcDb,
    clicked_purchase_link: clicked,
    real_situation_usefulness: numberOrUndef(a.value_real_world_usefulness),
    future_usage_likelihood: numberOrUndef(a.value_reuse_likelihood),
    nps_score: numberOrUndef(a.value_nps),
    preferred_platform: plat,
    most_liked: a.modality_liked_most as string | undefined,
    most_disliked: a.modality_liked_least as string | undefined,
    feature_request: a.modality_feature_request as string | undefined,
    language,
    is_draft: body.is_draft === true,
    metadata: body.metadata as SurveyPayload['metadata'],
  }
}

function normalizePayload(raw: unknown): SurveyPayload {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const b = raw as Record<string, unknown>
  if (b.version === 2 && b.answers && typeof b.answers === 'object') {
    return mapV2AnswersToSurveyPayload(b)
  }
  return b as SurveyPayload
}

/** Invio completo: tutti i campi obbligatori del questionario. */
function validateCompleteSurvey(data: Record<string, unknown>): string | null {
  const requiredKeys = [
    'clarity_score',
    'ease_of_use_score',
    'relevance_score',
    'explanation_clarity',
    'navigation_score',
    'least_intuitive_part',
    'amazon_link_usefulness',
    'purchase_confidence',
    'real_situation_usefulness',
    'future_usage_likelihood',
    'nps_score',
    'preferred_platform',
  ] as const

  for (const k of requiredKeys) {
    if (data[k] === null || data[k] === undefined) return `Missing: ${k}`
  }
  if (data.clicked_purchase_link === null || data.clicked_purchase_link === undefined) {
    return 'Missing: clicked_purchase_link'
  }
  if (data.least_intuitive_part === 'other') {
    const o = data.least_intuitive_other
    if (typeof o !== 'string' || !sanitizeText(o)) return 'least_intuitive_other required when other'
  }
  return null
}

// ========================================
// HANDLER
// ========================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabase = createClient(url, key)

    let rawBody: unknown
    try {
      rawBody = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payload = normalizePayload(rawBody)

    const validLanguages = ['en', 'it', 'fr', 'de', 'es'] as const
    const langRaw = payload.language || 'it'
    const language = validLanguages.includes(langRaw as (typeof validLanguages)[number])
      ? langRaw
      : 'it'

    const isDraft = payload.is_draft === true

    const surveyData: Record<string, unknown> = {
      clarity_score: validateScore(payload.clarity_score, 1, 5),
      ease_of_use_score: validateScore(payload.ease_of_use_score, 1, 5),
      first_impression: sanitizeText(payload.first_impression)?.slice(0, 2000) ?? null,

      relevance_score: validateScore(payload.relevance_score, 1, 5),
      explanation_clarity: validateEnum(payload.explanation_clarity, ['clear', 'partial', 'unclear']),
      suggestions_improvement: sanitizeText(payload.suggestions_improvement)?.slice(0, 2000) ?? null,

      navigation_score: validateScore(payload.navigation_score, 1, 5),
      least_intuitive_part: validateEnum(payload.least_intuitive_part, [
        'dish_input',
        'filtering',
        'wine_card',
        'purchase_link',
        'other',
      ]),
      least_intuitive_other: sanitizeText(payload.least_intuitive_other)?.slice(0, 2000) ?? null,
      technical_issues: sanitizeText(payload.technical_issues)?.slice(0, 2000) ?? null,

      amazon_link_usefulness: validateScore(payload.amazon_link_usefulness, 1, 5),
      purchase_confidence: validateEnum(payload.purchase_confidence, ['yes', 'no', 'depends_on_price']),
      clicked_purchase_link:
        typeof payload.clicked_purchase_link === 'boolean' ? payload.clicked_purchase_link : null,

      real_situation_usefulness: validateScore(payload.real_situation_usefulness, 1, 5),
      future_usage_likelihood: validateScore(payload.future_usage_likelihood, 1, 5),
      nps_score: validateNps(payload.nps_score),

      preferred_platform: validateEnum(payload.preferred_platform, ['web', 'mobile_app']),
      most_liked: sanitizeText(payload.most_liked)?.slice(0, 2000) ?? null,
      most_disliked: sanitizeText(payload.most_disliked)?.slice(0, 2000) ?? null,
      feature_request: sanitizeText(payload.feature_request)?.slice(0, 2000) ?? null,

      language,
      is_draft: isDraft,
      completed_at: isDraft ? null : new Date().toISOString(),
      user_agent:
        sanitizeText(payload.metadata?.user_agent)?.slice(0, 500) ??
        sanitizeText(req.headers.get('user-agent') ?? undefined)?.slice(0, 500) ??
        null,
      referrer:
        sanitizeText(payload.metadata?.referrer)?.slice(0, 500) ??
        sanitizeText(req.headers.get('referer') ?? undefined)?.slice(0, 500) ??
        null,
      session_id: sanitizeText(payload.metadata?.session_id)?.slice(0, 100) ?? null,
    }

    const openTextFields = [
      surveyData.first_impression,
      surveyData.suggestions_improvement,
      surveyData.least_intuitive_other,
      surveyData.technical_issues,
      surveyData.most_liked,
      surveyData.most_disliked,
      surveyData.feature_request,
    ].filter((x): x is string => typeof x === 'string' && x.length > 0)

    for (const text of openTextFields) {
      if (!isTextSafe(text)) {
        throw new Error('Content contains potentially dangerous patterns')
      }
    }

    if (!isDraft) {
      const err = validateCompleteSurvey(surveyData)
      if (err) {
        return new Response(JSON.stringify({ error: err }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const { data, error } = await supabase.from('survey_responses').insert(surveyData).select().single()

    if (error) throw error

    return new Response(
      JSON.stringify({
        success: true,
        id: data.id,
        is_draft: surveyData.is_draft,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      },
    )
  } catch (error) {
    console.error('Survey submission error:', error)

    const message = error instanceof Error ? error.message : 'Submission failed'
    const clientErr =
      message.includes('dangerous') || message.startsWith('Missing:') || message.includes('least_intuitive')
    return new Response(JSON.stringify({ error: clientErr ? message : 'Could not save response' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: clientErr ? 400 : 500,
    })
  }
})
