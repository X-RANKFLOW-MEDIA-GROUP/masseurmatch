import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/integrations/supabase/types";
import { getPublicSupabaseConfig } from "@/lib/supabase/public-env";

type AppRole = "admin" | "provider" | "client" | null;
type AuthenticatorAssuranceLevel = "aal1" | "aal2" | null;

export interface EdgeSession {
  userId: string;
  email: string | null;
  role: AppRole;
  aal: AuthenticatorAssuranceLevel;
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
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  session: EdgeSession | null;
}> {
  let response = NextResponse.next({ request });
  const { url, key } = getPublicSupabaseConfig();

  const supabase = createServerClient<Database>(url, key, {
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
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { response, session: null };
  }

  const metadataRole =
    normalizeRole((user.app_metadata as Record<string, unknown> | undefined)?.role) ??
    normalizeRole((user.user_metadata as Record<string, unknown> | undefined)?.role);

  // Fail closed for privileged routes when assurance cannot be determined.
  // Non-admin users are not gated on AAL by the middleware.
  const { data: assurance, error: assuranceError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const aal: AuthenticatorAssuranceLevel = assuranceError
    ? null
    : assurance.currentLevel ?? null;

  return {
    response,
    session: {
      userId: user.id,
      email: user.email ?? null,
      role: metadataRole,
      aal,
    },
  };
}
