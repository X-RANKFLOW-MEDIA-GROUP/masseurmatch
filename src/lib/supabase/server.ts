import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/integrations/supabase/types";
import {
  SUPABASE_PUBLIC_URL,
  SUPABASE_PUBLIC_ANON_KEY,
} from "@/integrations/supabase/client";

/**
 * Cookie-bound Supabase server client for the current request.
 *
 * Uses the **anon key** so every query is enforced by Row Level Security and
 * runs as the signed-in user (read from the Supabase auth cookies). This is the
 * single source of truth for "who is making this request" — call
 * `supabase.auth.getUser()` on it to get a cryptographically verified user.
 *
 * For the rare server-only path that must bypass RLS (webhooks, cron, admin
 * mutations already gated by an admin check) use `createAdminClient` instead.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
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
            // Called from a Server Component that cannot mutate cookies. The
            // session is still refreshed by the middleware on the next request.
          }
        },
      },
    },
  );
}
