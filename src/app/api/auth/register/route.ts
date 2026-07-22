import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { authRegisterSchema } from "@/app/_lib/validation";
import { verifyCsrfToken, extractCsrfToken } from "@/app/api/_lib/csrf";
import { ensureUserProfileAndRole } from "@/app/api/_lib/supabase-server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // Limit automated account creation per IP.
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
      if (message.includes("already") || message.includes("registered")) {
        return json(
          {
            ok: false,
            error: "An account with this email already exists. Please sign in instead.",
            code: "USER_EXISTS",
          },
          { status: 409 },
        );
      }
      throw new RouteError(400, error?.message || "Could not create account.");
    }

    // Supabase obfuscates a re-signup of an existing confirmed email by
    // returning a user with an empty identities array and no session.
    if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return json(
        {
          ok: false,
          error: "An account with this email already exists. Please sign in instead.",
          code: "USER_EXISTS",
        },
        { status: 409 },
      );
    }

    const { role } = await ensureUserProfileAndRole(data.user, {
      defaultRole: "provider",
      fallbackName: body.fullName,
    });

    // When email confirmation is enabled, `session` is null and the auth
    // cookies are NOT set — the user must confirm first. When it is disabled,
    // signUp already wrote the (HttpOnly) session cookies onto the response.
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
