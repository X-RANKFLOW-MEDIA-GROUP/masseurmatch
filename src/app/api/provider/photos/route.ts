import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

const PENDING_BUCKET = "pending-photos";

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const adminClient = createSupabaseAdminClient();

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (profileError) throw new RouteError(500, profileError.message);
    if (!profile) return json({ ok: true, photos: [] });

    const { data: photos, error } = await (adminClient as any)
      .from("profile_photos")
      .select("id, url, storage_bucket, storage_path, is_primary, sort_order, moderation_status, moderation_reason, created_at")
      .eq("profile_id", profile.id)
      .order("sort_order", { ascending: true })
      .limit(100);

    if (error) throw new RouteError(500, error.message);

    const mapped = await Promise.all((photos ?? []).map(async (photo: any) => {
      let photoUrl = typeof photo.url === "string" ? photo.url : "";
      if (!photoUrl && photo.storage_bucket === PENDING_BUCKET && photo.storage_path) {
        const { data: signed } = await adminClient.storage.from(PENDING_BUCKET).createSignedUrl(photo.storage_path, 600);
        photoUrl = signed?.signedUrl ?? "";
      }
      if (!photoUrl && typeof photo.storage_path === "string" && /^https?:\/\//i.test(photo.storage_path)) {
        photoUrl = photo.storage_path;
      }

      return {
        id: photo.id,
        url: photoUrl,
        isPrimary: photo.is_primary === true,
        sortOrder: photo.sort_order ?? 0,
        status: photo.moderation_status ?? "pending",
        reason: photo.moderation_reason ?? null,
        createdAt: photo.created_at,
      };
    }));

    return json({ ok: true, photos: mapped });
  } catch (error) {
    return errorResponse(error);
  }
}
