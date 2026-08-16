export const dynamic = "force-dynamic";
import React from "react";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";
import { sendEmail } from "@/app/api/_lib/email";
import PhotoApprovedEmail from "@/emails/PhotoApprovedEmail";

const PENDING_BUCKET = "pending-photos";
const PUBLIC_BUCKET = "therapist-photos";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminSession(request);
    const { id: photoId } = await params;
    const adminClient = createSupabaseAdminClient();

    const { data: photo, error: fetchError } = await (adminClient as any)
      .from("profile_photos")
      .select("id, profile_id, user_id, storage_bucket, storage_path, url")
      .eq("id", photoId)
      .maybeSingle();

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!photo) throw new RouteError(404, "Photo not found.");

    let publicUrl = photo.url ?? null;
    if (photo.storage_bucket === PENDING_BUCKET && photo.storage_path) {
      const { data: blob, error: downloadError } = await adminClient.storage
        .from(PENDING_BUCKET)
        .download(photo.storage_path);
      if (downloadError || !blob) throw new RouteError(500, "Pending photo could not be read from private storage.");

      const { error: uploadError } = await adminClient.storage
        .from(PUBLIC_BUCKET)
        .upload(photo.storage_path, blob, { contentType: blob.type || "application/octet-stream", upsert: false });
      if (uploadError) throw new RouteError(500, "Approved photo could not be published.");

      const { data: publicData } = adminClient.storage.from(PUBLIC_BUCKET).getPublicUrl(photo.storage_path);
      publicUrl = publicData?.publicUrl ?? null;
      if (!publicUrl) {
        await adminClient.storage.from(PUBLIC_BUCKET).remove([photo.storage_path]);
        throw new RouteError(500, "Approved photo did not receive a public URL.");
      }
    }

    const { error: updateError } = await (adminClient as any)
      .from("profile_photos")
      .update({
        moderation_status: "approved",
        moderation_reason: "admin_approved",
        ...(photo.storage_bucket === PENDING_BUCKET
          ? { storage_bucket: PUBLIC_BUCKET, url: publicUrl }
          : {}),
      })
      .eq("id", photoId);

    if (updateError) {
      if (photo.storage_bucket === PENDING_BUCKET && photo.storage_path) {
        await adminClient.storage.from(PUBLIC_BUCKET).remove([photo.storage_path]);
      }
      throw new RouteError(500, updateError.message);
    }

    if (photo.storage_bucket === PENDING_BUCKET && photo.storage_path) {
      await adminClient.storage.from(PENDING_BUCKET).remove([photo.storage_path]);
    }

    await adminClient.from("admin_actions").insert({
      action: "approve_photo",
      action_type: "approve_photo",
      target_table: "profile_photos",
      admin_id: admin.userId,
      target_user_id: photo.user_id,
      target_profile_id: photo.profile_id,
      metadata: { photoId },
    });

    await recordAuditLog(admin.userId, "approve_photo", "profile_photo", photoId, {
      profileId: photo.profile_id,
    });

    if (photo.profile_id) {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("email_address")
        .eq("id", photo.profile_id)
        .maybeSingle();

      if (profile?.email_address) {
        sendEmail({
          to: profile.email_address,
          subject: "Your photo has been approved on MasseurMatch",
          react: React.createElement(PhotoApprovedEmail, {
            dashboardUrl: "https://masseurmatch.com/pro/dashboard",
          }),
        }).catch((err) => console.error("[api/admin/photo/approve] Email send failed:", err));
      }
    }

    return json({ ok: true, photoId, status: "approved" });
  } catch (error) {
    return errorResponse(error);
  }
}
