import { errorResponse, json, parseJsonBody, toUserErrorMessage } from "@/app/api/_lib/http";
import { RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { authRegisterSchema } from "@/app/_lib/validation";
import { verifyCsrfToken, extractCsrfToken } from "@/app/api/_lib/csrf";
import {
  createSupabaseAdminClient,
  ensureUserProfileAndRole,
} from "@/app/api/_lib/supabase-server";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  REFERRAL_COOKIE_NAME,
  clearReferralCookieHeader,
  normalizeReferralCode,
} from "@/lib/referrals";

function readReferralCookie(request: Request) {
  const cookies = request.headers.get("cookie") ?? "";
  const pattern = new RegExp(`(?:^|;\\s*)${REFERRAL_COOKIE_NAME}=([^;]+)`);
  const match = cookies.match(pattern);
  const raw = match ? decodeURIComponent(match[1]) : undefined;
  return normalizeReferralCode(raw) ?? undefined;
}

async function claimReferral(userId: string, referralCode?: string) {
  if (!referralCode) return false;

  const admin = createSupabaseAdminClient();
  const { data, error } = await (admin.rpc as unknown as (
    name: string,
    params: Record<string, unknown>,
  ) => Promise<{ data: boolean | null; error: { message: string } | null }>)('claim_referral_signup', {
    p_referred_user_id: userId,
    p_referral_code: referralCode,
  });

  if (error) {
    console.error('[auth/register] referral attribution failed:', error.message);
    return false;
  }

  return data === true;
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "auth-register", { limit: 5, windowMs: 60_000 });

    const csrfData = extractCsrfToken(request.headers);
    if (!csrfData || !verifyCsrfToken(csrfData.token, csrfData.cookieValue)) {
      throw new RouteError(403, "Invalid security token. Please try again.", "CSRF_INVALID");
    }

    const body = await parseJsonBody(request, authRegisterSchema);
    const referralCode = normalizeReferralCode(body.referralCode) ?? readReferralCookie(request);
    const email = body.email.trim().toLowerCase();
    const { origin } = new URL(request.url);
    const verificationPath = "/signup/verify?autostart=1";

    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: body.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(verificationPath)}`,
        data: {
          full_name: body.fullName,
          role: "provider",
          referral_code: referralCode ?? null,
        },
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
      throw new RouteError(
        400,
        toUserErrorMessage(error?.message, "We couldn't create your account. Please try again."),
      );
    }

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

    const referralClaimed = await claimReferral(data.user.id, referralCode);

    const response = json({
      ok: true,
      user: { id: data.user.id, email: data.user.email },
      role,
      referralClaimed,
      requiresEmailConfirmation: !data.session,
      message: data.session
        ? "Account created. You can continue onboarding now."
        : "Check your email to confirm your account before continuing.",
    });

    response.headers.append("Set-Cookie", clearReferralCookieHeader());
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
