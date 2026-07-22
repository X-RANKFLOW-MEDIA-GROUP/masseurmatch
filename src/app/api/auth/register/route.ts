import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { authRegisterSchema } from "@/app/_lib/validation";
import { verifyCsrfToken, extractCsrfToken } from "@/app/api/_lib/csrf";
import { ensureUserProfileAndRole } from "@/app/api/_lib/supabase-server";
import { createServerSupabase } from "@/lib/supabase/server";

function existingAccountResponse(email: string) {
  return json(
    {
      ok: false,
      error: "An account with this email already exists. Log in or reset your password to continue.",
      code: "USER_EXISTS",
      loginPath: `/login?email=${encodeURIComponent(email)}&account_exists=1`,
      resetPath: `/forgot-password?email=${encodeURIComponent(email)}`,
    },
    { status: 409 },
  );
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "auth-register", { limit: 5, windowMs: 60_000 });

    const csrfData = extractCsrfToken(request.headers);
    if (!csrfData || !verifyCsrfToken(csrfData.token, csrfData.cookieValue)) {
      throw new RouteError(403, "Invalid security token. Please try again.", "CSRF_INVALID");
    }

    const body = await parseJsonBody(request, authRegisterSchema);
    const email = body.email.trim().toLowerCase();
    const { origin } = new URL(request.url);
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: body.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/signup/plan`,
        data: { full_name: body.fullName, role: "provider" },
      },
    });

    if (error || !data.user) {
      const message = error?.message?.toLowerCase() ?? "";
      if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
        return existingAccountResponse(email);
      }
      throw new RouteError(400, error?.message || "Could not create account.");
    }

    // Supabase intentionally obscures re-signup attempts for confirmed emails.
    // An empty identities array is the reliable signal that the account exists.
    if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return existingAccountResponse(email);
    }

    const { role } = await ensureUserProfileAndRole(data.user, {
      defaultRole: "provider",
      fallbackName: body.fullName,
    });

    return json({
      ok: true,
      user: { id: data.user.id, email: data.user.email },
      role,
      requiresEmailConfirmation: !data.session,
      message: data.session
        ? "Account created. You can continue onboarding now."
        : "Check your email to confirm your account before continuing.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
