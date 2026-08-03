import { NextResponse } from "next/server";
import { getUserRole } from "@/app/api/_lib/supabase-server";
import { normalizeSessionRole } from "@/app/api/_lib/session";
import { isExpectedInvalidSessionError } from "@/lib/supabase/auth-errors";
import { createServerSupabase } from "@/lib/supabase/server";

function dashboardPathForRole(role: string | null | undefined) {
  if (role === "client") return "/search";
  if (role === "admin" || role === "provider") return "/pro/dashboard";
  return "/login";
}

function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Surrogate-Control", "no-store");
  return response;
}

function signedOutResponse() {
  return noStoreJson({ authenticated: false, dashboardPath: "/login" });
}

export async function GET() {
  const supabase = await createServerSupabase();

  let user;
  try {
    const authResult = await supabase.auth.getUser();

    if (authResult.error) {
      if (!isExpectedInvalidSessionError(authResult.error)) {
        console.error("[api/auth/me] Failed to verify session:", authResult.error);
      }
      return signedOutResponse();
    }

    user = authResult.data.user;
  } catch (error) {
    if (!isExpectedInvalidSessionError(error)) {
      console.error("[api/auth/me] Failed to verify session:", error);
    }
    return signedOutResponse();
  }

  if (!user) {
    return signedOutResponse();
  }

  // Prefer the app_metadata role (already verified with the user), but confirm
  // against the user_roles table so a manual role change takes effect at once.
  let role =
    normalizeSessionRole((user.app_metadata as Record<string, unknown> | undefined)?.role) ??
    null;
  try {
    const freshRole = await getUserRole(user.id);
    if (freshRole) role = freshRole;
  } catch {
    // Fall back to the metadata role if the DB lookup fails.
  }

  return noStoreJson({
    authenticated: true,
    user: { id: user.id, email: user.email, role },
    dashboardPath: dashboardPathForRole(role),
  });
}
