import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SUPABASE_PUBLIC_URL } from "@/integrations/supabase/client";

/**
 * Service-role Supabase client. **Bypasses Row Level Security.**
 *
 * Only ever import this from server-side code (route handlers, server actions,
 * webhooks, cron) that has already authorized the caller. Never return its raw
 * query results to an unauthenticated user, and never import it into a client
 * component. Prefer {@link createServerSupabase} (RLS-scoped, cookie-bound) for
 * anything that acts on behalf of the signed-in user.
 */
export function createAdminClient(): SupabaseClient<Database> {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    SUPABASE_PUBLIC_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
