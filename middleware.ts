import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PRIVATE_PATH_PREFIXES = [
  "/admin",
  "/dashboard",
  "/login",
  "/register",
  "/forgot-password",
  "/auth",
  "/wireframes",
];

function startsWithPrivatePath(pathname: string) {
  return PRIVATE_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!startsWithPrivatePath(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");

  if (search.includes("token=") || search.includes("redirect=")) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/login/:path*",
    "/register/:path*",
    "/forgot-password/:path*",
    "/auth/:path*",
    "/wireframes/:path*",
  ],
};
