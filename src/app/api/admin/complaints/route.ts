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
        admin_notes
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

    const profileIds = [
      ...new Set(
        (complaints ?? [])
          .map((complaint) => complaint.reported_profile_id)
          .filter((profileId): profileId is string => Boolean(profileId)),
      ),
    ];

    const profilesById = new Map<
      string,
      { id: string; full_name: string | null; display_name: string | null }
    >();

    if (profileIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, display_name")
        .in("id", profileIds);

      if (profilesError) {
        throw profilesError;
      }

      for (const profile of profiles ?? []) {
        profilesById.set(profile.id, profile);
      }
    }

    const complaintsWithProfiles = (complaints ?? []).map((complaint) => ({
      ...complaint,
      profiles: complaint.reported_profile_id
        ? profilesById.get(complaint.reported_profile_id) ?? null
        : null,
    }));

    return NextResponse.json({
      ok: true,
      complaints: complaintsWithProfiles,
    });
  } catch (error) {
    console.error("[api/admin/complaints] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}
