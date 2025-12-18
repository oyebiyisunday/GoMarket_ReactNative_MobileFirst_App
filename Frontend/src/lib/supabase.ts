import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

let client: SupabaseClient | null = null;

if (url && anon) {
  client = createClient(url, anon, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
} else if (typeof console !== 'undefined') {
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL/EXPO_PUBLIC_SUPABASE_ANON_KEY not set; Supabase-specific flows will be disabled.'
  );
}

export const supabase = client;

export function requireSupabaseClient(): SupabaseClient {
  if (!client) {
    throw new Error('Supabase is not configured for this build.');
  }
  return client;
}

export const hasSupabaseClient = Boolean(client);
