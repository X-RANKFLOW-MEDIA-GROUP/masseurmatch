export const dynamic = "force-dynamic";
import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";

const PENDING_BUCKET = "pending-photos";
const PUBLIC_BUCKET = "therapist-photos";

const moderatePhotoSchema = z.object({
  photoId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

async function resolvePhotoUrl(adminClient: ReturnType<typeof createSupabaseAdminClient>, photo: any) {
  if (typeof photo.url === "string" && /^https?:\/\//i.test(photo.url)) return photo.url;
  if (photo.storage_bucket === PENDING_BUCKET && photo.storage_path) {
    const { data } = await adminClient.storage.from(PENDING_BUCKET).createSignedUrl(photo.storage_path, 600);
    return data?.signedUrl ?? "";
  }
  if (photo.storage_bucket === PUBLIC_BUCKET && photo.storage_path) {
    return adminClient.storage.from(PUBLIC_BUCKET).getPublicUrl(photo.storage_path).data?.publicUrl ?? "";
  }
  if (typeof photo.storage_path === "string" && /^https?:\/\//i.test(photo.storage_path)) return photo.storage_path;
  return "";
}

async function publishPending(adminClient: ReturnType<typeof createSupabaseAdminClient>, photo: any) {
  if (photo.storage_bucket !== PENDING_BUCKET || !photo.storage_path) return photo.url ?? null;
  const { data: blob, error: downloadError } = await adminClient.storage.from(PENDING_BUCKET).download(photo.storage_path);
  if (downloadError || !blob) throw new RouteError(500, "Pending photo could not be read from private storage.");
  const { error: uploadError } = await adminClient.storage.from(PUBLIC_BUCKET).upload(photo.storage_path, blob, {
    contentType: blob.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) throw new RouteError(500, "Approved photo could not be published.");
  const publicUrl = adminClient.storage.from(PUBLIC_BUCKET).getPublicUrl(photo.storage_path).data?.publicUrl ?? null;
  if (!publicUrl) {
    await adminClient.storage.from(PUBLIC_BUCKET).remove([photo.storage_path]);
    throw new RouteError(500, "Approved photo did not receive a public URL.");
  }
  return publicUrl;
}

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient();

    const { data: photos, error } = await (adminClient as any)
      .from("profile_photos")
      .select("id, profile_id, url, storage_bucket, storage_path, is_primary, sort_order, moderation_status, moderation_reason, created_at, profiles!profile_photos_profile_id_fkey(id, display_name, full_name, city)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw new RouteError(500, error.message);

    const mapped = await Promise.all((photos ?? []).map(async (p: any) => ({
      id: p.id,
      profileId: p.profile_id,
      url: await resolvePhotoUrl(adminClient, p),
      position: p.sort_order ?? 0,
      moderationStatus: p.moderation_status,
      moderationReason: p.moderation_reason,
      createdAt: p.created_at,
      profile: p.profiles ?? null,
    })));

    return json({ ok: true, photos: mapped });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    const body = await parseJsonBody(request, moderatePhotoSchema);
    const adminClient = createSupabaseAdminClient();

    const { data: photo, error: fetchError } = await (adminClient as any)
      .from("profile_photos")
      .select("id, profile_id, storage_bucket, storage_path, url")
      .eq("id", body.photoId)
      .maybeSingle();

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!photo) throw new RouteError(404, "Photo not found.");

    const approved = body.action === "approve";
    let publicUrl = photo.url ?? null;

    if (approved) {
      publicUrl = await publishPending(adminClient, photo);
    } else if (
      photo.storage_path &&
      !/^https?:\/\//i.test(photo.storage_path) &&
      (photo.storage_bucket === PENDING_BUCKET || photo.storage_bucket === PUBLIC_BUCKET)
    ) {
      await adminClient.storage.from(photo.storage_bucket).remove([photo.storage_path]);
    }

    const newStatus = approved ? "approved" : "rejected";
    const { error: updateError } = await (adminClient as any)
      .from("profile_photos")
      .update({
        moderation_status: newStatus,
        moderation_reason: body.reason || (approved ? "admin_approved" : "admin_rejected"),
        ...(approved && photo.storage_bucket === PENDING_BUCKET
          ? { storage_bucket: PUBLIC_BUCKET, url: publicUrl }
          : !approved && photo.storage_bucket !== "external"
            ? { url: null }
            : {}),
      })
      .eq("id", body.photoId);

    if (updateError) {
      if (approved && photo.storage_bucket === PENDING_BUCKET && photo.storage_path) {
        await adminClient.storage.from(PUBLIC_BUCKET).remove([photo.storage_path]);
      }
      throw new RouteError(500, updateError.message);
    }

    if (approved && photo.storage_bucket === PENDING_BUCKET && photo.storage_path) {
      await adminClient.storage.from(PENDING_BUCKET).remove([photo.storage_path]);
    }

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
