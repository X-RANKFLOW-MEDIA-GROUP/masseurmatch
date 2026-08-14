/**
 * Public (browser-safe) Supabase configuration.
 *
 * Read strictly from NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 * These values are safe to ship to the browser; everything they can read or
 * write is enforced by Row Level Security. Server-side RLS-scoped clients
 * (createServerClient) also use these so a single key-naming convention holds
 * across the whole app.
 *
 * There is deliberately no fallback: a missing public configuration must fail
 * clearly rather than silently pointing at a stale or removed Supabase project.
 */
export interface PublicSupabaseConfig {
  url: string;
  key: string;
}

export function getPublicSupabaseConfig(): PublicSupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing public Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    );
  }

  return { url, key };
}

export function getPublicSupabaseUrl(): string {
  return getPublicSupabaseConfig().url;
}
