import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { EmailOtpType, User } from "@supabase/supabase-js";
import { assertRateLimit } from "@/app/_lib/security";
import { resolveAuthDestination, sanitizeRedirect } from "@/app/auth/callback/destination";
import { ensureUserProfileAndRole } from "@/app/api/_lib/supabase-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isExpectedInvalidSessionError } from "@/lib/supabase/auth-errors";
import { createServerSupabase } from "@/lib/supabase/server";

function failedAuthRedirect(origin: string, type: EmailOtpType | null) {
  if (type === "recovery") {
    return NextResponse.redirect(
      `${origin}/reset-password?error=access_denied&error_code=otp_expired`,
    );
  }
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

export async function GET(request: NextRequest) {
  assertRateLimit(request, "auth-callback", { limit: 30, windowMs: 60_000 });

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = sanitizeRedirect(searchParams.get("next"));

  // OAuth/PKCE arrives with ?code; email-link confirmations (signup, invite,
  // email_change, resend) arrive with ?token_hash&type and are verified with
  // verifyOtp(), which needs no PKCE code_verifier — so server-initiated
  // signups and cross-device clicks work.
  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  // Cookie-bound client: exchangeCodeForSession / verifyOtp write the Supabase
  // auth cookies onto the response automatically.
  const supabase = await createServerSupabase();
  let user: User | null = null;

  try {
    const authResult = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ type: type!, token_hash: tokenHash! });

    if (authResult.error) {
      if (!isExpectedInvalidSessionError(authResult.error)) {
        console.error("[auth/callback] error:", authResult.error.message);
      }
      return failedAuthRedirect(origin, type);
    }

    user = authResult.data?.user ?? null;
  } catch (error) {
    if (!isExpectedInvalidSessionError(error)) {
      console.error("[auth/callback] error:", error);
    }
    return failedAuthRedirect(origin, type);
  }

  if (!user?.email) {
    return failedAuthRedirect(origin, type);
  }

  // Password recovery: the OTP is now verified and a recovery session cookie is
  // set on this response, so hand off to the reset form to collect the new
  // password. (Never route recovery to the dashboard.)
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  let profileCreated = false;
  let fullName = user.email.split("@")[0] || "there";
  try {
    const ensured = await ensureUserProfileAndRole(user, { defaultRole: "provider" });
    profileCreated = ensured.profileCreated;
    fullName = ensured.fullName;
  } catch (err) {
    console.error("[auth/callback] failed to ensure profile:", err);
    return NextResponse.redirect(`${origin}/login?error=profile_creation_failed`);
  }

  // Queue a one-time welcome email for genuinely new accounts. Best-effort.
  if (profileCreated) {
    try {
      const admin = createAdminClient();
      await admin.from("lifecycle_email_queue").insert({
        user_id: user.id,
        recipient_email: user.email,
        recipient_name: fullName,
        segment: "new_signup",
        campaign_key: "welcome_post_signup",
        flow_key: "post_signup",
        template_key: "welcome_v1",
        send_category: "transactional",
        subject: "Welcome to MasseurMatch!",
        body_html: buildWelcomeHtml(fullName),
        body_text:
          "Welcome to MasseurMatch! Complete your profile to start getting discovered.",
        scheduled_for: new Date().toISOString(),
        // The lifecycle worker claims only queued rows. Legacy pending rows are
        // intentionally quarantined by the schema repair and must stay distinct
        // from new welcome emails.
        status: "queued",
        idempotency_key: `welcome:${user.id}:${new Date().toISOString().slice(0, 10)}`,
      });
    } catch {
      // Email queue issues must never block authentication.
    }
  }

  const destination = resolveAuthDestination({ profileCreated, next });
  return NextResponse.redirect(`${origin}${destination}`);
}

function buildWelcomeHtml(name: string): string {
  return `<!doctype html>
<html lang="en-US">
<body style="margin:0;padding:0;background:#FFFFFF;font-family:Arial,sans-serif;color:#4A4F5C">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FFFFFF;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#FFFFFF;border:1px solid #ECE4E4;border-radius:14px;overflow:hidden">
        <tr><td style="background:#111111;padding:22px 28px 24px">
          <h1 style="margin:0;font-size:28px;color:#FFFFFF">Welcome to MasseurMatch!</h1>
          <p style="margin:8px 0 0;font-size:15px;color:#DCE6FF">Hi ${name}, your account is ready.</p>
        </td></tr>
        <tr><td style="padding:24px 28px">
          <p style="font-size:15px;line-height:1.6">Here's how to get started:</p>
          <ol style="padding-left:20px;font-size:14px;line-height:1.8">
            <li><strong>Complete your profile</strong> - Add photos, bio, and services</li>
            <li><strong>Set your availability</strong> - Let clients know when you're available</li>
            <li><strong>Get verified</strong> - Build trust with identity verification</li>
            <li><strong>Choose a plan</strong> - Boost visibility with a paid plan</li>
          </ol>
        </td></tr>
        <tr><td align="center" style="padding:0 28px 24px">
          <a href="https://www.masseurmatch.com/signup/plan" style="display:inline-block;background:#8B1E2D;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:12px 24px;border-radius:8px">Complete Your Profile</a>
        </td></tr>
        <tr><td style="padding:0 28px 20px;font-size:12px;color:#71717a;line-height:1.5">
          You received this because you created a MasseurMatch account. <a href="{{unsubscribe_url}}" style="color:#8B1E2D">Unsubscribe</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
