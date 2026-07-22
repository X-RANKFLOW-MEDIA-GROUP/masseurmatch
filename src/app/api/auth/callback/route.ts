import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Compatibility shim. The canonical OAuth / email-confirmation handler is
 * `/auth/callback`. Confirmation links sent before this consolidation still
 * point here, so forward them (query intact) to the real handler.
 */
export function GET(request: NextRequest) {
  const { search, origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/auth/callback${search}`);
}
