// Use @supabase/ssr's createBrowserClient so the PKCE code_verifier is stored
// in a cookie (not localStorage). This lets the server-side /auth/callback
// route handler (createServerClient) read the same verifier and successfully
// call exchangeCodeForSession. Using plain createClient stores the verifier
// in localStorage, which the server can never access → OAuth always fails.
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// Production fallbacks: NEXT_PUBLIC_* vars are inlined at build time, and a
// build made without them ships a client that cannot reach Supabase at all
// (profile pages and search die on hydration). The anon key is Supabase's
// publishable key — it is designed to ship in the browser bundle, and
// everything it can read or write is enforced by Row Level Security.
const FALLBACK_SUPABASE_URL = "https://ijsdpozjfjjufjsoexod.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqc2Rwb3pqZmpqdWZqc29leG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDcxNTYsImV4cCI6MjA3NzU4MzE1Nn0.S6fGMlOp8KLHwPGL9ebOQvDUqY3C79bw3SH9IOsCi2M";

// Exported for server modules (e.g. the public directory) that need an
// anon-key fallback when the service-role env isn't configured, such as
// env-less CI builds. The values are public by design; keep the literals in
// this file only — .gitleaks.toml allowlists exactly this path.
export const SUPABASE_PUBLIC_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  FALLBACK_SUPABASE_URL;

export const SUPABASE_PUBLIC_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  FALLBACK_SUPABASE_ANON_KEY;

const SUPABASE_URL = SUPABASE_PUBLIC_URL;
const SUPABASE_ANON_KEY = SUPABASE_PUBLIC_ANON_KEY;

export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Singleton for the many existing `import { supabase } from "..."` callsites.
// Cookie-based storage means multiple instances share the same auth state.
export const supabase = createClient();
