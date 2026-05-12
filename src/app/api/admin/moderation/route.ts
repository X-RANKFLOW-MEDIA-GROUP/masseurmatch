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
      | "all";

    let query = supabase
      .from("photo_moderations")
      .select(
        `
        id,
        type,
        therapist_id,
        profiles!therapist_id(full_name, display_name, email),
        url,
        reason,
        flagged_at,
        status,
        admin_notes,
        reviewed_at
      `
      )
      .order("flagged_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: items, error } = await query.limit(50);

    if (error) {
      throw error;
    }

    const formattedItems = (items || []).map((item: any) => ({
      id: item.id,
      type: item.type,
      therapist_id: item.therapist_id,
      therapist_name: item.profiles?.full_name || item.profiles?.display_name,
      therapist_email: item.profiles?.email,
      url: item.url,
      reason: item.reason,
      flagged_at: item.flagged_at,
      status: item.status,
      admin_notes: item.admin_notes,
      reviewed_at: item.reviewed_at,
    }));

    return NextResponse.json({
      ok: true,
      items: formattedItems,
    });
  } catch (error) {
    console.error("[api/admin/moderation] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch flagged items" },
      { status: 500 }
    );
  }
}
