import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { setSessionCookie } from "@/app/api/_lib/session";
import { ensureUserProfileAndRole, type AppRole } from "@/app/api/_lib/supabase-server";
import { assertRateLimit } from "@/app/_lib/security";

type SessionRole = AppRole | null;

function sanitizeRedirect(next: string | null): string {
  const fallback = "/pro/dashboard";
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

export async function GET(request: NextRequest) {
  assertRateLimit(request, "api-auth-callback", { limit: 30, windowMs: 60_000 });

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirect(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", origin));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session?.user) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", origin));
  }

  const user = data.session.user;

  if (!user.email) {
    console.error("[api/auth/callback] user missing email");
    return NextResponse.redirect(new URL("/login?error=auth_callback_failed", origin));
  }

  let role: SessionRole = null;
  let profileCreated = false;
  let fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : user.email.split("@")[0] || "there";

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const defaultRole: AppRole = "provider";
    try {
      const ensured = await ensureUserProfileAndRole(user, { defaultRole });
      role = ensured.role as SessionRole;
      profileCreated = ensured.profileCreated;
      fullName = ensured.fullName;

      if (profileCreated) {
        try {
          await adminClient.from("lifecycle_email_queue").insert({
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
            body_text: "Welcome to MasseurMatch! Complete your profile to start getting discovered.",
            scheduled_for: new Date().toISOString(),
            status: "pending",
            idempotency_key: `welcome:${user.id}:${new Date().toISOString().slice(0, 10)}`,
          });
        } catch {
          // Best-effort only. Email queue issues should not block auth.
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : "";
      console.error("[api/auth/callback] failed to ensure profile:", {
        userId: user.id,
        email: user.email,
        message: errorMessage,
        stack: errorStack,
      });
      return NextResponse.redirect(new URL("/login?error=profile_creation_failed", origin));
    }
  }

  // New profiles should complete onboarding; existing users go where they requested.
  const destination = profileCreated ? "/pro/onboard" : next;
  const response = NextResponse.redirect(new URL(destination, origin));
  response.headers.append(
    "Set-Cookie",
    setSessionCookie({
      userId: user.id,
      email: user.email,
      role,
    }),
  );

  return response;
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
