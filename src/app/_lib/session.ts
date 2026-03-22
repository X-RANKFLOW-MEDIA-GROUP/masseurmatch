import { RouteError } from "@/app/api/_lib/http";
import {
  clearSessionCookie,
  getRequestSession,
  setSessionCookie,
  type RequestSession,
} from "@/app/api/_lib/session";

export { clearSessionCookie, getRequestSession, setSessionCookie, type RequestSession };

export function requireRequestSession(request: Request): RequestSession {
  const session = getRequestSession(request);

  if (!session) {
    throw new RouteError(401, "Authentication required.");
  }

  return session;
}
