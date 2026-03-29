import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/pro/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", origin));
  }

  const supabaseUrl = getSupabaseUrl();
  const anonKey = getAnonKey();
  const serviceKey = getServiceRoleKey();

  if (!supabaseUrl || !anonKey) {
    return NextResponse.redirect(new URL("/login?error=config", origin));
  }

  // Exchange OAuth code for session
  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session?.user) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", origin));
  }

  const user = data.session.user;

  let isNewUser = false;

  if (!serviceKey) {
    console.error("[OAuth callback] SUPABASE_SERVICE_ROLE_KEY is not configured");
    return NextResponse.redirect(new URL("/login?error=config", origin));
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Ensure profile + role exist (for new OAuth users)
  const { data: existingProfile, error: profileLookupError } = await adminClient
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileLookupError) {
    console.error("[OAuth callback] Failed to query existing profile:", profileLookupError);
    return NextResponse.redirect(new URL("/login?error=profile_setup_failed", origin));
  }

  if (!existingProfile) {
    isNewUser = true;
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";

    const { error: profileError } = await adminClient.from("profiles").insert({
      user_id: user.id,
      full_name: fullName,
      display_name: fullName,
      status: "draft",
      is_active: false,
      contact_methods: [],
      share_email: false,
    });

    if (profileError) {
      console.error("[OAuth callback] Failed to insert profile (attempt 1):", profileError);
      const { error: retryError } = await adminClient.from("profiles").upsert({
        user_id: user.id,
        full_name: fullName,
        display_name: fullName,
        status: "draft",
        is_active: false,
        contact_methods: [],
        share_email: false,
      }, { onConflict: "user_id" });

      if (retryError) {
        console.error("[OAuth callback] Failed to insert profile (retry):", retryError);
        return NextResponse.redirect(new URL("/login?error=profile_setup_failed", origin));
      }
    }
  }

  const { data: existingRole, error: roleLookupError } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleLookupError) {
    console.error("[OAuth callback] Failed to query existing role:", roleLookupError);
  }

  if (!existingRole) {
    const { error: roleError } = await adminClient.from("user_roles").insert({
      user_id: user.id,
      role: "provider",
    });

    if (roleError) {
      console.error("[OAuth callback] Failed to insert user role (attempt 1):", roleError);
      const { error: retryError } = await adminClient.from("user_roles").upsert({
        user_id: user.id,
        role: "provider",
      }, { onConflict: "user_id" });

      if (retryError) {
        console.error("[OAuth callback] Failed to insert user role (retry):", retryError);
        return NextResponse.redirect(new URL("/login?error=profile_setup_failed", origin));
      }
    }
  }

  // Queue welcome email for new OAuth users
  if (isNewUser) {
    try {
      await adminClient.from("lifecycle_email_queue").insert({
        user_id: user.id,
        recipient_email: user.email,
        recipient_name: user.user_metadata?.full_name || user.email?.split("@")[0],
        segment: "new_signup",
        campaign_key: "welcome_post_signup",
        flow_key: "post_signup",
        template_key: "welcome_v1",
        send_category: "transactional",
        subject: "Welcome to MasseurMatch! 🎉",
        body_html: buildWelcomeHtml(user.user_metadata?.full_name || "there"),
        body_text: `Welcome to MasseurMatch! Complete your profile to start getting discovered.`,
        scheduled_for: new Date().toISOString(),
        status: "pending",
        idempotency_key: `welcome:${user.id}:${new Date().toISOString().slice(0, 10)}`,
      });
    } catch {
      // Best effort — don't block the auth flow
    }
  }

  // Set the server-side mm_session cookie via the login API
  // We redirect with a token that the client can pick up
  const { createHmac } = await import("node:crypto");
  const sessionSecret =
    process.env.MM_SESSION_SECRET ||
    process.env.SESSION_SECRET ||
    "dev-only-masseurmatch-session-secret";

  const { data: roleRow, error: finalRoleFetchError } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle<{ role: string }>();

  if (finalRoleFetchError) {
    console.error("[OAuth callback] Failed to fetch role for session cookie:", finalRoleFetchError);
  }

  const role = roleRow?.role ?? (isNewUser ? "provider" : null);

  if (!role) {
    console.error("[OAuth callback] Could not resolve role for user:", user.id);
    return NextResponse.redirect(new URL("/login?error=role_not_found", origin));
  }

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const payload = Buffer.from(
    JSON.stringify({ userId: user.id, email: user.email, role, expiresAt }),
    "utf8"
  ).toString("base64url");
  const signature = createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  const signedValue = `${payload}.${signature}`;

  const isProduction = process.env.NODE_ENV === "production";
  const cookieParts = [
    `mm_session=${encodeURIComponent(signedValue)}`,
    `Max-Age=${30 * 24 * 60 * 60}`,
    "Path=/",
    "SameSite=Lax",
    "HttpOnly",
  ];
  if (isProduction) cookieParts.push("Secure");

  const redirectPath = isNewUser ? "/pro/onboard" : next;
  const response = NextResponse.redirect(new URL(redirectPath, origin));
  response.headers.append("Set-Cookie", cookieParts.join("; "));
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
            <li><strong>Complete your profile</strong> — Add photos, bio, and services</li>
            <li><strong>Set your availability</strong> — Let clients know when you're available</li>
            <li><strong>Add your details</strong> — Build trust with a complete profile</li>
            <li><strong>Choose a plan</strong> — Boost visibility with a paid plan</li>
          </ol>
        </td></tr>
        <tr><td align="center" style="padding:0 28px 24px">
          <a href="https://masseurmatch.com/pro/onboard" style="display:inline-block;background:#FF8A1F;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:12px 24px;border-radius:8px">Complete Your Profile</a>
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
