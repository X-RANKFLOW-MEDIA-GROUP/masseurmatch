import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { setSessionCookie } from "@/app/api/_lib/session";
import { withSetCookie } from "@/app/api/_lib/http";
import { envAny } from "@/app/api/_lib/env";
import { ensureUserProfileAndRole } from "@/app/api/_lib/supabase-server";

/**
 * POST /api/auth/sync-session
 *
 * Called client-side after OTP verification to create the mm_session cookie.
 * Expects: { access_token: string }
 */
export async function POST(request: NextRequest) {
  let body: { access_token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const accessToken = body.access_token;
  if (!accessToken || typeof accessToken !== "string") {
    return NextResponse.json({ error: "Missing access_token" }, { status: 400 });
  }

  const supabaseUrl = envAny(
    ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"],
    ""
  );
  const serviceKey = envAny(["SUPABASE_SERVICE_ROLE_KEY"], "");

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Validate the access token with Supabase
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { role } = await ensureUserProfileAndRole(user, {
    defaultRole: "provider",
  });

  const cookie = setSessionCookie({
    userId: user.id,
    email: user.email || user.phone || "",
    role,
  });

  return withSetCookie(NextResponse.json({ ok: true }), cookie);
}
