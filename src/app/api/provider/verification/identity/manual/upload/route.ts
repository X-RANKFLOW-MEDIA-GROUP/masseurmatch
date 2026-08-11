import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { isRateLimitedDistributed } from "@/app/api/_lib/rate-limit";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";
import type { Json } from "@/integrations/supabase/types";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_KINDS = new Set(["id_front", "id_back", "selfie"]);
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function matchesMagicBytes(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return bytes.length >= signature.length && signature.every((value, index) => bytes[index] === value);
  }

  if (mimeType === "image/webp") {
    return (
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);

    if (
      await isRateLimitedDistributed(request, {
        keyPrefix: "identity-upload",
        windowMs: 10 * 60 * 1000,
        max: 12,
        userId: session.userId,
      })
    ) {
      throw new RouteError(429, "Too many identity upload attempts. Please try again later.");
    }

    const admin = createSupabaseAdminClient();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const verificationId = String(formData.get("verificationId") ?? "").trim();
    const kind = String(formData.get("kind") ?? "").trim();

    if (!verificationId) throw new RouteError(400, "verificationId is required.");
    if (!ALLOWED_KINDS.has(kind)) throw new RouteError(400, "Invalid document kind.");
    if (!file) throw new RouteError(400, "No file provided.");
    if (!ALLOWED_MIME_TYPES.has(file.type)) throw new RouteError(400, "Only JPEG, PNG, or WebP images are allowed.");
    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) throw new RouteError(400, "File must be between 1 byte and 8 MB.");

    const { data: verification, error: verificationError } = await admin
      .from("identity_verifications")
      .select("id, user_id, provider, status, metadata")
      .eq("id", verificationId)
      .eq("user_id", session.userId)
      .maybeSingle();

    if (verificationError) throw new RouteError(500, verificationError.message);
    if (!verification || verification.provider !== "manual") throw new RouteError(404, "Identity verification not found.");
    if (!["not_started", "pending"].includes(verification.status)) throw new RouteError(409, "This verification can no longer accept uploads.");

    const currentMetadata = (verification.metadata ?? {}) as Record<string, unknown>;
    const manual = (currentMetadata.manual ?? {}) as Record<string, unknown>;
    const expiresAt = typeof manual.expiresAt === "string" ? manual.expiresAt : "";

    if (!expiresAt || Date.parse(expiresAt) <= Date.now()) {
      throw new RouteError(410, "Verification challenge expired. Start a new verification.");
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (!matchesMagicBytes(bytes, file.type)) {
      throw new RouteError(400, "The uploaded file content does not match its declared image format.");
    }

    const ext = EXT_MAP[file.type];
    const storagePath = `${session.userId}/manual/${verificationId}/${kind}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from("identity-documents")
      .upload(storagePath, buffer, { contentType: file.type, upsert: true });

    if (uploadError) throw new RouteError(500, "Upload failed. Please try again.");

    const files = (manual.files ?? {}) as Record<string, unknown>;
    const metadata = {
      ...currentMetadata,
      manual: {
        ...manual,
        files: {
          ...files,
          [kind]: {
            path: storagePath,
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          },
        },
      },
    };

    const { error: updateError } = await admin
      .from("identity_verifications")
      .update({ metadata: metadata as Json, updated_at: new Date().toISOString() })
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
