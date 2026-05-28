export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession, createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(request as unknown as Request);
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createSupabaseAdminClient();
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

    const formattedItems = (items || []).map((item: Record<string, unknown>) => {
      const profiles = item.profiles as { full_name?: string; display_name?: string; email?: string } | null;
      return {
        id: item.id,
        type: item.type,
        therapist_id: item.therapist_id,
        therapist_name: profiles?.full_name || profiles?.display_name,
        therapist_email: profiles?.email,
        url: item.url,
        reason: item.reason,
        flagged_at: item.flagged_at,
        status: item.status,
        admin_notes: item.admin_notes,
        reviewed_at: item.reviewed_at,
      };
    });

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
