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
