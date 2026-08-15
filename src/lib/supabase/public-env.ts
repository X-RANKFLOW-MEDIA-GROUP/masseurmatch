/**
 * Browser-safe Supabase configuration.
 *
 * There is deliberately no hardcoded project fallback. Missing configuration
 * must fail clearly so preview, CI, local development, and production can never
 * silently connect to the production database by accident.
 */
export interface PublicSupabaseConfig {
  url: string;
  key: string;
}

export function getPublicSupabaseConfig(): PublicSupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    "";

  if (!url || !key) {
    throw new Error(
      "Missing public Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    );
  }

  return { url, key };
}

export function getPublicSupabaseUrl(): string {
  return getPublicSupabaseConfig().url;
}
