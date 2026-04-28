import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import {
  createSupabaseAdminClient,
  getUserRole,
  requireSession,
} from "@/app/api/_lib/supabase-server";

function shouldUseMockStripe(request: NextRequest) {
  if (request.headers.get("x-playwright-ci") === "1") {
    return true;
  }

  return ["127.0.0.1", "localhost"].includes(request.nextUrl.hostname);
}

function getStripe(request: NextRequest) {
  // Check multiple possible env var names for Stripe secret key
  const key = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_MCP_KEY;
  if (!key) {
    if (!shouldUseMockStripe(request)) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    return null;
  }

  return new Stripe(key, { apiVersion: "2025-08-27.basil" });
}

function mapVerificationStatus(status: Stripe.Identity.VerificationSession.Status) {
  if (status === "verified") return "approved";
  if (status === "processing") return "reviewing";
  if (status === "canceled") return "expired";
  return "rejected";
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  try {
    const requester = await requireSession(request);
    const requesterRole = await getUserRole(requester.userId);
    const stripe = getStripe(request);
    const adminClient = createSupabaseAdminClient();

    if (!stripe || sessionId.startsWith("vsim_")) {
      const { data: mockRow, error: mockError } = await adminClient
        .from("identity_verifications")
        .select("user_id, status")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();

      if (mockError) {
        const isSchemaCacheColumnError = /schema cache|column .* does not exist/i.test(mockError.message);
        if (!isSchemaCacheColumnError) {
          return NextResponse.json({ error: mockError.message }, { status: 500 });
        }
      }

      const userId = mockRow?.user_id ?? requester.userId;
      if (!userId) {
        return NextResponse.json({ error: "Verification session not found." }, { status: 404 });
      }

      if (requesterRole !== "admin" && requester.userId !== userId) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }

      const mockStatus = mockRow?.status === "approved" ? "verified" : "processing";

      if (mockStatus === "verified") {
        await adminClient
          .from("profiles")
          .update({ is_verified_identity: true })
          .eq("user_id", userId);
      }

      return NextResponse.json({
        status: mockStatus,
        lastError: null,
        userId,
      });
    }

    const stripeSession = await stripe.identity.verificationSessions.retrieve(sessionId);
    const userId = stripeSession.metadata?.userId ?? null;

    if (!userId) {
      return NextResponse.json({ error: "Verification session is missing user metadata." }, { status: 500 });
    }

    if (requesterRole !== "admin" && requester.userId !== userId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    const dbStatus = mapVerificationStatus(stripeSession.status);

    const { error: verificationUpdateError } = await adminClient
      .from("identity_verifications")
      .update({ status: dbStatus })
      .eq("stripe_session_id", sessionId);

    if (verificationUpdateError) {
      const isSchemaCacheColumnError = /schema cache|column .* does not exist/i.test(
        verificationUpdateError.message,
      );
      if (!isSchemaCacheColumnError) {
        throw new Error(verificationUpdateError.message);
      }
    }

    if (stripeSession.status === "verified") {
      await adminClient
        .from("profiles")
        .update({ is_verified_identity: true })
        .eq("user_id", userId);
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
