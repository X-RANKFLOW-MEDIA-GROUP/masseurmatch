import { NextResponse } from "next/server";
import { clearSessionCookie, getRequestSession } from "@/app/api/_lib/session";

function dashboardPathForRole(role: string | null | undefined) {
  if (role === "admin") return "/admin";
  if (role === "client") return "/client/dashboard";
  if (role === "provider" || role === "therapist") return "/pro/dashboard";
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

  return noStoreJson({
    authenticated: true,
    user: {
      id: session.userId,
      email: session.email,
      role: session.role,
    },
    dashboardPath: dashboardPathForRole(session.role),
  });
}
