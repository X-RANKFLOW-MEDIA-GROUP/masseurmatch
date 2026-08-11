export const dynamic = "force-dynamic";

import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { getCanonicalIdentityStatusForUser } from "@/app/_lib/identity-verification";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminSession(request);
    const { id: profileId } = await params;
    const adminClient = createSupabaseAdminClient();

    const { data: profile, error: fetchError } = await adminClient
      .from("profiles")
      .select("id, user_id")
      .eq("id", profileId)
      .maybeSingle();

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!profile) throw new RouteError(404, "Profile not found.");
    if (!profile.user_id) throw new RouteError(409, "Profile is not linked to a user account.");

    const userId = profile.user_id;
    const canonicalStatus = await getCanonicalIdentityStatusForUser(userId);
    if (canonicalStatus !== "verified") {
      throw new RouteError(409, "Identity cannot be marked verified until the latest identity review is approved.");
    }

    const verifiedAt = new Date().toISOString();
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        is_verified_identity: true,
        verification_status: "verified",
        identity_verified_at: verifiedAt,
        updated_at: verifiedAt,
      })
      .eq("id", profileId);

    if (updateError) throw new RouteError(500, updateError.message);

    await adminClient.from("admin_actions").insert({
      action: "sync_identity_verification",
      action_type: "sync_identity_verification",
      target_table: "profiles",
      admin_id: admin.userId,
      target_user_id: userId,
      target_profile_id: profileId,
      reason: "Synced from approved identity verification record",
    });

    await recordAuditLog(
      admin.userId,
      "sync_identity_verification",
      "profile",
      profileId,
      { source: "identity_verifications", status: canonicalStatus },
    );

    return json({ ok: true, profileId, verified: true, source: "identity_verification" });
  } catch (error) {
    return errorResponse(error);
  }
}
