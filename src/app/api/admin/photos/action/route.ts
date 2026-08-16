export const dynamic = "force-dynamic";

import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";
import { assertRateLimit } from "@/app/_lib/security";

const PENDING_BUCKET = "pending-photos";
const PUBLIC_BUCKET = "therapist-photos";

const schema = z.object({
  photoId: z.string().uuid(),
  action: z.enum(["approve", "reject", "set_primary", "delete", "reprocess"]),
  reason: z.string().trim().max(500).optional(),
});

async function publishPendingPhoto(supabase: ReturnType<typeof createSupabaseAdminClient>, photo: any) {
  if (photo.storage_bucket !== PENDING_BUCKET || !photo.storage_path) return photo.url || null;

  const { data: blob, error: downloadError } = await supabase.storage.from(PENDING_BUCKET).download(photo.storage_path);
  if (downloadError || !blob) throw new RouteError(500, "Pending photo could not be read from private storage.");

  const { error: uploadError } = await supabase.storage.from(PUBLIC_BUCKET).upload(photo.storage_path, blob, {
    contentType: blob.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) throw new RouteError(500, "Approved photo could not be published.");

  const { data } = supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(photo.storage_path);
  const publicUrl = data?.publicUrl ?? null;
  if (!publicUrl) {
    await supabase.storage.from(PUBLIC_BUCKET).remove([photo.storage_path]);
    throw new RouteError(500, "Approved photo did not receive a public URL.");
  }
  return publicUrl;
}

async function removeStoredPhoto(supabase: ReturnType<typeof createSupabaseAdminClient>, photo: any) {
  const bucket = String(photo.storage_bucket || "external");
  if (
    photo.storage_path &&
    !/^https?:\/\//i.test(photo.storage_path) &&
    (bucket === PENDING_BUCKET || bucket === PUBLIC_BUCKET)
  ) {
    const { error } = await supabase.storage.from(bucket).remove([photo.storage_path]);
    if (error) console.warn("[admin/photos/action] Storage cleanup failed:", error.message);
  }
}

async function getModerationUrl(supabase: ReturnType<typeof createSupabaseAdminClient>, photo: any) {
  if (typeof photo.url === "string" && /^https?:\/\//i.test(photo.url)) return photo.url;
  if (photo.storage_bucket === PENDING_BUCKET && photo.storage_path) {
    const { data, error } = await supabase.storage.from(PENDING_BUCKET).createSignedUrl(photo.storage_path, 300);
    if (error) throw new RouteError(500, "Could not create a private moderation URL.");
    return data?.signedUrl ?? null;
  }
  if (photo.storage_bucket === PUBLIC_BUCKET && photo.storage_path) {
    return supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(photo.storage_path).data?.publicUrl ?? null;
  }
  if (typeof photo.storage_path === "string" && /^https?:\/\//i.test(photo.storage_path)) return photo.storage_path;
  return null;
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    assertRateLimit(request, "admin-photo-action", { limit: 60, windowMs: 60_000 });
    const body = await parseJsonBody(request, schema);
    const supabase = createSupabaseAdminClient();

    const { data: photo, error: photoError } = await (supabase as any)
      .from("profile_photos")
      .select("id,profile_id,user_id,storage_bucket,storage_path,url,is_primary,sort_order")
      .eq("id", body.photoId)
      .maybeSingle();

    if (photoError) throw new RouteError(500, photoError.message);
    if (!photo) throw new RouteError(404, "Photo not found.");
    if (!photo.profile_id) throw new RouteError(409, "Photo is not linked to a profile.");

    const profileId = photo.profile_id;
    const now = new Date().toISOString();

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("id", profileId)
      .maybeSingle();
    if (!profile?.user_id) throw new RouteError(500, "Profile has no associated user.");

    if (body.action === "set_primary") {
      const { error: resetError } = await supabase.from("profile_photos").update({ is_primary: false }).eq("profile_id", profileId);
      if (resetError) throw new RouteError(500, resetError.message);
      const { error } = await supabase.from("profile_photos").update({ is_primary: true }).eq("id", body.photoId);
      if (error) throw new RouteError(500, error.message);
    }

    if (body.action === "approve") {
      const publicUrl = await publishPendingPhoto(supabase, photo);
      const { error } = await (supabase as any)
        .from("profile_photos")
        .update({
          moderation_status: "approved",
          moderation_reason: body.reason || "admin_approved",
          ...(photo.storage_bucket === PENDING_BUCKET ? { storage_bucket: PUBLIC_BUCKET, url: publicUrl } : {}),
        })
        .eq("id", body.photoId);
      if (error) {
        if (photo.storage_bucket === PENDING_BUCKET && photo.storage_path) await supabase.storage.from(PUBLIC_BUCKET).remove([photo.storage_path]);
        throw new RouteError(500, error.message);
      }
      if (photo.storage_bucket === PENDING_BUCKET && photo.storage_path) await supabase.storage.from(PENDING_BUCKET).remove([photo.storage_path]);

      await supabase.from("moderation_queue").upsert({
        content_type: "photo",
        profile_id: profileId,
        user_id: profile.user_id,
        target_id: photo.id,
        item_type: "photo",
        source: "admin_people_crm",
        status: "approved",
        moderation_provider: "admin",
        moderation_reason: body.reason || "admin_approved",
        resolved_at: now,
        resolved_by: admin.userId,
        snapshot: publicUrl ? { photoId: photo.id, imageUrl: publicUrl } : { photoId: photo.id },
      }, { onConflict: "target_id" });
    }

    if (body.action === "reject") {
      await removeStoredPhoto(supabase, photo);
      const { error } = await (supabase as any)
        .from("profile_photos")
        .update({
          moderation_status: "rejected",
          moderation_reason: body.reason || "admin_rejected",
          ...(photo.storage_bucket !== "external" ? { url: null } : {}),
        })
        .eq("id", body.photoId);
      if (error) throw new RouteError(500, error.message);

      await supabase.from("moderation_queue").upsert({
        content_type: "photo",
        profile_id: profileId,
        user_id: profile.user_id,
        target_id: photo.id,
        item_type: "photo",
        source: "admin_people_crm",
        status: "rejected",
        moderation_provider: "admin",
        moderation_reason: body.reason || "admin_rejected",
        resolved_at: now,
        resolved_by: admin.userId,
        snapshot: { photoId: photo.id },
      }, { onConflict: "target_id" });
    }

    if (body.action === "reprocess") {
      const imageUrl = await getModerationUrl(supabase, photo);
      if (!imageUrl) throw new RouteError(400, "Photo has no moderation source.");
      await supabase.from("profile_photos").update({ moderation_status: "pending", moderation_reason: "queued_for_ai_review" }).eq("id", body.photoId);
      await supabase.from("moderation_queue").upsert({
        content_type: "photo",
        profile_id: profileId,
        user_id: profile.user_id,
        target_id: photo.id,
        item_type: "photo",
        source: "admin_people_crm",
        status: "pending",
        moderation_provider: "sightengine",
        moderation_reason: "queued_for_ai_review",
        snapshot: photo.storage_bucket === PENDING_BUCKET
          ? { photoId: photo.id, storageBucket: PENDING_BUCKET, storagePath: photo.storage_path }
          : { photoId: photo.id, imageUrl },
      }, { onConflict: "target_id" });

      const { error: invokeError } = await supabase.functions.invoke("moderate-photo", { body: { photo_id: photo.id } });
      if (invokeError) {
        await supabase.from("profile_photos").update({ moderation_status: "pending", moderation_reason: "manual_review_required" }).eq("id", body.photoId);
        throw new RouteError(502, invokeError.message);
      }
    }

    if (body.action === "delete") {
      await removeStoredPhoto(supabase, photo);
      const { error } = await supabase.from("profile_photos").delete().eq("id", body.photoId);
      if (error) throw new RouteError(500, error.message);
      await supabase.from("moderation_queue").delete().eq("target_id", body.photoId);
    }

    await recordAuditLog(admin.userId, `photo_${body.action}`, "photo", body.photoId, {
      profileId,
      reason: body.reason || null,
    });

    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
