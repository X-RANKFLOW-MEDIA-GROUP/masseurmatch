import { NextResponse } from "next/server";
import { clearSessionCookie, getRequestSession } from "@/app/api/_lib/session";
import { getUserRole } from "@/app/api/_lib/supabase-server";

function dashboardPathForRole(role: string | null | undefined) {
  if (role === "client") return "/search";
  if (role === "admin" || role === "provider" || role === "therapist") return "/pro/dashboard";
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

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    const response = noStoreJson({ authenticated: false, dashboardPath: "/login" });
    response.headers.append("Set-Cookie", clearSessionCookie());
    return response;
  }

  // Always re-validate role from DB — cookie role can be stale after manual role changes
  let role = session.role;
  try {
    const freshRole = await getUserRole(session.userId);
    if (freshRole) role = freshRole;
  } catch {
    // Fall back to cookie role if DB lookup fails
  }

  return noStoreJson({
    authenticated: true,
    user: {
      id: session.userId,
      email: session.email,
      role,
    },
    dashboardPath: dashboardPathForRole(role),
  });
}
