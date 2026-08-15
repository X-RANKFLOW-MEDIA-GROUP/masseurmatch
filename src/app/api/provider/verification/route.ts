import { errorResponse, json } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";
import { normalizeIdentityStatus } from "@/app/_lib/identity-verification";

function manualReviewedAt(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const manual = (metadata as Record<string, unknown>).manual;
  if (!manual || typeof manual !== "object") return null;
  const reviewedAt = (manual as Record<string, unknown>).reviewedAt;
  return typeof reviewedAt === "string" ? reviewedAt : null;
}

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const adminClient = createSupabaseAdminClient();

    const [identityResult, textResult] = await Promise.all([
      adminClient
        .from("identity_verifications")
        .select("id, status, provider, last_error, metadata, created_at, updated_at")
        .eq("user_id", session.userId)
        .order("created_at", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle(),
      adminClient
        .from("text_verifications")
        .select("id, status, created_at, updated_at, verified_at")
        .eq("user_id", session.userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const identityRow = identityResult.data;
    const textRow = textResult.data;
    const identityStatus = normalizeIdentityStatus(identityRow?.status);
    const reviewedAt = manualReviewedAt(identityRow?.metadata);

    return json({
      ok: true,
      identity: identityRow
        ? {
            id: identityRow.id,
            status: identityStatus,
            provider: identityRow.provider ?? "stripe",
            lastError: identityRow.last_error,
            createdAt: identityRow.created_at,
            updatedAt: identityRow.updated_at,
            verifiedAt: identityStatus === "verified" ? reviewedAt || identityRow.updated_at : null,
          }
        : {
            status: "not_started",
            provider: "manual",
            lastError: null,
            createdAt: null,
            updatedAt: null,
            verifiedAt: null,
          },
      text: textRow
        ? {
            id: textRow.id,
            status: textRow.status,
            createdAt: textRow.created_at,
            verifiedAt: textRow.verified_at,
          }
        : { status: "not_started" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
