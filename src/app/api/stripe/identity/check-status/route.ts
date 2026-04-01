import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2025-08-27.basil" });
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  try {
    await requireAdminSession(request);
    const stripe = getStripe();
    const session = await stripe.identity.verificationSessions.retrieve(sessionId);

    // Update identity_verifications table
    const adminClient = createSupabaseAdminClient();
    const userId = session.metadata?.userId;

    if (userId) {
      const dbStatus = session.status === "verified" ? "verified" : session.status === "requires_input" ? "pending" : "processing";
      await adminClient.from("identity_verifications").update({ status: dbStatus }).eq("stripe_session_id", sessionId);

      // If verified, also update the profile
      if (session.status === "verified") {
        await adminClient
          .from("profiles")
          .update({ is_verified_identity: true })
          .eq("user_id", userId);
      }
    }

    return NextResponse.json({
      status: session.status,
      lastError: session.last_error,
      userId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check verification status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
