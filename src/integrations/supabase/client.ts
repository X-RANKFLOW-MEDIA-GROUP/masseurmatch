import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// HARDENED: force canonical env usage to avoid mismatches
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const browserStorage = typeof window === "undefined" ? undefined : window.localStorage;
const isBrowser = typeof window !== "undefined";

const supabaseWarningGlobalKey = "__MASSEURMATCH_SUPABASE_ENV_WARNED__" as const;

function warnMissingSupabaseEnvOnce() {
  if (process.env.NODE_ENV === "test") return;
  const globalState = globalThis as typeof globalThis & Record<string, boolean | undefined>;
  if (globalState[supabaseWarningGlobalKey]) return;
  globalState[supabaseWarningGlobalKey] = true;
  console.warn(
    "[supabase] Public env missing; running in fallback mode (NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY).",
  );
}

export const hasSupabaseClientEnv =
  SUPABASE_URL.length > 0 && SUPABASE_PUBLISHABLE_KEY.length > 0;

const missingEnvClient = new Proxy(
  {},
  {
    get() {
      return () => {
        throw new Error(
          "Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        );
      };
    },
  },
) as SupabaseClient<any>;

if (!hasSupabaseClientEnv) {
  warnMissingSupabaseEnvOnce();
}

export const supabase: SupabaseClient<any> = hasSupabaseClientEnv
  ? createClient<any>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: browserStorage,
        persistSession: isBrowser,
        autoRefreshToken: isBrowser,
        detectSessionInUrl: true,
      },
    })
  : missingEnvClient;
