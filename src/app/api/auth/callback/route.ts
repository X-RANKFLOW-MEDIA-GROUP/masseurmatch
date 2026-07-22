import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Compatibility shim. The canonical OAuth / email-confirmation handler is
 * /auth/callback. Older confirmation links still point here, so forward them
 * with the original query string intact.
 */
export function GET(request: NextRequest) {
  const { search, origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/auth/callback${search}`);
}
