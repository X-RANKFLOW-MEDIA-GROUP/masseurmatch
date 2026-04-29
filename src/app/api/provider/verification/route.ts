import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const adminClient = createSupabaseAdminClient();

    // Identity verification
    const { data: identityRow } = await adminClient
      .from("identity_verifications")
      .select("id, status, stripe_session_id, created_at, updated_at")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Text verification
    const { data: textRow } = await adminClient
      .from("text_verifications")
      .select("id, status, phone, attempt_count, verified_at, created_at")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return json({
      ok: true,
      identity: identityRow
        ? {
            id: identityRow.id,
            status: identityRow.status,
            stripeSessionId: identityRow.stripe_session_id,
            createdAt: identityRow.created_at,
            updatedAt: identityRow.updated_at,
          }
        : { status: "not_started" },
      text: textRow
        ? {
            id: textRow.id,
            status: textRow.status,
            phone: textRow.phone,
            attemptCount: textRow.attempt_count,
            verifiedAt: textRow.verified_at,
            createdAt: textRow.created_at,
          }
        : { status: "not_started" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
