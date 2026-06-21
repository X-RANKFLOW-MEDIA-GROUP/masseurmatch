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
      .select("id")
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

    let publicUrl = "";
    if (uploadError) {
      // Storage not configured or bucket missing — store as pending without URL
      console.warn("[provider/photos/upload] Storage upload failed:", uploadError.message);
      publicUrl = "";
    } else {
      const { data: urlData } = adminClient.storage.from(bucket).getPublicUrl(fileName);
      publicUrl = urlData?.publicUrl ?? "";
    }

    // Count existing photos to determine sort_order
    const { count } = await adminClient
      .from("therapist_photos")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.userId);

    const sortOrder = count ?? 0;
    const photoType = sortOrder === 0 ? "profile" : "gallery";

    const { data: photoRow, error: insertError } = await adminClient
      .from("therapist_photos")
      .insert({
        therapist_profile_id: profile.id,
        user_id: session.userId,
        profile_id: profile.id,
        storage_path: fileName,
        public_url: publicUrl,
        photo_type: photoType,
        sort_order: sortOrder,
        status: "pending_review",
        mime_type: file.type,
        file_size: file.size,
      })
      .select("id, public_url, storage_path, photo_type, sort_order, status")
      .single();

    if (insertError) throw new RouteError(500, insertError.message);

    return json({
      ok: true,
      photo: {
        id: photoRow.id,
        url: photoRow.public_url || photoRow.storage_path || "",
        isPrimary: photoRow.photo_type === "profile",
        sortOrder: photoRow.sort_order ?? 0,
        status: photoRow.status ?? "pending_review",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
