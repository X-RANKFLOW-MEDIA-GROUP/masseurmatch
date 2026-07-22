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
      | "changes_requested"
      | "all";

    // The submission flow writes status = "pending_approval"; the UI filter
    // says "pending". Map the filter to the real column values so submitted
    // profiles actually appear in the queue.
    const STATUS_FILTER: Record<string, string> = {
      pending: "pending_approval",
      approved: "approved",
      rejected: "rejected",
      changes_requested: "changes_requested",
    };

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
      query = query.eq("status", STATUS_FILTER[status] ?? status);
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
