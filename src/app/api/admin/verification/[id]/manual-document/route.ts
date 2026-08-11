import { NextResponse } from "next/server";

import { errorResponse, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

const ALLOWED_KINDS = new Set(["id_front", "id_back", "selfie"]);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession(request);
    const { id } = await params;
    const url = new URL(request.url);
    const kind = url.searchParams.get("kind") ?? "selfie";
    if (!ALLOWED_KINDS.has(kind)) throw new RouteError(400, "Invalid document kind.");

    const admin = createSupabaseAdminClient();
    const { data: verification, error } = await admin
      .from("identity_verifications")
      .select("verification_method, metadata")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new RouteError(500, error.message);
    if (!verification || verification.verification_method !== "manual") throw new RouteError(404, "Manual verification not found.");

    const metadata = (verification.metadata ?? {}) as Record<string, unknown>;
    const manual = (metadata.manual ?? {}) as Record<string, unknown>;
    const files = (manual.files ?? {}) as Record<string, { path?: string }>;
    const path = files[kind]?.path;
    if (!path) throw new RouteError(404, "Document not found.");

    const { data, error: signedUrlError } = await admin.storage
      .from("identity-documents")
      .createSignedUrl(path, 60);

    if (signedUrlError || !data?.signedUrl) throw new RouteError(500, "Could not open document.");
    return NextResponse.redirect(data.signedUrl, 302);
  } catch (error) {
    return errorResponse(error);
  }
}
