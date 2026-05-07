import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

function mapVerificationStatus(status: Stripe.Identity.VerificationSession.Status) {
  if (status === "verified") return "verified";
  if (status === "processing") return "processing";
  if (status === "canceled") return "canceled";
  if (status === "requires_input") return "requires_input";
  return "failed";
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
    const userId = stripeSession.metadata?.userId ?? null;

    if (!userId) {
      return NextResponse.json({ error: "Verification session is missing user metadata." }, { status: 500 });
    }

    if (requesterRole !== "admin" && requester.userId !== userId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    
    const dbStatus = mapVerificationStatus(stripeSession.status);

    const lastErrorMessage =
      stripeSession.last_error && "reason" in stripeSession.last_error
        ? String(stripeSession.last_error.reason)
        : null;

    await adminClient
      .from("identity_verifications")
      .update({ 
        status: dbStatus,
        last_error: lastErrorMessage
      })
      .eq("stripe_session_id", sessionId);

    if (stripeSession.status === "verified") {
      await adminClient
        .from("profiles")
        .update({
          is_verified_identity: true,
          verification_status: "verified",
          status: "approved",
        })
        .eq("user_id", userId)
        .in("status", ["pending", "pending_approval"]);
    }

    return NextResponse.json({
      status: stripeSession.status,
      lastError: stripeSession.last_error,
      userId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to check verification status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
