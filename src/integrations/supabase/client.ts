// Use @supabase/ssr's createBrowserClient so the PKCE code_verifier is stored
// in a cookie (not localStorage). This lets the server-side /auth/callback
// route handler (createServerClient) read the same verifier and successfully
// call exchangeCodeForSession. Using plain createClient stores the verifier
// in localStorage, which the server can never access → OAuth always fails.
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "";

export function createClient() {
  return createBrowserClient<Database>(
    SUPABASE_URL || "http://placeholder.supabase.invalid",
    SUPABASE_ANON_KEY || "placeholder-key",
  );
}

// Singleton for the many existing `import { supabase } from "..."` callsites.
// Cookie-based storage means multiple instances share the same auth state.
export const supabase = createClient();
