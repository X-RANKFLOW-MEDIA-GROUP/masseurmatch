export const dynamic = "force-dynamic";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient();

    const [
      { count: totalTherapists },
      { count: pendingProfiles },
      { count: pendingPhotos },
      { count: pendingVerifications },
      { count: suspendedUsers },
      { count: bannedUsers },
    ] = await Promise.all([
      adminClient.from("profiles").select("id", { count: "exact", head: true }),
      adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .in("profile_status", ["submitted", "under_review"]),
      adminClient
        .from("therapist_photos")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending_review"),
      adminClient
        .from("identity_verifications")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "processing", "reviewing"]),
      adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_suspended", true),
      adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_banned", true),
    ]);

    return json({
      ok: true,
      summary: {
        totalTherapists: totalTherapists ?? 0,
        pendingProfiles: pendingProfiles ?? 0,
        pendingPhotos: pendingPhotos ?? 0,
        pendingVerifications: pendingVerifications ?? 0,
        suspendedUsers: suspendedUsers ?? 0,
        bannedUsers: bannedUsers ?? 0,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
