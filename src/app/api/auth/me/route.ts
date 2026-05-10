import { NextResponse } from "next/server";
import { getRequestSession } from "@/app/api/_lib/session";

function dashboardPathForRole(role: string | null | undefined) {
  if (role === "admin") return "/admin";
  if (role === "client") return "/client/dashboard";
  return "/pro/dashboard";
}

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ authenticated: false, dashboardPath: "/login" });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      email: session.email,
      role: session.role,
    },
    dashboardPath: dashboardPathForRole(session.role),
  });
}
