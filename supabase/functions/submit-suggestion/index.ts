/**
 * Edge Function: salva un suggerimento in `public.suggestions` (service role).
 * Payload frontend: { name?, email?, category, message, locale }
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALLOWED_LANGS = new Set(['en', 'it', 'fr', 'de', 'es'])
const CATEGORIES = new Set(['bug', 'feature', 'improvement', 'other'])

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}

function normalizeLang(locale: unknown): string {
  if (typeof locale !== 'string') return 'it'
  const l = locale.toLowerCase().slice(0, 2)
  return ALLOWED_LANGS.has(l) ? l : 'it'
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

  const category = body['category']
  if (typeof category !== 'string' || !CATEGORIES.has(category)) {
    return jsonResponse({ error: 'Invalid field: category' }, 400)
  }

  const messageRaw = body['message']
  if (typeof messageRaw !== 'string' || messageRaw.trim() === '') {
    return jsonResponse({ error: 'Invalid field: message' }, 400)
  }

  const message = stripHtml(messageRaw)
  if (message.length === 0 || message.length > 2000) {
    return jsonResponse({ error: 'Invalid message length' }, 400)
  }

  let name: string | null = null
  if (body['name'] != null) {
    if (typeof body['name'] !== 'string') {
      return jsonResponse({ error: 'Invalid field: name' }, 400)
    }
    const n = stripHtml(body['name']).slice(0, 100)
    name = n.length > 0 ? n : null
  }

  let email: string | null = null
  if (body['email'] != null && String(body['email']).trim() !== '') {
    if (typeof body['email'] !== 'string') {
      return jsonResponse({ error: 'Invalid field: email' }, 400)
    }
    const e = stripHtml(body['email']).trim().toLowerCase()
    if (!EMAIL_RE.test(e)) {
      return jsonResponse({ error: 'Invalid email' }, 400)
    }
    email = e
  }

  const language = normalizeLang(body['locale'])
  const userAgent = req.headers.get('user-agent') ?? null

  const supabase = createClient(supabaseUrl, serviceKey)

  const { error } = await supabase.from('suggestions').insert({
    name,
    email,
    category,
    suggestion: message,
    language,
    user_agent: userAgent,
    session_id: null,
    status: 'pending',
  })

  if (error) {
    console.error('suggestion insert', error)
    return jsonResponse({ error: 'Could not save suggestion' }, 500)
  }

  return jsonResponse({ ok: true }, 200)
})

function jsonResponse(data: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
