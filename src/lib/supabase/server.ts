import { cookies } from "next/headers";
import { createServerClient as createSsrServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  SUPABASE_PUBLIC_URL,
  SUPABASE_PUBLIC_ANON_KEY,
} from "@/integrations/supabase/client";

/** Cookie-bound Supabase server client scoped by the signed-in user's RLS. */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createSsrServerClient<Database>(
    SUPABASE_PUBLIC_URL,
    SUPABASE_PUBLIC_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot always write cookies; middleware refreshes them.
          }
        },
      },
    },
  );
}

/** Compatibility alias for existing server components. */
export const createServerClient = createServerSupabase;

/** Public anon server client for non-user-scoped legacy endpoints. */
export function createClient() {
  return createSupabaseClient<Database>(SUPABASE_PUBLIC_URL, SUPABASE_PUBLIC_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
