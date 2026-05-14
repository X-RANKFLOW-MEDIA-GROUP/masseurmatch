import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { setSessionCookie } from "@/app/api/_lib/session";
import { ensureUserProfileAndRole, type AppRole } from "@/app/api/_lib/supabase-server";

type SessionRole = AppRole | null;

function getSupabaseUrl() {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ""
  );
}

function getAnonKey() {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ""
  );
}

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function sanitizeRedirect(next: string | null): string {
  const fallback = "/pro/dashboard";
  if (!next) return fallback;
  // Must start with "/" and not "//" (protocol-relative URL attack)
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirect(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", origin));
  }

  const supabaseUrl = getSupabaseUrl();
  const anonKey = getAnonKey();
  const serviceKey = getServiceRoleKey();

  if (!supabaseUrl || !anonKey) {
    return NextResponse.redirect(new URL("/login?error=config", origin));
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session?.user) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", origin));
  }

  const user = data.session.user;
  let role: SessionRole = null;
  let profileCreated = false;
  let fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : user.email?.split("@")[0] || "there";

  if (serviceKey) {
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const defaultRole: AppRole = "provider";
    const ensured = await ensureUserProfileAndRole(user, {
      defaultRole,
    });

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
  }

  const response = NextResponse.redirect(new URL(next, origin));
  response.headers.append(
    "Set-Cookie",
    setSessionCookie({
      userId: user.id,
      email: user.email ?? "",
      role,
    }),
  );

  return response;
}

function buildWelcomeHtml(name: string): string {
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#FCFBF8;font-family:Arial,sans-serif;color:#4A4F5C">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FCFBF8;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#FFFFFF;border:1px solid #ECE4E4;border-radius:14px;overflow:hidden">
        <tr><td style="background:#0B1F3A;padding:22px 28px 24px">
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
          <a href="https://masseurmatch.com/signup/plan" style="display:inline-block;background:#FF8A1F;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:12px 24px;border-radius:8px">Complete Your Profile</a>
        </td></tr>
        <tr><td style="padding:0 28px 20px;font-size:12px;color:#71717a;line-height:1.5">
          You received this because you created a MasseurMatch account. <a href="{{unsubscribe_url}}" style="color:#1E4B8F">Unsubscribe</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
