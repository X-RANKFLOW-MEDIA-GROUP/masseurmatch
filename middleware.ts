import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  if (host === "admin.masseurmatch.com") {
    const url = request.nextUrl.clone();
    url.hostname = "www.masseurmatch.com";
    url.pathname = url.pathname === "/" ? "/admin" : url.pathname;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
