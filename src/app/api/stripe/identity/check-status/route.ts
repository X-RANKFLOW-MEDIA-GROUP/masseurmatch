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
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Please ensure the Stripe connector is enabled.");
  }
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

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

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
      return NextResponse.json({ error: verificationUpdateError.message }, { status: 500 });
    }

    if (stripeSession.status === "verified") {
      const { error: profileUpdateError } = await adminClient
        .from("profiles")
        .update({
          is_verified_identity: true,
          verification_status: "verified",
          status: "approved",
          profile_status: "approved",
          visibility_status: "public",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .in("status", ["pending", "pending_approval", "under_review", "submitted"]);

      if (profileUpdateError && !isSchemaDriftError(profileUpdateError.message)) {
        return NextResponse.json({ error: profileUpdateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      status: stripeSession.status,
      dbStatus,
      lastError: stripeSession.last_error,
      userId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check verification status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
