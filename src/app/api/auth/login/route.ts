import { errorResponse, json, parseJsonBody, withSetCookie } from "@/app/api/_lib/http";
import { setSessionCookie } from "@/app/api/_lib/session";
import { RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { authLoginSchema } from "@/app/_lib/validation";
import {
  ensureUserProfileAndRole,
  verifyPasswordWithRetry,
} from "@/app/api/_lib/supabase-server";
import { checkBruteForce, recordFailedAttempt, clearFailedAttempts } from "@/app/api/_lib/brute-force";
import { generateCsrfToken, verifyCsrfToken, extractCsrfToken } from "@/app/api/_lib/csrf";

export async function GET(request: Request) {
  try {
    const { token, cookie } = generateCsrfToken();
    return withSetCookie(
      json({
        ok: true,
        csrfToken: token,
      }),
      cookie
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "auth-login", { limit: 10, windowMs: 60_000 });
    const body = await parseJsonBody(request, authLoginSchema);
    const email = body.email.trim().toLowerCase();

    const { isLocked } = checkBruteForce(email, request);
    if (isLocked) {
      throw new RouteError(429, "Account temporarily locked due to too many failed login attempts.", "ACCOUNT_LOCKED");
    }

    const csrfData = extractCsrfToken(request.headers);
    if (!csrfData || !verifyCsrfToken(csrfData.token, csrfData.cookieValue)) {
      throw new RouteError(403, "Invalid security token. Please try again.", "CSRF_INVALID");
    }

    let sessionData;
    try {
      sessionData = await verifyPasswordWithRetry(email, body.password, 3);
    } catch (error) {
      recordFailedAttempt(email, request);
      if (error instanceof RouteError && error.status === 401) {
        if (error.code === "EMAIL_NOT_CONFIRMED") {
          throw error;
        }
        throw new RouteError(401, "Invalid email or password.", "AUTH_INVALID");
      }
      throw error;
    }

    clearFailedAttempts(email, request);

    const { user, session } = sessionData;
    const { role } = await ensureUserProfileAndRole(user, {
      defaultRole: "provider",
    });

    const response = json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
      },
      role,
      session: session
        ? {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }
        : null,
    });

    return withSetCookie(
      response,
      setSessionCookie({
        userId: user.id,
        email: user.email ?? body.email,
        role,
      }),
    );
  } catch (error) {
    if (error instanceof RouteError && error.status === 401) {
      return json(
        { ok: false, error: error.message, code: error.code || "AUTH_FAILED" },
        { status: 401 }
      );
    }
    if (error instanceof RouteError && error.status === 429) {
      return json({ ok: false, error: error.message, code: error.code }, { status: 429 });
    }
    return errorResponse(error);
  }
}
