import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({
            name,
            value,
          }));
        },
        setAll() {},
      },
    }
  );

  try {
    const status = (request.nextUrl.searchParams.get("status") || "pending") as
      | "pending"
      | "resolved"
      | "dismissed"
      | "all";

    let query = supabase
      .from("complaints")
      .select(
        `
        id,
        reporter_id,
        reported_profile_id,
        category,
        description,
        status,
        created_at,
        resolved_at,
        admin_notes,
        profiles!reported_profile_id(id, full_name, display_name)
      `
      )
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: complaints, error } = await query.limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      complaints: complaints || [],
    });
  } catch (error) {
    console.error("[api/admin/complaints] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}
