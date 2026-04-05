import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";

const moderatePhotoSchema = z.object({
  photoId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient();

    const { data: photos, error } = await adminClient
      .from("profile_photos")
      .select("id, profile_id, storage_path, is_primary, sort_order, moderation_status, moderation_reason, created_at, profiles!profile_photos_profile_id_fkey(id, display_name, full_name, city)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      // If foreign key join fails, fall back to photos only
      const { data: fallbackPhotos, error: fallbackError } = await adminClient
        .from("profile_photos")
        .select("id, profile_id, storage_path, is_primary, sort_order, moderation_status, moderation_reason, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (fallbackError) throw new RouteError(500, fallbackError.message);

      return json({
        ok: true,
        photos: (fallbackPhotos ?? []).map((p: any) => ({
          id: p.id,
          profileId: p.profile_id,
          url: p.storage_path || "",
          position: p.sort_order ?? 0,
          moderationStatus: p.moderation_status,
          moderationReason: p.moderation_reason,
          createdAt: p.created_at,
          profile: null,
        })),
      });
    }

    return json({
      ok: true,
      photos: (photos ?? []).map((p: any) => ({
        id: p.id,
        profileId: p.profile_id,
        url: p.storage_path || "",
        position: p.sort_order ?? 0,
        moderationStatus: p.moderation_status,
        moderationReason: p.moderation_reason,
        createdAt: p.created_at,
        profile: p.profiles ?? null,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    const body = await parseJsonBody(request, moderatePhotoSchema);
    const adminClient = createSupabaseAdminClient();

    const { data: photo, error: fetchError } = await adminClient
      .from("profile_photos")
      .select("id, profile_id")
      .eq("id", body.photoId)
      .maybeSingle();

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!photo) throw new RouteError(404, "Photo not found.");

    const newStatus = body.action === "approve" ? "approved" : "rejected";

    const { error: updateError } = await adminClient
      .from("profile_photos")
      .update({
        moderation_status: newStatus,
        moderation_reason: body.reason || (body.action === "approve" ? "admin_approved" : "admin_rejected"),
      })
      .eq("id", body.photoId);

    if (updateError) throw new RouteError(500, updateError.message);

    await adminClient
      .from("moderation_queue")
      .update({
        status: newStatus,
        admin_reason: body.reason || null,
        resolved_by: admin.userId,
        resolved_at: new Date().toISOString(),
      })
      .eq("item_type", "photo")
      .eq("target_id", body.photoId)
      .eq("source", "pro_photos")
      .eq("status", "pending");

    await recordAuditLog(admin.userId, `photo_${body.action}`, "profile_photo", body.photoId, {
      profileId: photo.profile_id,
      reason: body.reason,
    });

    return json({ ok: true, action: body.action, photoId: body.photoId, status: newStatus });
  } catch (error) {
    return errorResponse(error);
  }
}
