import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  try {
    const status = (request.nextUrl.searchParams.get("status") || "pending") as
      | "pending"
      | "approved"
      | "rejected"
      | "changes_requested"
      | "all";

    let query = supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        display_name,
        email,
        phone,
        city,
        status,
        created_at,
        submitted_at,
        reviewed_at,
        reviewed_by,
        admin_notes,
        is_verified_identity,
        is_verified_phone,
        profile_completion:completion_percentage
      `
      )
      .order("submitted_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: profiles, error } = await query.limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      profiles: profiles || [],
    });
  } catch (error) {
    console.error("[api/admin/approvals] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch approvals" },
      { status: 500 }
    );
  }
}
