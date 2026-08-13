import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { sendEmail } from "@/app/api/_lib/email";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import IdentityVerificationDecisionEmail from "@/emails/IdentityVerificationDecisionEmail";
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

const REJECTION_LABELS: Record<string, string> = {
  document_unreadable: "The identity document was not readable enough to review.",
  document_expired: "The identity document appears expired.",
  document_invalid: "The identity document could not be accepted as valid evidence.",
  selfie_mismatch: "The selfie could not be confidently matched to the identity document.",
  challenge_missing: "The required one-time challenge code was missing from the selfie.",
  challenge_unreadable: "The one-time challenge code was not readable in the selfie.",
  suspected_tampering: "The submitted evidence showed signs that require a fresh submission.",
  missing_document_side: "A required side of the identity document was missing.",
  other: "The identity evidence requires a new submission.",
};

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
    if (!verification.user_id) throw new RouteError(409, "Identity verification is not linked to a user account.");
    if (verification.status !== "pending") throw new RouteError(409, "Only pending manual verifications can be reviewed.");
    const verificationUserId = verification.user_id;

    const reviewedAt = new Date().toISOString();
    const currentMetadata = (verification.metadata ?? {}) as Record<string, unknown>;
    const manual = (currentMetadata.manual ?? {}) as Record<string, unknown>;
    const files = (manual.files ?? {}) as Record<string, { path?: string }>;
    const paths = Object.values(files).map((entry) => entry?.path).filter((path): path is string => Boolean(path));

    if (paths.length > 0) {
      const { error: removeError } = await admin.storage.from("identity-documents").remove(paths);
      if (removeError) throw new RouteError(500, "Could not securely remove identity documents. Review was not finalized.");
    }

    const approvedCriteria = decision === "approve" ? Array.from(APPROVAL_CRITERIA) : [];
    const metadata = {
      ...currentMetadata,
      manual: {
        ...manual,
        reviewedAt,
        reviewedBy: session.userId,
        decision,
        approvalCriteria: approvedCriteria,
        rejectionCode: decision === "reject" ? rejectionCode : null,
        rejectionReason: decision === "reject" ? reason || null : null,
        files: {},
        documentsDeletedAt: reviewedAt,
      },
    };

    const nextStatus = decision === "approve" ? "verified" : "requires_input";
    const providerMessage = decision === "reject"
      ? reason || REJECTION_LABELS[rejectionCode] || "A new identity submission is required."
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

    const { data: profile } = await admin
      .from("profiles")
      .select("display_name, full_name, email_address, email")
      .eq("user_id", verificationUserId)
      .maybeSingle();

    let providerEmail = profile?.email_address || profile?.email || null;
    let providerName = profile?.display_name || profile?.full_name || null;

    if (!providerEmail || !providerName) {
      const { data: authData } = await admin.auth.admin.getUserById(verificationUserId);
      providerEmail = providerEmail || authData.user?.email || null;
      const authMetadata = authData.user?.user_metadata as Record<string, unknown> | undefined;
      providerName = providerName
        || (typeof authMetadata?.display_name === "string" ? authMetadata.display_name : null)
        || (typeof authMetadata?.full_name === "string" ? authMetadata.full_name : null)
        || null;
    }

    let notificationSent = false;
    if (providerEmail) {
      const notification = await sendEmail({
        to: providerEmail,
        subject: decision === "approve"
          ? "Your MasseurMatch identity verification is approved"
          : "Action required: resubmit your MasseurMatch identity verification",
        react: IdentityVerificationDecisionEmail({
          decision: decision === "approve" ? "approved" : "resubmit",
          providerName,
          reason: providerMessage,
        }),
      });
      notificationSent = notification.success;
      if (!notification.success) console.warn("[manual-identity-review] provider notification failed", notification.error);
    }

    await recordAuditLog(session.userId, `manual_identity_${decision}`, "identity_verification", id, {
      user_id: verificationUserId,
      decision,
      criteria: approvedCriteria,
      rejection_code: decision === "reject" ? rejectionCode : null,
      reason: decision === "reject" ? reason || null : null,
      notification_sent: notificationSent,
    });

    return json({ ok: true, status: nextStatus, notificationSent });
  } catch (error) {
    return errorResponse(error);
  }
}
