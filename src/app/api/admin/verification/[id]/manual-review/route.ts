import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import type { Json } from "@/integrations/supabase/types";

const APPROVAL_CRITERIA = ["document_valid", "document_unexpired", "selfie_matches", "challenge_visible"] as const;
const REJECTION_CODES = new Set([
  "document_unreadable",
  "document_expired",
  "document_invalid",
  "selfie_mismatch",
  "challenge_missing",
  "challenge_unreadable",
  "suspected_tampering",
  "missing_document_side",
  "other",
]);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const decision = body.decision === "approve" ? "approve" : body.decision === "reject" ? "reject" : null;
    const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";
    const rejectionCode = typeof body.rejectionCode === "string" ? body.rejectionCode.trim() : "";
    const criteria = Array.isArray(body.criteria)
      ? body.criteria.filter((value): value is string => typeof value === "string")
      : [];

    if (!decision) throw new RouteError(400, "Decision must be approve or reject.");

    if (decision === "approve") {
      const missing = APPROVAL_CRITERIA.filter((criterion) => !criteria.includes(criterion));
      if (missing.length > 0) {
        throw new RouteError(400, `All approval criteria are required: ${missing.join(", ")}.`);
      }
    }

    if (decision === "reject") {
      if (!REJECTION_CODES.has(rejectionCode)) throw new RouteError(400, "Select a valid rejection reason.");
      if (rejectionCode === "other" && !reason) throw new RouteError(400, "Add a rejection note for Other.");
    }

    const admin = createSupabaseAdminClient();
    const { data: verification, error } = await admin
      .from("identity_verifications")
      .select("id, user_id, provider, status, metadata")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new RouteError(500, error.message);
    if (!verification || verification.provider !== "manual") throw new RouteError(404, "Manual verification not found.");
    if (verification.status !== "pending") throw new RouteError(409, "Only pending manual verifications can be reviewed.");

    const reviewedAt = new Date().toISOString();
    const currentMetadata = (verification.metadata ?? {}) as Record<string, unknown>;
    const manual = (currentMetadata.manual ?? {}) as Record<string, unknown>;
    const files = (manual.files ?? {}) as Record<string, { path?: string }>;
    const paths = Object.values(files).map((entry) => entry?.path).filter((path): path is string => Boolean(path));

    if (paths.length > 0) {
      const { error: removeError } = await admin.storage.from("identity-documents").remove(paths);
      if (removeError) throw new RouteError(500, "Could not securely remove identity documents. Review was not finalized.");
    }

    const metadata = {
      ...currentMetadata,
      manual: {
        ...manual,
        reviewedAt,
        reviewedBy: session.userId,
        decision,
        approvalCriteria: decision === "approve" ? APPROVAL_CRITERIA : [],
        rejectionCode: decision === "reject" ? rejectionCode : null,
        rejectionReason: decision === "reject" ? reason || null : null,
        files: {},
        documentsDeletedAt: reviewedAt,
      },
    };

    const nextStatus = decision === "approve" ? "verified" : "requires_input";
    const providerMessage =
      decision === "reject"
        ? reason || rejectionCode.replaceAll("_", " ")
        : null;

    const { error: updateError } = await admin
      .from("identity_verifications")
      .update({
        status: nextStatus,
        last_error: providerMessage,
        metadata: metadata as Json,
        updated_at: reviewedAt,
      })
      .eq("id", id);

    if (updateError) throw new RouteError(500, updateError.message);

    await recordAuditLog(session.userId, `manual_identity_${decision}`, "identity_verification", id, {
      user_id: verification.user_id,
      decision,
      criteria: decision === "approve" ? APPROVAL_CRITERIA : [],
      rejection_code: decision === "reject" ? rejectionCode : null,
      reason: decision === "reject" ? reason || null : null,
    });

    return json({ ok: true, status: nextStatus });
  } catch (error) {
    return errorResponse(error);
  }
}
