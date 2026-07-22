import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { setSessionCookie } from "@/app/api/_lib/session";
import { ensureUserProfileAndRole } from "@/app/api/_lib/supabase-server";
import { assertRateLimit } from "@/app/_lib/security";

function sanitizeRedirect(next: string | null): string {
  const fallback = "/pro/dashboard";
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

export async function GET(request: NextRequest) {
  assertRateLimit(request, "auth-callback", { limit: 30, windowMs: 60_000 });

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = sanitizeRedirect(searchParams.get("next"));

  // OAuth/PKCE comes in with ?code; email-link confirmations come in with
  // ?token_hash&type and are verified via verifyOtp() (no PKCE verifier needed).
  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
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

  const { data: sessionData, error: sessionError } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ type: type!, token_hash: tokenHash! });

  if (sessionError || !sessionData?.user) {
    console.error("[auth/callback] error:", sessionError?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const user = sessionData.user;

  if (!user.email) {
    console.error("[auth/callback] user missing email");
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  let role: "admin" | "provider" | "client" | null = null;
  let isNewProfile = false;

  try {
    const ensured = await ensureUserProfileAndRole(user, { defaultRole: "provider" });
    role = ensured.role as "admin" | "provider" | "client" | null;
    isNewProfile = ensured.profileCreated;
  } catch (error) {
    console.error("[auth/callback] failed to ensure profile:", error);
    return NextResponse.redirect(`${origin}/login?error=profile_creation_failed`);
  }

  const sessionCookieHeader = setSessionCookie({
    userId: user.id,
    email: user.email,
    role,
  });

  // Redirect new OAuth users (new profile created) to onboarding,
  // unless they explicitly requested a different destination via the `next` param.
  const requestedOnboard = next === "/pro/onboard";
  const destination =
    isNewProfile && !requestedOnboard && (next === "/pro/dashboard" || next === "/dashboard")
      ? "/pro/onboard"
      : next;

  const redirectResponse = NextResponse.redirect(`${origin}${destination}`);
  redirectResponse.headers.append("Set-Cookie", sessionCookieHeader);
  return redirectResponse;
}
