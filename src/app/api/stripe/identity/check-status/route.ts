import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { STRIPE_API_VERSION } from "@/app/api/_lib/stripe-config";
import {
  createSupabaseAdminClient,
  getUserRole,
  requireSession,
} from "@/app/api/_lib/supabase-server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
}

function mapVerificationStatus(status: Stripe.Identity.VerificationSession.Status) {
  if (status === "verified") return "verified";
  if (status === "processing") return "processing";
  if (status === "canceled") return "canceled";
  if (status === "requires_input") return "requires_input";
  return "failed";
}

function isSchemaDriftError(message = "") {
  return /schema cache|column .* does not exist|stripe_session_id/i.test(message);
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId is required." }, { status: 400 });

  try {
    const requester = await requireSession(request);
    const requesterRole = await getUserRole(requester.userId);
    const stripe = getStripe();
    const adminClient = createSupabaseAdminClient();
    const stripeSession = await stripe.identity.verificationSessions.retrieve(sessionId);
    const userId = stripeSession.metadata?.userId ?? requester.userId;

    if (requesterRole !== "admin" && requester.userId !== userId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const dbStatus = mapVerificationStatus(stripeSession.status);
    const { error: verificationUpdateError } = await adminClient
      .from("identity_verifications")
      .update({
        status: dbStatus,
        last_error: stripeSession.last_error?.reason || null,
      })
      .eq("stripe_session_id", sessionId);

    if (verificationUpdateError && !isSchemaDriftError(verificationUpdateError.message)) {
      console.error("[identity/check-status] verification update failed", verificationUpdateError.message);
      return NextResponse.json({ error: "Identity status could not be saved. Please try again." }, { status: 500 });
    }

    let publicationStatus: "not_ready" | "published" | "pending" = "not_ready";

    if (stripeSession.status === "verified") {
      const rpcClient = adminClient as unknown as {
        rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message?: string; code?: string } | null }>;
      };
      const { error: publishError } = await rpcClient.rpc("publish_verified_identity_profile", {
        p_user_id: userId,
      });

      if (publishError) {
        publicationStatus = "pending";
        console.error("[identity/check-status] verified identity could not publish profile", publishError.message);
      } else {
        publicationStatus = "published";
      }
    }

    return NextResponse.json({
      status: stripeSession.status,
      dbStatus,
      lastError: stripeSession.last_error,
      userId,
      publicationStatus,
      next: stripeSession.status === "verified"
        ? publicationStatus === "published"
          ? "/pro/subscription?identity=verified&profile=published"
          : "/pro/dashboard?identity=verified&publication=pending"
        : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check verification status.";
    console.error("[identity/check-status]", message);
    return NextResponse.json({ error: "Verification status could not be checked. Please try again." }, { status: 500 });
  }
}
