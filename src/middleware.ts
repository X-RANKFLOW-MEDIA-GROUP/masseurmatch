import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readSessionToken } from "@/mm/lib/auth-token";

const SESSION_COOKIE_NAME = "mm_session";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const session = await readSessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (pathname.startsWith("/pro")) {
    if (!session || session.role !== "therapist") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/pro/:path*", "/admin/:path*"],
};
