export const dynamic = "force-dynamic";
import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";

const schema = z.object({ reason: z.string().min(1).optional() });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminSession(request);
    const { id: photoId } = await params;
    const body = await parseJsonBody(request, schema);
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
        status: "rejected",
        approval_status: "rejected",
        rejection_reason: body.reason || "admin_rejected",
      })
      .eq("id", photoId);

    if (updateError) throw new RouteError(500, updateError.message);

    await adminClient.from("admin_actions").insert({
      action: "reject_photo",
      target_table: "profile_photos",
      admin_id: admin.userId,
      action_type: "reject_photo",
      target_user_id: photo.user_id,
      target_profile_id: photo.profile_id,
      reason: body.reason || null,
      metadata: { photoId },
    });

    await recordAuditLog(admin.userId, "reject_photo", "profile_photo", photoId, {
      profileId: photo.profile_id,
      reason: body.reason,
    });

    return json({ ok: true, photoId, status: "rejected" });
  } catch (error) {
    return errorResponse(error);
  }
}
