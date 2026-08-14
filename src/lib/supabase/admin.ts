import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

/**
 * Service-role Supabase client. **Bypasses Row Level Security.**
 *
 * Only ever import this from server-side code (route handlers, server actions,
 * webhooks, cron, internal jobs, scripts) that has already authorized the
 * caller. Never return its raw query results to an unauthenticated user, and
 * never import it into a client component, React hook, shared browser module,
 * or middleware.
 *
 * Prefer a cookie-bound, RLS-scoped client (createServerSupabase) for anything
 * that acts on behalf of the signed-in user.
 */
const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Missing server Supabase environment variables (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).",
  );
}

export const supabaseAdmin: SupabaseClient<Database> = createClient(
  url,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
);

/**
 * Compatibility alias for callers that previously imported createAdminClient().
 * New code should import `supabaseAdmin` directly.
 */
export function createAdminClient(): SupabaseClient<Database> {
  return supabaseAdmin;
}
