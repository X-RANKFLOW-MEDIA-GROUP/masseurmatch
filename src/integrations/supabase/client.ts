import { createClient } from '@supabase/supabase-js';

// HARDENED: force canonical env usage to avoid mismatches
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const browserStorage = typeof window === "undefined" ? undefined : window.localStorage;
const isBrowser = typeof window !== "undefined";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("❌ Supabase env not configured correctly. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

export const supabase = createClient<any>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: browserStorage,
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: true,
    },
  }
);
