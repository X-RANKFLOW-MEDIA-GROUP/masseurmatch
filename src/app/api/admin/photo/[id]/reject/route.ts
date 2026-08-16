export const dynamic = "force-dynamic";
import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";

const schema = z.object({ reason: z.string().min(1).optional() });
const STORAGE_PUBLIC_MARKER = "/storage/v1/object/public/therapist-photos/";

function getSupabaseStorageObjectKey(storagePath: string | null) {
  const value = storagePath?.trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) return value.replace(/^\/+/, "");

  try {
    const pathname = new URL(value).pathname;
    const markerIndex = pathname.indexOf(STORAGE_PUBLIC_MARKER);
    if (markerIndex < 0) return null;
    return decodeURIComponent(pathname.slice(markerIndex + STORAGE_PUBLIC_MARKER.length));
  } catch {
    return null;
  }
}

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
      .from("profile_photos")
      .select("id, profile_id, user_id, storage_path")
      .eq("id", photoId)
      .maybeSingle();

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!photo) throw new RouteError(404, "Photo not found.");

    const rejectionReason = body.reason || "admin_rejected";
    const { error: updateError } = await adminClient
      .from("profile_photos")
      .update({
        moderation_status: "rejected",
        moderation_reason: rejectionReason,
      })
      .eq("id", photoId);

    if (updateError) throw new RouteError(500, updateError.message);

    const objectKey = getSupabaseStorageObjectKey(photo.storage_path);
    if (objectKey) {
      const { error: storageError } = await adminClient.storage
        .from("therapist-photos")
        .remove([objectKey]);
      if (storageError) {
        console.warn("[api/admin/photo/reject] Storage cleanup failed:", storageError.message);
      }
    }

    await adminClient.from("admin_actions").insert({
      action: "reject_photo",
      action_type: "reject_photo",
      target_table: "profile_photos",
      admin_id: admin.userId,
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
