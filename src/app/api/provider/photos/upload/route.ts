import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const adminClient = createSupabaseAdminClient();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) throw new RouteError(400, "No file provided.");
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new RouteError(400, "Only JPEG, PNG, and WebP images are allowed.");
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new RouteError(400, "File size must be under 10 MB.");
    }

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id, display_name, full_name")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (profileError) throw new RouteError(500, profileError.message);
    if (!profile) throw new RouteError(404, "Profile not found.");

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const fileName = `${session.userId}/${Date.now()}.${ext}`;
    const bucket = "therapist-photos";

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await adminClient.storage
      .from(bucket)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[provider/photos/upload] Storage upload failed:", uploadError.message);
      throw new RouteError(503, "Photo storage is temporarily unavailable. Please try again.");
    }

    const { data: urlData } = adminClient.storage.from(bucket).getPublicUrl(fileName);
    const publicUrl = urlData?.publicUrl ?? "";

    if (!publicUrl) {
      await adminClient.storage.from(bucket).remove([fileName]);
      throw new RouteError(500, "The photo was uploaded but no public URL was generated.");
    }

    const { count, error: countError } = await adminClient
      .from("profile_photos")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id);

    if (countError) {
      await adminClient.storage.from(bucket).remove([fileName]);
      throw new RouteError(500, countError.message);
    }

    const sortOrder = count ?? 0;
    const isPrimary = sortOrder === 0;

    const { data: photoRow, error: insertError } = await (adminClient as any)
      .from("profile_photos")
      .insert({
        profile_id: profile.id,
        user_id: session.userId,
        storage_path: fileName,
        url: publicUrl,
        is_primary: isPrimary,
        sort_order: sortOrder,
        moderation_status: "pending",
        moderation_reason: "queued_for_ai_review",
      })
      .select("id, url, storage_path, is_primary, sort_order, moderation_status")
      .single();

    if (insertError || !photoRow) {
      await adminClient.storage.from(bucket).remove([fileName]);
      throw new RouteError(500, insertError?.message || "Could not register the uploaded photo.");
    }

    const snapshot = {
      photoId: photoRow.id,
      imageUrl: publicUrl,
      isPrimary,
      sortOrder,
      displayName: profile.display_name || profile.full_name || null,
      originalFileName: file.name,
    };

    const { error: queueError } = await (adminClient as any)
      .from("moderation_queue")
      .insert({
        content_type: "photo",
        profile_id: profile.id,
        user_id: session.userId,
        target_id: photoRow.id,
        item_type: "photo",
        source: "pro_photos",
        field_name: null,
        status: "pending",
        priority: "normal",
        moderation_provider: "sightengine",
        moderation_reason: "queued_for_ai_review",
        snapshot,
        ai_response: null,
      });

    if (queueError) {
      console.error("[provider/photos/upload] Could not create moderation queue item:", queueError.message);
    }

    const { data: moderationData, error: moderationError } = await adminClient.functions.invoke(
      "moderate-photo",
      {
        body: {
          photo_id: photoRow.id,
          image_url: publicUrl,
        },
      },
    );

    if (moderationError) {
      console.error("[provider/photos/upload] Automated moderation failed:", moderationError.message);
      await (adminClient as any)
        .from("profile_photos")
        .update({
          moderation_status: "pending",
          moderation_reason: "manual_review_required",
        })
        .eq("id", photoRow.id);
    }

    const status = moderationError
      ? "pending"
      : moderationData?.approved === true
        ? "approved"
        : "pending";

    return json({
      ok: true,
      photo: {
        id: photoRow.id,
        url: publicUrl,
        isPrimary: photoRow.is_primary ?? false,
        sortOrder: photoRow.sort_order ?? 0,
        status,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
