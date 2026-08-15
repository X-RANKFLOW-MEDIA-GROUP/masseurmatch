import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

/**
 * Service-role Supabase client. Bypasses Row Level Security.
 *
 * Only import this from server-side code that has already authorized the
 * caller. Never import it into client components, hooks, shared browser code,
 * or middleware.
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
