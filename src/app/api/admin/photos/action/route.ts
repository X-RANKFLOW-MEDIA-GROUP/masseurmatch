export const dynamic = "force-dynamic";

import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import { assertRateLimit } from "@/app/_lib/security";

const schema = z.object({
  photoId: z.string().uuid(),
  action: z.enum(["approve", "reject", "set_primary", "delete", "reprocess"]),
  reason: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    assertRateLimit(request, "admin-photo-action", { limit: 60, windowMs: 60_000 });
    const body = await parseJsonBody(request, schema);
    const supabase = createSupabaseAdminClient();

    const { data: photo, error: photoError } = await supabase
      .from("profile_photos")
      .select("id,profile_id,user_id,storage_path,url,is_primary,sort_order")
      .eq("id", body.photoId)
      .maybeSingle();

    if (photoError) throw new RouteError(500, photoError.message);
    if (!photo) throw new RouteError(404, "Photo not found.");

    const imageUrl = photo.url || photo.storage_path || null;
    const now = new Date().toISOString();

    if (body.action === "set_primary") {
      const { error: resetError } = await supabase
        .from("profile_photos")
        .update({ is_primary: false })
        .eq("profile_id", photo.profile_id);
      if (resetError) throw new RouteError(500, resetError.message);

      const { error } = await supabase
        .from("profile_photos")
        .update({ is_primary: true })
        .eq("id", body.photoId);
      if (error) throw new RouteError(500, error.message);
    }

    if (body.action === "approve" || body.action === "reject") {
      const approved = body.action === "approve";
      const { error } = await supabase
        .from("profile_photos")
        .update({
          moderation_status: approved ? "approved" : "rejected",
          moderation_reason: body.reason || (approved ? "admin_approved" : "admin_rejected"),
        })
        .eq("id", body.photoId);
      if (error) throw new RouteError(500, error.message);

      await supabase
        .from("moderation_queue")
        .upsert({
          content_type: "photo",
          profile_id: photo.profile_id,
          user_id: photo.user_id,
          target_id: photo.id,
          item_type: "photo",
          source: "admin_people_crm",
          status: approved ? "approved" : "rejected",
          moderation_provider: "admin",
          moderation_reason: body.reason || (approved ? "admin_approved" : "admin_rejected"),
          reviewed_at: now,
          reviewed_by: admin.userId,
          snapshot: imageUrl ? { photoId: photo.id, imageUrl } : { photoId: photo.id },
        }, { onConflict: "target_id" });
    }

    if (body.action === "reprocess") {
      if (!imageUrl) throw new RouteError(400, "Photo has no image URL.");
      await supabase
        .from("profile_photos")
        .update({ moderation_status: "pending", moderation_reason: "queued_for_ai_review" })
        .eq("id", body.photoId);

      await supabase
        .from("moderation_queue")
        .upsert({
          content_type: "photo",
          profile_id: photo.profile_id,
          user_id: photo.user_id,
          target_id: photo.id,
          item_type: "photo",
          source: "admin_people_crm",
          status: "pending",
          moderation_provider: "sightengine",
          moderation_reason: "queued_for_ai_review",
          snapshot: { photoId: photo.id, imageUrl },
        }, { onConflict: "target_id" });

      const { error: invokeError } = await supabase.functions.invoke("moderate-photo", {
        body: { photo_id: photo.id, image_url: imageUrl },
      });
      if (invokeError) {
        await supabase
          .from("profile_photos")
          .update({ moderation_status: "pending", moderation_reason: "manual_review_required" })
          .eq("id", body.photoId);
        throw new RouteError(502, invokeError.message);
      }
    }

    if (body.action === "delete") {
      const { error } = await supabase.from("profile_photos").delete().eq("id", body.photoId);
      if (error) throw new RouteError(500, error.message);
      await supabase.from("moderation_queue").delete().eq("target_id", body.photoId);
    }

    await recordAuditLog(admin.userId, `photo_${body.action}`, "photo", body.photoId, {
      profileId: photo.profile_id,
      reason: body.reason || null,
    });

    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
