import { errorResponse, json, parseJsonBody, withSetCookie } from "@/app/api/_lib/http";
import { setSessionCookie } from "@/app/api/_lib/session";
import { RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { authRegisterSchema } from "@/app/_lib/validation";
import { verifyCsrfToken, extractCsrfToken } from "@/app/api/_lib/csrf";
import {
  createTherapistUser,
  ensureUserProfileAndRole,
} from "@/app/api/_lib/supabase-server";

export async function POST(request: Request) {
  try {
    // Limit automated account creation per IP.
    assertRateLimit(request, "auth-register", { limit: 5, windowMs: 60_000 });

    // Validate CSRF token for account creation
    const csrfData = extractCsrfToken(request.headers);
    if (!csrfData || !verifyCsrfToken(csrfData.token, csrfData.cookieValue)) {
      throw new RouteError(403, "Invalid security token. Please try again.", "CSRF_INVALID");
    }

    const body = await parseJsonBody(request, authRegisterSchema);
    const { origin } = new URL(request.url);
    const result = await createTherapistUser({
      ...body,
      emailRedirectTo: `${origin}/api/auth/callback?next=/pro/onboard`,
    });
    const { role } = await ensureUserProfileAndRole(result.user, {
      defaultRole: "provider",
      fallbackName: body.fullName,
    });

    const response = json({
      ok: true,
      user: {
        id: result.user.id,
        email: result.user.email,
      },
      role,
      session: result.session
        ? {
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        }
        : null,
      requiresEmailConfirmation: !result.session,
      message: result.session
        ? "Account created. You can continue onboarding now."
        : "Check your email to confirm your account before continuing.",
    });

    if (!result.session) {
      return response;
    }

    return withSetCookie(
      response,
      setSessionCookie({
        userId: result.user.id,
        email: result.user.email ?? body.email,
        role,
      }),
    );
  } catch (error) {
    if (error instanceof RouteError && error.status === 400) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("duplicate")) {
        return json(
          { ok: false, error: "An account with this email already exists. Please sign in instead.", code: "USER_EXISTS" },
          { status: 409 },
        );
      }
    }
    return errorResponse(error);
  }
}
