// Browser-only Supabase client.
//
// Uses @supabase/ssr's createBrowserClient so the PKCE code_verifier is stored
// in a cookie (not localStorage). This lets the server-side /auth/callback
// route handler read the same verifier and exchange the code for a session.
import { createBrowserClient } from "@supabase/ssr";

import { getPublicSupabaseConfig } from "@/lib/supabase/public-env";
import type { Database } from "./types";

// Temporary compatibility aliases for older server modules. They are strictly
// environment-derived and intentionally have no hardcoded project fallback.
// New code should use getPublicSupabaseConfig() instead.
export const SUPABASE_PUBLIC_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
export const SUPABASE_PUBLIC_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  "";

export function createClient() {
  const { url, key } = getPublicSupabaseConfig();
  return createBrowserClient<Database>(url, key);
}

// Created lazily so merely importing this module never throws during tests or
// prerendering. The first real Supabase access requires explicit environment
// configuration; there is no production fallback.
let singleton: ReturnType<typeof createClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop: string | symbol) {
    singleton ??= createClient();
    const client = singleton;
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
