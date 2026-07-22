import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/integrations/supabase/types";
import {
  SUPABASE_PUBLIC_URL,
  SUPABASE_PUBLIC_ANON_KEY,
} from "@/integrations/supabase/client";

export type AppRole = "admin" | "provider" | "client" | null;

export interface EdgeSession {
  userId: string;
  email: string | null;
  role: AppRole;
}

function normalizeRole(value: unknown): AppRole {
  if (value === "admin") return "admin";
  if (value === "provider" || value === "therapist" || value === "masseur") {
    return "provider";
  }
  if (value === "client") return "client";
  return null;
}

/**
 * Refreshes the Supabase auth session at the edge and returns the verified
 * user alongside a response carrying any rotated auth cookies.
 *
 * The role is read from `app_metadata` (server-writable only, so it is safe to
 * trust for routing) which the auth API routes keep in sync with the
 * `user_roles` table.
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  session: EdgeSession | null;
}> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    SUPABASE_PUBLIC_URL,
    SUPABASE_PUBLIC_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { response, session: null };
  }

  const metadataRole =
    normalizeRole((user.app_metadata as Record<string, unknown> | undefined)?.role) ??
    normalizeRole((user.user_metadata as Record<string, unknown> | undefined)?.role);

  return {
    response,
    session: {
      userId: user.id,
      email: user.email ?? null,
      role: metadataRole,
    },
  };
}
