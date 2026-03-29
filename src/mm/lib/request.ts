import type { SessionUser } from "@/mm/types";
import { readSessionToken } from "@/mm/lib/auth-token";
import { SESSION_COOKIE_NAME } from "@/mm/lib/session";

export async function getRequestSession(request: Request): Promise<SessionUser | null> {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));

  return readSessionToken(match?.split("=")[1]);
}
