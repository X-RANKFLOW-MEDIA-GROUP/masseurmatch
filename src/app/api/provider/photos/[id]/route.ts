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

    // Verify ownership
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (!profile) throw new RouteError(404, "Profile not found.");

    const { data: photo, error: fetchError } = await adminClient
      .from("therapist_photos")
      .select("id, storage_path")
      .eq("id", photoId)
      .eq("user_id", session.userId)
      .maybeSingle();

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!photo) throw new RouteError(404, "Photo not found or access denied.");

    // Attempt to remove from storage (best-effort)
    if (photo.storage_path) {
      await adminClient.storage.from("therapist-photos").remove([photo.storage_path]);
    }

    const { error: deleteError } = await adminClient
      .from("therapist_photos")
      .delete()
      .eq("id", photoId)
      .eq("user_id", session.userId);

    if (deleteError) throw new RouteError(500, deleteError.message);

    return json({ ok: true, deleted: photoId });
  } catch (error) {
    return errorResponse(error);
  }
}
