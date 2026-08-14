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
/**
 * Resolved on first use, never at module load. An import-time throw would take
 * down every route that merely imports this module — including in environments
 * that never call it, such as the CI `pnpm test` job, which runs with no
 * Supabase variables set at all.
 *
 * `SUPABASE_URL` is the preferred name; `NEXT_PUBLIC_SUPABASE_URL` is accepted
 * as a fallback because the two always hold the same value and existing
 * deployments (CI, Vercel) are configured with the public name. The service
 * role key has no fallback: it is a secret with exactly one correct source.
 */
function resolveAdminConfig(): { url: string; serviceRoleKey: string } {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing server Supabase environment variables (SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY).",
    );
  }

  return { url, serviceRoleKey };
}

let cachedClient: SupabaseClient<Database> | null = null;

export function createAdminClient(): SupabaseClient<Database> {
  if (!cachedClient) {
    const { url, serviceRoleKey } = resolveAdminConfig();
    cachedClient = createClient<Database>(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  return cachedClient;
}

/**
 * Convenience binding for callers that prefer a client over a factory. Every
 * property access is forwarded to the lazily-created client, so importing this
 * module stays free of side effects.
 */
export const supabaseAdmin: SupabaseClient<Database> = new Proxy(
  {} as SupabaseClient<Database>,
  {
    get(_target, property) {
      const client = createAdminClient() as unknown as Record<string, unknown>;
      const value = client[property as string];
      return typeof value === "function" ? value.bind(client) : value;
    },
  },
);
