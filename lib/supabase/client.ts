import { createBrowserClient } from "@supabase/ssr";

export const isSupabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Placeholder values keep `next build` working before Supabase is
// configured. Auth calls with them will fail at runtime, and the UI shows
// a configuration notice instead of silently doing nothing.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

export function createClient() {
  return createBrowserClient(url, anonKey);
}
