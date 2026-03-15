import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/mm/lib/session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  clearSessionCookie(response);
  return response;
}
