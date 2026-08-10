import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_KINDS = new Set(["id_front", "id_back", "selfie"]);
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const admin = createSupabaseAdminClient();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const verificationId = String(formData.get("verificationId") ?? "").trim();
    const kind = String(formData.get("kind") ?? "").trim();

    if (!verificationId) throw new RouteError(400, "verificationId is required.");
    if (!ALLOWED_KINDS.has(kind)) throw new RouteError(400, "Invalid document kind.");
    if (!file) throw new RouteError(400, "No file provided.");
    if (!ALLOWED_MIME_TYPES.has(file.type)) throw new RouteError(400, "Only JPEG, PNG, WebP, or PDF files are allowed.");
    if (file.size > MAX_FILE_SIZE_BYTES) throw new RouteError(400, "File must be under 10 MB.");
    if (kind === "selfie" && file.type === "application/pdf") throw new RouteError(400, "Selfie must be an image.");

    const { data: verification, error: verificationError } = await admin
      .from("identity_verifications")
      .select("id, user_id, provider, status, metadata")
      .eq("id", verificationId)
      .eq("user_id", session.userId)
      .maybeSingle();

    if (verificationError) throw new RouteError(500, verificationError.message);
    if (!verification || verification.provider !== "manual") throw new RouteError(404, "Manual verification not found.");
    if (!["not_started", "pending"].includes(verification.status)) throw new RouteError(409, "This verification can no longer accept uploads.");

    const ext = EXT_MAP[file.type] ?? "bin";
    const storagePath = `${session.userId}/manual/${verificationId}/${kind}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await admin.storage
      .from("identity-documents")
      .upload(storagePath, bytes, { contentType: file.type, upsert: true });

    if (uploadError) throw new RouteError(500, "Upload failed. Please try again.");

    const currentMetadata = (verification.metadata ?? {}) as Record<string, unknown>;
    const manual = ((currentMetadata.manual ?? {}) as Record<string, unknown>);
    const files = ((manual.files ?? {}) as Record<string, unknown>);
    const metadata = {
      ...currentMetadata,
      manual: {
        ...manual,
        files: {
          ...files,
          [kind]: { path: storagePath, mimeType: file.type, uploadedAt: new Date().toISOString() },
        },
      },
    };

    const { error: updateError } = await admin
      .from("identity_verifications")
      .update({ metadata, updated_at: new Date().toISOString() })
      .eq("id", verificationId)
      .eq("user_id", session.userId);

    if (updateError) {
      await admin.storage.from("identity-documents").remove([storagePath]);
      throw new RouteError(500, updateError.message);
    }

    return json({ ok: true, kind });
  } catch (error) {
    return errorResponse(error);
  }
}
