import Stripe from "stripe";
import { errorResponse, json } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";
import { normalizeIdentityStatus } from "@/app/_lib/identity-verification";
import { STRIPE_API_VERSION } from "@/app/api/_lib/stripe-config";

function mapStripeStatus(status: Stripe.Identity.VerificationSession.Status) {
  if (status === "verified") return "verified";
  if (status === "processing") return "processing";
  if (status === "canceled") return "canceled";
  if (status === "requires_input") return "requires_input";
  return "failed";
}

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const adminClient = createSupabaseAdminClient();

    const [identityResult, textResult] = await Promise.all([
      adminClient
        .from("identity_verifications")
        .select("id, status, stripe_session_id, last_error, created_at, updated_at")
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

    let identityRow = identityResult.data;
    const textRow = textResult.data;

    // Stripe is the source of truth for an existing verification session. This
    // makes /pro/trust recover even if a webhook was delayed or missed.
    if (identityRow?.stripe_session_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: STRIPE_API_VERSION });
        const stripeSession = await stripe.identity.verificationSessions.retrieve(identityRow.stripe_session_id);
        const stripeStatus = mapStripeStatus(stripeSession.status);
        const lastError = stripeSession.last_error?.reason ?? null;

        if (stripeStatus !== normalizeIdentityStatus(identityRow.status) || lastError !== identityRow.last_error) {
          const updatedAt = new Date().toISOString();
          await adminClient
            .from("identity_verifications")
            .update({ status: stripeStatus, last_error: lastError, updated_at: updatedAt })
            .eq("id", identityRow.id);

          identityRow = {
            ...identityRow,
            status: stripeStatus,
            last_error: lastError,
            updated_at: updatedAt,
          };

          await adminClient
            .from("profiles")
            .update({
              is_verified_identity: stripeStatus === "verified",
              verification_status: stripeStatus,
              identity_verified_at: stripeStatus === "verified" ? updatedAt : null,
              updated_at: updatedAt,
            })
            .eq("user_id", session.userId);
        }
      } catch (stripeError) {
        // Do not make Trust unusable if Stripe is temporarily unavailable.
        console.error("Unable to sync identity status from Stripe", stripeError);
      }
    }

    const identityStatus = normalizeIdentityStatus(identityRow?.status);

    return json({
      ok: true,
      identity: identityRow
        ? {
            id: identityRow.id,
            status: identityStatus,
            stripeSessionId: identityRow.stripe_session_id,
            lastError: identityRow.last_error,
            createdAt: identityRow.created_at,
            updatedAt: identityRow.updated_at,
            verifiedAt: identityStatus === "verified" ? identityRow.updated_at : null,
          }
        : {
            status: "not_started",
            stripeSessionId: null,
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
