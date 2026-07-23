import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  createAdminClient,
} from "@/lib/supabase/admin";
import { ensureUserProfileAndRole } from "@/app/api/_lib/supabase-server";
import { assertRateLimit } from "@/app/_lib/security";

function sanitizeRedirect(next: string | null): string {
  const fallback = "/pro/dashboard";
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

// Build the /login redirect for a failed callback. When the provider (or
// Supabase) handed us an explicit reason, forward that real error so the user —
// and our logs — see what actually happened instead of a blanket failure. The
// login page renders `error_description` verbatim and maps `auth_callback_failed`
// to the friendly "clear your cookies and retry" copy.
function failureRedirect(origin: string, providerError: string | null): string {
  const query = providerError
    ? `error_description=${encodeURIComponent(providerError)}`
    : "error=auth_callback_failed";
  return `${origin}/login?${query}`;
}

export async function GET(request: NextRequest) {
  assertRateLimit(request, "auth-callback", { limit: 30, windowMs: 60_000 });

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = sanitizeRedirect(searchParams.get("next"));
  // Present when the provider/Supabase rejected the sign-in outright
  // (access_denied, misconfigured provider, expired link, …).
  const providerError =
    searchParams.get("error_description") ?? searchParams.get("error");

  // Cookie-bound client: exchangeCodeForSession / verifyOtp write the Supabase
  // auth cookies onto the response automatically.
  const supabase = await createServerSupabase();

  // OAuth/PKCE arrives with ?code; email-link confirmations (signup, invite,
  // email_change, resend) arrive with ?token_hash&type and are verified with
  // verifyOtp(), which needs no PKCE code_verifier — so server-initiated
  // signups and cross-device clicks work.
  if (!code && !(tokenHash && type)) {
    // A duplicate callback hit (browser prefetch, double navigation) can arrive
    // after the first request already consumed the single-use code and
    // established the session. If we're already signed in, send the user on
    // instead of showing a spurious "sign-in failed".
    const {
      data: { user: existing },
    } = await supabase.auth.getUser();
    if (existing?.email) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    if (providerError) {
      console.error("[auth/callback] provider error:", providerError);
    }
    return NextResponse.redirect(failureRedirect(origin, providerError));
  }

  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ type: type!, token_hash: tokenHash! });

  let user = data?.user ?? null;
  if (error || !user?.email) {
    // The single-use code may already have been redeemed by a duplicate
    // request (prefetch, double navigation, an impatient retry). If valid
    // session cookies are already present, treat this as a success rather than
    // punishing a user who is, in fact, signed in.
    const {
      data: { user: existing },
    } = await supabase.auth.getUser();
    if (existing?.email) {
      user = existing;
    } else {
      console.error("[auth/callback] exchange failed:", {
        message: error?.message ?? null,
        hasCode: Boolean(code),
        providerError: providerError ?? null,
      });
      return NextResponse.redirect(failureRedirect(origin, providerError));
    }
  }

  if (!user?.email) {
    return NextResponse.redirect(failureRedirect(origin, providerError));
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
        status: "pending",
        idempotency_key: `welcome:${user.id}:${new Date().toISOString().slice(0, 10)}`,
      });
    } catch {
      // Email queue issues must never block authentication.
    }
  }

  // New accounts continue the signup wizard; returning users go where they
  // asked (default: their dashboard).
  const destination = profileCreated ? "/signup/plan" : next;
  return NextResponse.redirect(`${origin}${destination}`);
}

function buildWelcomeHtml(name: string): string {
  return `<!doctype html>
<html lang="en">
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
          <a href="https://masseurmatch.com/signup/plan" style="display:inline-block;background:#8B1E2D;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:12px 24px;border-radius:8px">Complete Your Profile</a>
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
