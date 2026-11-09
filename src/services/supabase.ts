import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://feuyurguyyaqpjvbdyap.supabase.co'
const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jQbIq6q3QxJv6Gr0rd5JRw__ZKz9ggW'

/**
 * Supabase client configured to store all authentication sessions in sessionStorage.
 * This guarantees that closing the browser or closing the tab automatically logs the user out.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

