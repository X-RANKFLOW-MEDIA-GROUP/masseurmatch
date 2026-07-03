import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const adminClient = createSupabaseAdminClient();

    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (!profile) {
      return json({ ok: true, photos: [] });
    }

    const { data: photos, error } = await adminClient
      .from("therapist_photos")
      .select("id, storage_path, public_url, photo_type, sort_order, status, rejection_reason, created_at")
      .eq("user_id", session.userId)
      .order("sort_order", { ascending: true })
      .limit(100); // Most therapists won't exceed 100 photos

    if (error) throw new RouteError(500, error.message);

    return json({
      ok: true,
      photos: (photos ?? []).map((p) => ({
        id: p.id,
        url: p.public_url || p.storage_path || "",
        isPrimary: p.photo_type === "profile",
        sortOrder: p.sort_order ?? 0,
        status: p.status ?? "pending_review",
        reason: p.rejection_reason ?? null,
        createdAt: p.created_at,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
