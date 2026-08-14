// Browser-only Supabase client.
//
// Uses @supabase/ssr's createBrowserClient so the PKCE code_verifier is stored
// in a cookie (not localStorage). This lets the server-side /auth/callback
// route handler (createServerClient) read the same verifier and successfully
// call exchangeCodeForSession. Using plain createClient stores the verifier in
// localStorage, which the server can never access → OAuth always fails.
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// Public Supabase configuration is read strictly from the NEXT_PUBLIC_* vars.
// There is deliberately no hardcoded fallback URL or key: a misconfigured build
// must fail clearly instead of silently shipping a client that points at a
// stale or removed project (which previously surfaced as runtime ENOTFOUND
// errors and a dead directory).
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing public Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    );
  }

  return createBrowserClient<Database>(url, key);
}

// Singleton for the many existing `import { supabase } from "..."` callsites.
// Created lazily so merely importing this module never throws — client modules
// are imported during build-time prerendering even when no query actually runs.
let singleton: ReturnType<typeof createClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop: string | symbol) {
    singleton ??= createClient();
    const value = (singleton as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(singleton)
      : value;
  },
});
