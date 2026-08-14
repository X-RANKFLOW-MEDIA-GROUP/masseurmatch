// Browser-only Supabase client.
//
// Uses @supabase/ssr's createBrowserClient so the PKCE code_verifier is stored
// in a cookie (not localStorage). This lets the server-side /auth/callback
// route handler read the same verifier and exchange the code for a session.
import { createBrowserClient } from "@supabase/ssr";

import { getPublicSupabaseConfig } from "@/lib/supabase/public-env";
import type { Database } from "./types";

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
