import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const adminClient = createSupabaseAdminClient();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const docType = (formData.get("type") as string | null) ?? "professional_license";

    if (!file) throw new RouteError(400, "No file provided.");
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new RouteError(400, "Only JPEG, PNG, WebP, or PDF files are allowed.");
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new RouteError(400, "File must be under 10 MB.");
    }

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (profileError) throw new RouteError(500, profileError.message);
    if (!profile) throw new RouteError(404, "Profile not found.");

    const ext = EXT_MAP[file.type] ?? "bin";
    const storagePath = `${session.userId}/${docType}-${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await adminClient.storage
      .from("identity-documents")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[identity-documents/upload] Storage error:", uploadError.message);
      throw new RouteError(500, "Upload failed. Please try again.");
    }

    const { error: insertError } = await adminClient
      .from("profile_documents")
      .insert({ profile_id: profile.id, url: storagePath, type: docType });

    if (insertError) {
      await adminClient.storage.from("identity-documents").remove([storagePath]);
      throw new RouteError(500, "Could not save document record. Please try again.");
    }

    return json({ ok: true, path: storagePath });
  } catch (error) {
    return errorResponse(error);
  }
}
