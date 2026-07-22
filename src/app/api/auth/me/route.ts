import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/app/api/_lib/supabase-server";
import { normalizeSessionRole } from "@/app/api/_lib/session";

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

export async function GET() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return noStoreJson({ authenticated: false, dashboardPath: "/login" });
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
