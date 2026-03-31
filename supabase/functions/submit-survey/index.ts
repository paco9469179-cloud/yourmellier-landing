/**
 * Edge Function: salva una risposta questionario in `public.survey_responses` (service role).
 * Payload frontend: vedi `SurveyPayload` in src/types/survey.ts
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALLOWED_LANGS = new Set(['en', 'it', 'fr', 'de', 'es'])

const UI_KEYS = new Set([
  'navigation',
  'visual_hierarchy',
  'typography',
  'colors',
])
const UX_KEYS = new Set(['speed', 'clarity', 'onboarding', 'search'])
const FUNC_KEYS = new Set(['comparison', 'filters', 'alerts', 'history'])
const DATA_KEYS = new Set(['prices', 'accuracy', 'coverage', 'updates'])

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}

function normalizeLang(locale: unknown): string {
  if (typeof locale !== 'string') return 'it'
  const l = locale.toLowerCase().slice(0, 2)
  return ALLOWED_LANGS.has(l) ? l : 'it'
}

function filterKeys(arr: unknown, allowed: Set<string>): string[] {
  if (!Array.isArray(arr)) return []
  return arr.filter((x): x is string => typeof x === 'string' && allowed.has(x))
}

function mapPreferredPlatform(
  useful: boolean,
  usage: string | undefined,
): 'web' | 'mobile' | 'both' | 'neither' {
  if (!useful) return 'neither'
  if (!usage || usage === 'none') return 'neither'
  if (usage === 'web' || usage === 'mobile' || usage === 'both') return usage
  return 'neither'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: 'Server misconfigured' }, 500)
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400)
  }

  const useful = body['useful']
  if (typeof useful !== 'boolean') {
    return jsonResponse({ error: 'Invalid field: useful' }, 400)
  }

  const usagePref = body['usage_preference']
  const usageStr =
    typeof usagePref === 'string'
      ? usagePref
      : usagePref === undefined || usagePref === null
        ? undefined
        : String(usagePref)

  if (useful && usageStr !== undefined && usageStr !== '' && !isValidUsage(usageStr)) {
    return jsonResponse({ error: 'Invalid field: usage_preference' }, 400)
  }

  const improvements = body['improvements']
  if (!improvements || typeof improvements !== 'object' || Array.isArray(improvements)) {
    return jsonResponse({ error: 'Invalid field: improvements' }, 400)
  }

  const imp = improvements as Record<string, unknown>
  const ui = filterKeys(imp['ui'], UI_KEYS)
  const ux = filterKeys(imp['ux'], UX_KEYS)
  const functionality = filterKeys(imp['functionality'], FUNC_KEYS)
  const dataQuality = filterKeys(imp['data_quality'], DATA_KEYS)

  let other = ''
  if (body['other_feedback'] != null) {
    if (typeof body['other_feedback'] !== 'string') {
      return jsonResponse({ error: 'Invalid field: other_feedback' }, 400)
    }
    other = stripHtml(body['other_feedback'])
    if (other.length > 2000) {
      return jsonResponse({ error: 'other_feedback too long' }, 400)
    }
  }

  const language = normalizeLang(body['locale'])
  const preferred_platform = mapPreferredPlatform(useful, usageStr)

  const improvementsJson = {
    ui,
    ux,
    features: functionality,
    data_quality: dataQuality,
  }

  const userAgent = req.headers.get('user-agent') ?? null
  const referrer = req.headers.get('referer') ?? null
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('cf-connecting-ip') ??
    null

  const supabase = createClient(supabaseUrl, serviceKey)

  const { error } = await supabase.from('survey_responses').insert({
    is_useful: useful,
    preferred_platform,
    improvements: improvementsJson,
    additional_feedback: other || null,
    language,
    user_agent: userAgent,
    referrer,
    ip_address: ip,
  })

  if (error) {
    console.error('survey insert', error)
    return jsonResponse({ error: 'Could not save response' }, 500)
  }

  return jsonResponse({ ok: true }, 200)
})

function isValidUsage(u: string): boolean {
  return u === 'web' || u === 'mobile' || u === 'both' || u === 'none'
}

function jsonResponse(data: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
