import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession(request);
    const { id: photoId } = await params;
    const adminClient = createSupabaseAdminClient();

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (profileError) throw new RouteError(500, profileError.message);
    if (!profile) throw new RouteError(404, "Profile not found.");

    const { data: photo, error: fetchError } = await (adminClient as any)
      .from("profile_photos")
      .select("id, profile_id, user_id, storage_bucket, storage_path")
      .eq("id", photoId)
      .eq("profile_id", profile.id)
      .eq("user_id", session.userId)
      .maybeSingle();

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!photo) throw new RouteError(404, "Photo not found or access denied.");

    const storageBucket = String(photo.storage_bucket || "external");
    if (
      photo.storage_path &&
      !/^https?:\/\//i.test(photo.storage_path) &&
      (storageBucket === "pending-photos" || storageBucket === "therapist-photos")
    ) {
      const { error: storageError } = await adminClient.storage
        .from(storageBucket)
        .remove([photo.storage_path]);

      if (storageError) {
        console.warn("[provider/photos/delete] Storage cleanup failed:", storageError.message);
      }
    }

    const { error: deleteError } = await adminClient
      .from("profile_photos")
      .delete()
      .eq("id", photoId)
      .eq("profile_id", profile.id)
      .eq("user_id", session.userId);

    if (deleteError) throw new RouteError(500, deleteError.message);

    await adminClient
      .from("moderation_queue")
      .delete()
      .eq("item_type", "photo")
      .eq("target_id", photoId);

    return json({ ok: true, deleted: photoId });
  } catch (error) {
    return errorResponse(error);
  }
}
