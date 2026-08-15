import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/integrations/supabase/types";
import { getPublicSupabaseConfig } from "@/lib/supabase/public-env";

/**
 * Cookie-bound Supabase server client for the current request.
 *
 * Uses the browser-safe publishable/anon key so every query is enforced by Row
 * Level Security and runs as the signed-in user from the Supabase auth cookies.
 * For server-only operations that intentionally bypass RLS, use createAdminClient.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  const { url, key } = getPublicSupabaseConfig();

  return createServerClient<Database>(url, key, {
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
          // Server Components cannot always mutate cookies. Middleware refreshes
          // the session on the next request.
        }
      },
    },
  });
}
