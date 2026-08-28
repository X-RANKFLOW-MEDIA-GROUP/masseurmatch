export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession, createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

type QueueFilter =
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested"
  | "hidden"
  | "missing_id"
  | "missing_phone"
  | "paid_hidden"
  | "all";

const STATUS_FILTER: Record<string, string> = {
  pending: "pending_approval",
  approved: "approved",
  rejected: "rejected",
  changes_requested: "changes_requested",
};

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(request as unknown as Request);
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const status = (request.nextUrl.searchParams.get("status") || "pending") as QueueFilter;

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
        state,
        status,
        profile_status,
        visibility_status,
        subscription_tier,
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
      .order("submitted_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false });

    if (status === "hidden") {
      query = query.eq("visibility_status", "hidden");
    } else if (status === "missing_id") {
      query = query.eq("visibility_status", "public").eq("is_verified_identity", false);
    } else if (status === "missing_phone") {
      query = query.eq("visibility_status", "public").eq("is_verified_phone", false);
    } else if (status === "paid_hidden") {
      query = query.eq("visibility_status", "hidden").in("subscription_tier", ["standard", "pro", "elite"]);
    } else if (status !== "all") {
      query = query.eq("status", STATUS_FILTER[status] ?? status);
    }

    const { data: profiles, error } = await query.limit(100);
    if (error) throw error;

    return NextResponse.json({ ok: true, profiles: profiles || [] });
  } catch (error) {
    console.error("[api/admin/approvals] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch approvals" },
      { status: 500 }
    );
  }
}
