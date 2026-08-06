import { errorResponse, json } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

function resolveIdentityStatus(
  verificationStatus: string | null | undefined,
  profileVerified: boolean | null | undefined,
) {
  if (profileVerified || verificationStatus === "verified") return "verified";
  return verificationStatus || "not_started";
}

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const adminClient = createSupabaseAdminClient();

    const [identityResult, textResult, profileResult] = await Promise.all([
      adminClient
        .from("identity_verifications")
        .select("id, status, stripe_session_id, created_at, updated_at")
        .eq("user_id", session.userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      adminClient
        .from("text_verifications")
        .select("id, status, created_at, updated_at, verified_at")
        .eq("user_id", session.userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      adminClient
        .from("profiles")
        .select("is_verified_identity, identity_verified_at")
        .eq("user_id", session.userId)
        .maybeSingle(),
    ]);

    const identityRow = identityResult.data;
    const textRow = textResult.data;
    const profile = profileResult.data;
    const identityStatus = resolveIdentityStatus(
      identityRow?.status,
      profile?.is_verified_identity,
    );

    return json({
      ok: true,
      identity: identityRow
        ? {
            id: identityRow.id,
            status: identityStatus,
            stripeSessionId: identityRow.stripe_session_id,
            createdAt: identityRow.created_at,
            updatedAt: identityRow.updated_at,
            verifiedAt: profile?.identity_verified_at ?? null,
          }
        : {
            status: identityStatus,
            verifiedAt: profile?.identity_verified_at ?? null,
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
