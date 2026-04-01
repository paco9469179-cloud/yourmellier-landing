import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

/**
 * Singleton Supabase client (browser). Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 */
export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!url || !anonKey) {
      throw new Error(
        'Supabase env mancanti: imposta VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY in .env.local',
      )
    }
    client = createClient(url, anonKey)
  }
  return client
}

/** Messaggio errore da `functions.invoke` (body JSON o messaggio SDK). */
export function getFunctionInvokeErrorMessage(data: unknown, error: unknown): string | null {
  if (data && typeof data === 'object' && data !== null && 'error' in data) {
    const e = (data as { error: unknown }).error
    if (typeof e === 'string' && e.trim()) return e.trim()
  }
  if (error && typeof error === 'object' && error !== null && 'message' in error) {
    const m = (error as { message: unknown }).message
    if (typeof m === 'string' && m.trim()) return m.trim()
  }
  return null
}
