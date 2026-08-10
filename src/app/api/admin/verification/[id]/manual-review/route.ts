import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const decision = body.decision === "approve" ? "approve" : body.decision === "reject" ? "reject" : null;
    const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";

    if (!decision) throw new RouteError(400, "Decision must be approve or reject.");
    if (decision === "reject" && !reason) throw new RouteError(400, "A rejection reason is required.");

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

    // Privacy-first: a review decision is not finalized unless the sensitive
    // source files can be removed from storage in the same operation.
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
        rejectionReason: decision === "reject" ? reason : null,
        files: {},
        documentsDeletedAt: reviewedAt,
      },
    };

    const nextStatus = decision === "approve" ? "verified" : "requires_input";
    const { error: updateError } = await admin
      .from("identity_verifications")
      .update({
        status: nextStatus,
        last_error: decision === "reject" ? reason : null,
        metadata,
        updated_at: reviewedAt,
      })
      .eq("id", id);

    if (updateError) throw new RouteError(500, updateError.message);

    await recordAuditLog(session.userId, `manual_identity_${decision}`, "identity_verification", id, {
      user_id: verification.user_id,
      decision,
      reason: decision === "reject" ? reason : null,
    });

    return json({ ok: true, status: nextStatus });
  } catch (error) {
    return errorResponse(error);
  }
}
