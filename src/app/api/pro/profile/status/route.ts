import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getSetCookie().map((cookie) => {
            const [name, ...rest] = cookie.split("=");
            return { name, value: rest.join("=") };
          });
        },
        setAll() {},
      },
    }
  );

  try {
    // Get the current user's profile
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        display_name,
        full_name,
        status,
        submitted_at,
        reviewed_at,
        admin_notes,
        completion_percentage,
        is_verified_identity
      `
      )
      .eq("user_id", user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { ok: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      profile: {
        id: profile.id,
        display_name: profile.display_name,
        full_name: profile.full_name,
        status: profile.status || "draft",
        submitted_at: profile.submitted_at,
        reviewed_at: profile.reviewed_at,
        admin_notes: profile.admin_notes,
        completion_percentage: profile.completion_percentage || 0,
        is_verified_identity: profile.is_verified_identity || false,
      },
    });
  } catch (error) {
    console.error("[api/pro/profile/status] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch profile status" },
      { status: 500 }
    );
  }
}
