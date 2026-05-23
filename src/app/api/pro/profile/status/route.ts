import { NextRequest, NextResponse } from "next/server";
import { requireSession, createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export async function GET(request: NextRequest) {
  let session;
  try {
    session = await requireSession(request as unknown as Request);
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createSupabaseAdminClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, display_name, full_name, status, submitted_at, is_verified_identity, rejection_reason, bio, city, specialties, incall_price, outcall_price, approved_at, rejected_at")
      .eq("user_id", session.userId)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { ok: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    // Compute completion percentage client-side equivalent
    const checks = [
      Boolean(profile.display_name || profile.full_name),
      Boolean(profile.bio),
      Boolean(profile.city),
      Boolean((profile.specialties as string[] | null)?.length),
      Boolean(profile.incall_price || profile.outcall_price),
    ];
    const completion_percentage = Math.round((checks.filter(Boolean).length / checks.length) * 100);

    // Use the most recent review date available
    const reviewed_at = profile.approved_at || profile.rejected_at || null;

    return NextResponse.json({
      ok: true,
      profile: {
        id: profile.id,
        display_name: profile.display_name,
        full_name: profile.full_name,
        status: profile.status || "draft",
        submitted_at: profile.submitted_at,
        reviewed_at,
        admin_notes: profile.rejection_reason || null,
        completion_percentage,
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
