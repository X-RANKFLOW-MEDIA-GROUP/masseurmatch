import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { notifyAdmin } from "@/app/api/_lib/admin-notify";
import { isRateLimitedDistributed } from "@/app/api/_lib/rate-limit";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";
import type { Json } from "@/integrations/supabase/types";

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);

    if (
      await isRateLimitedDistributed(request, {
        keyPrefix: "identity-submit",
        windowMs: 60 * 60 * 1000,
        max: 6,
        userId: session.userId,
      })
    ) {
      throw new RouteError(429, "Too many identity verification submissions. Please try again later.");
    }

    const admin = createSupabaseAdminClient();
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const verificationId = typeof body.verificationId === "string" ? body.verificationId.trim() : "";
    const documentType = typeof body.documentType === "string" ? body.documentType.trim() : "";
    const documentCountry = typeof body.documentCountry === "string" ? body.documentCountry.trim().toUpperCase() : "US";

    if (!verificationId) throw new RouteError(400, "verificationId is required.");
    if (!new Set(["drivers_license", "passport", "state_id", "military_id"]).has(documentType)) {
      throw new RouteError(400, "Select a valid document type.");
    }
    if (!/^[A-Z]{2}$/.test(documentCountry)) throw new RouteError(400, "Issuing country must use a two-letter country code.");

    const { data: verification, error: verificationError } = await admin
      .from("identity_verifications")
      .select("id, user_id, provider, status, metadata")
      .eq("id", verificationId)
      .eq("user_id", session.userId)
      .maybeSingle();

    if (verificationError) throw new RouteError(500, verificationError.message);
    if (!verification || verification.provider !== "manual") throw new RouteError(404, "Identity verification not found.");
    if (!["not_started", "pending"].includes(verification.status)) throw new RouteError(409, "This verification has already been submitted.");

    const currentMetadata = (verification.metadata ?? {}) as Record<string, unknown>;
    const manual = (currentMetadata.manual ?? {}) as Record<string, unknown>;
    const files = (manual.files ?? {}) as Record<string, unknown>;
    const expiresAt = typeof manual.expiresAt === "string" ? manual.expiresAt : "";

    if (!expiresAt || Date.parse(expiresAt) <= Date.now()) {
      throw new RouteError(410, "Verification challenge expired. Start a new verification.");
    }

    if (!files.id_front || !files.selfie) {
      throw new RouteError(400, "Upload the front of your ID and a current selfie before submitting.");
    }

    if (documentType !== "passport" && !files.id_back) {
      throw new RouteError(400, "Upload the back of your ID before submitting.");
    }

    const submittedAt = new Date().toISOString();
    const metadata = {
      ...currentMetadata,
      manual: {
        ...manual,
        documentType,
        documentCountry,
        submittedAt,
      },
    };

    const { error: updateError } = await admin
      .from("identity_verifications")
      .update({ status: "pending", last_error: null, metadata: metadata as Json, updated_at: submittedAt })
      .eq("id", verificationId)
      .eq("user_id", session.userId);

    if (updateError) throw new RouteError(500, updateError.message);

    const { data: profile } = await admin
      .from("profiles")
      .select("display_name, full_name, email_address, email")
      .eq("user_id", session.userId)
      .maybeSingle();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://www.masseurmatch.com";
    await notifyAdmin({
      subject: "Identity verification requires review",
      heading: "Identity verification review",
      intro: "A provider submitted a government ID and current challenge selfie for review.",
      fields: [
        { label: "Provider", value: profile?.display_name || profile?.full_name || "Provider" },
        { label: "Email", value: profile?.email_address || profile?.email || session.email },
        { label: "Document", value: documentType.replaceAll("_", " ") },
        { label: "Verification ID", value: verificationId },
      ],
      action: { label: "Review verification", url: `${appUrl}/admin/verification/manual` },
      replyTo: profile?.email_address || profile?.email || session.email || null,
    });

    return json({ ok: true, status: "pending" });
  } catch (error) {
    return errorResponse(error);
  }
}
