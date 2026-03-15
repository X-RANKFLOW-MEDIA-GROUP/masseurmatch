import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { SessionUser } from "@/mm/types";
import { createSessionToken, readSessionToken } from "@/mm/lib/auth-token";
import { appUrl } from "@/mm/lib/env";

export const SESSION_COOKIE_NAME = "mm_session";

function shouldUseSecureCookies(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  try {
    return new URL(appUrl).protocol === "https:";
  } catch {
    return true;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return readSessionToken(token);
}

export async function setSessionCookie(response: NextResponse, user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: 0,
  });
}
