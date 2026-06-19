export const dynamic = "force-dynamic";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";

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

    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        is_verified_identity: true,
        verification_status: "verified",
        identity_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    if (updateError) throw new RouteError(500, updateError.message);

    await adminClient.from("admin_actions").insert({
      action: "verify_identity",
      target_table: "profiles",
      admin_id: admin.userId,
      action_type: "verify_identity",
      target_user_id: profile.user_id,
      target_profile_id: profileId,
      reason: null,
    });

    await recordAuditLog(admin.userId, "verify_identity", "profile", profileId, null);

    return json({ ok: true, profileId, verified: true });
  } catch (error) {
    return errorResponse(error);
  }
}
