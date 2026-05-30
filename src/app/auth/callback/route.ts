import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { setSessionCookie } from "@/app/api/_lib/session";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/pro/dashboard";
  const safeNext =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/pro/dashboard";

  if (!code) {
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

  const { data: sessionData, error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (sessionError || !sessionData?.user) {
    console.error("[auth/callback] error:", sessionError?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const user = sessionData.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as "admin" | "provider" | "client" | null) ?? null;

  const sessionCookieHeader = setSessionCookie({
    userId: user.id,
    email: user.email ?? "",
    role,
  });

  const redirectResponse = NextResponse.redirect(`${origin}${safeNext}`);
  redirectResponse.headers.append("Set-Cookie", sessionCookieHeader);
  return redirectResponse;
}
