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

function mapSupabaseAuthError(error: unknown): RouteError {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("email not confirmed")) {
    return new RouteError(
      401,
      "Check your email to confirm your account before continuing.",
      "EMAIL_NOT_CONFIRMED",
    );
  }

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid email or password") ||
    message.includes("user not found")
  ) {
    return new RouteError(401, "Invalid email or password.", "AUTH_INVALID");
  }

  if (message.includes("rate limit") || message.includes("too many requests")) {
    return new RouteError(429, "Too many login attempts. Please try again shortly.", "AUTH_RATE_LIMITED");
  }

  return new RouteError(503, "Sign in is temporarily unavailable. Please try again.", "AUTH_UNAVAILABLE");
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

    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: body.password,
    });

    if (error || !data.user) {
      recordFailedAttempt(email, request);
      throw mapSupabaseAuthError(error);
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
    if (error instanceof RouteError && [401, 403, 429, 503].includes(error.status)) {
      return json(
        { ok: false, error: error.message, code: error.code || "AUTH_FAILED" },
        { status: error.status },
      );
    }
    return errorResponse(error);
  }
}
