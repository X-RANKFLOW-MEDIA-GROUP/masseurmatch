import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { setSessionCookie } from "@/app/api/_lib/session";
import { withSetCookie } from "@/app/api/_lib/http";
import { envAny } from "@/app/api/_lib/env";

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

  // Ensure profile exists (for new OTP users)
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingProfile) {
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      user.phone ||
      "User";

    await supabase.from("profiles").insert({
      user_id: user.id,
      full_name: fullName,
      display_name: fullName,
      status: "draft",
      is_active: false,
      contact_methods: [],
      share_email: false,
    });
  }

  // Get role (check after profile creation to ensure consistency)
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  // Create role if it doesn't exist (for new OTP users)
  const typedRoleRow = roleRow as { role: string } | null;
  let role: "admin" | "provider" | "client" | null = (typedRoleRow?.role as "admin" | "provider" | "client" | null) ?? null;
  if (!role) {
    await supabase.from("user_roles").insert({
      user_id: user.id,
      role: "provider",
    });
    role = "provider";
  }

  const cookie = setSessionCookie({
    userId: user.id,
    email: user.email || user.phone || "",
    role,
  });

  return withSetCookie(NextResponse.json({ ok: true }), cookie);
}
