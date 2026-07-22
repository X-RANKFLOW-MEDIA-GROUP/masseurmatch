import { errorResponse, json, parseJsonBody, withSetCookie } from "@/app/api/_lib/http";
import { RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { authLoginSchema } from "@/app/_lib/validation";
import { ensureUserProfileAndRole } from "@/app/api/_lib/supabase-server";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  checkBruteForce,
  recordFailedAttempt,
  clearFailedAttempts,
} from "@/app/api/_lib/brute-force";
import {
  generateCsrfToken,
  verifyCsrfToken,
  extractCsrfToken,
} from "@/app/api/_lib/csrf";

function dashboardPathForRole(role: string | null | undefined) {
  if (role === "client") return "/search";
  if (role === "admin" || role === "provider") return "/pro/dashboard";
  return "/pro/dashboard";
}

export async function GET() {
  try {
    const { token, cookie } = generateCsrfToken();
    return withSetCookie(json({ ok: true, csrfToken: token }), cookie);
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
      throw new RouteError(
        429,
        "Account temporarily locked due to too many failed login attempts.",
        "ACCOUNT_LOCKED",
      );
    }

    const csrfData = extractCsrfToken(request.headers);
    if (!csrfData || !verifyCsrfToken(csrfData.token, csrfData.cookieValue)) {
      throw new RouteError(403, "Invalid security token. Please try again.", "CSRF_INVALID");
    }

    // Sign in through the cookie-bound server client. Supabase writes the
    // auth cookies onto the response automatically — the session is
    // never handed back in the JSON body.
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: body.password,
    });

    if (error || !data.user) {
      recordFailedAttempt(email, request);
      if (error instanceof RouteError && error.status === 401) {
        if (error.code === "EMAIL_NOT_CONFIRMED") {
          throw error;
        }
        // Return specific error code for invalid credentials/token
        throw new RouteError(401, "Invalid email or password.", "AUTH_INVALID");
      }
      // Handle token-related errors
      if (error instanceof RouteError && error.message?.includes("token")) {
        throw new RouteError(401, "Invalid token please try again", "INVALID_TOKEN");
      }
      throw error;
    }

    clearFailedAttempts(email, request);

    const { role } = await ensureUserProfileAndRole(data.user, {
      defaultRole: "provider",
    });

    return json({
      ok: true,
      user: { id: data.user.id, email: data.user.email },
      role,
      redirect: dashboardPathForRole(role),
    });
  } catch (error) {
    if (error instanceof RouteError && error.status === 401) {
      return json(
        { ok: false, error: error.message, code: error.code || "AUTH_FAILED" },
        { status: 401 },
      );
    }
    if (error instanceof RouteError && error.status === 429) {
      return json({ ok: false, error: error.message, code: error.code }, { status: 429 });
    }
    if (error instanceof RouteError && error.status === 403) {
      return json({ ok: false, error: error.message, code: error.code }, { status: 403 });
    }
    return errorResponse(error);
  }
}
