import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

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
    if (!profile) {
      return json({ ok: true, photos: [] });
    }

    const { data: photos, error } = await adminClient
      .from("profile_photos")
      .select("id, url, storage_path, is_primary, sort_order, moderation_status, moderation_reason, created_at")
      .eq("profile_id", profile.id)
      .order("sort_order", { ascending: true })
      .limit(100);

    if (error) throw new RouteError(500, error.message);

    return json({
      ok: true,
      photos: (photos ?? []).map((photo) => ({
        id: photo.id,
        url: photo.url || photo.storage_path || "",
        isPrimary: photo.is_primary === true,
        sortOrder: photo.sort_order ?? 0,
        status: photo.moderation_status ?? "pending",
        reason: photo.moderation_reason ?? null,
        createdAt: photo.created_at,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
