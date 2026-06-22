export const dynamic = "force-dynamic";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminSession(request);
    const { id: photoId } = await params;
    const adminClient = createSupabaseAdminClient();

    const { data: photo, error: fetchError } = await adminClient
      .from("therapist_photos")
      .select("id, profile_id, user_id")
      .eq("id", photoId)
      .maybeSingle();

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!photo) throw new RouteError(404, "Photo not found.");

    const { error: updateError } = await adminClient
      .from("therapist_photos")
      .update({
        status: "approved",
        approval_status: "approved",
      })
      .eq("id", photoId);

    if (updateError) throw new RouteError(500, updateError.message);

    await adminClient.from("admin_actions").insert({
      action: "approve_photo",
      action_type: "approve_photo",
      target_table: "profile_photos",
      admin_id: admin.userId,
      target_user_id: photo.user_id,
      target_profile_id: photo.profile_id,
      metadata: { photoId },
    });

    await recordAuditLog(admin.userId, "approve_photo", "profile_photo", photoId, {
      profileId: photo.profile_id,
    });

    return json({ ok: true, photoId, status: "approved" });
  } catch (error) {
    return errorResponse(error);
  }
}
