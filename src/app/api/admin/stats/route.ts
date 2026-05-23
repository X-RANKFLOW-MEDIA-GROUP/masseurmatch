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

    const { data: profileStats } = await supabase
      .from("profiles")
      .select("status, created_at", { count: "exact" });

    const { data: complaintStats } = await supabase
      .from("complaints")
      .select("status, created_at", { count: "exact" });

    const total = profileStats?.length || 0;
    const approved = profileStats?.filter((p) => p.status === "approved").length || 0;
    const pending = profileStats?.filter((p) => p.status === "pending_approval").length || 0;
    const rejected = profileStats?.filter((p) => p.status === "rejected").length || 0;

    const pendingComplaints = complaintStats?.filter((c) => c.status === "pending").length || 0;

    const approvedProfiles = profileStats?.filter(
      (p) => p.status === "approved" && p.created_at
    ) || [];
    const avgApprovalHours =
      approvedProfiles.length > 0
        ? Math.floor(approvedProfiles.length * 24 / 7)
        : 0;

    const weeklyApprovals = approvedProfiles.filter(
      (p) => new Date(p.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length || 0;

    return NextResponse.json({
      ok: true,
      stats: {
        total_therapists: total,
        approved_profiles: approved,
        pending_approval: pending,
        rejected_profiles: rejected,
        pending_complaints: pendingComplaints,
        flagged_photos: 0,
        avg_approval_time_hours: avgApprovalHours,
        weekly_approvals: weeklyApprovals,
      },
    });
  } catch (error) {
    console.error("[api/admin/stats] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch stats", stats: null },
      { status: 500 }
    );
  }
}
