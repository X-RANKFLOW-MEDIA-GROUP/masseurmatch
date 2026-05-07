import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import {
  createSupabaseAdminClient,
  getUserByEmail,
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

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const requesterRole = await getUserRole(session.userId);
    const adminClient = createSupabaseAdminClient();
    const body = await request.json().catch(() => ({} as Record<string, unknown>));

    let targetUserId = session.userId;
    let targetEmail = session.email || "";

    const requestedUserId =
      typeof body.userId === "string" && body.userId.trim() ? body.userId.trim() : null;
    const requestedEmail =
      typeof body.email === "string" && body.email.trim() ? body.email.trim().toLowerCase() : null;

    if (requesterRole === "admin" && (requestedUserId || requestedEmail)) {
      if (requestedUserId) {
        const { data, error } = await adminClient.auth.admin.getUserById(requestedUserId);
        if (error || !data.user) {
          return NextResponse.json({ error: "Target user not found." }, { status: 404 });
        }
        targetUserId = data.user.id;
        targetEmail = data.user.email ?? requestedEmail ?? "";
      } else if (requestedEmail) {
        const targetUser = await getUserByEmail(requestedEmail);
        if (!targetUser) {
          return NextResponse.json({ error: "Target user not found." }, { status: 404 });
        }
        targetUserId = targetUser.id;
        targetEmail = targetUser.email ?? requestedEmail;
      }
    } else {
      const { data } = await adminClient.auth.admin.getUserById(session.userId);
      targetEmail = data.user?.email ?? session.email ?? "";
    }

    const stripe = getStripe();
    const origin = request.nextUrl.origin;
    const returnUrl = `${origin}/signup/verify?identity_return=1`;
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: "document",
      return_url: returnUrl,
      metadata: {
        userId: targetUserId,
        email: targetEmail,
        requestedBy: session.userId,
      },
      options: {
        document: {
          allowed_types: ["driving_license", "passport", "id_card"],
          require_matching_selfie: true,
        },
      },
    });

    const { data: existingVerification } = await adminClient
      .from("identity_verifications")
      .select("id")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingVerification?.id) {
      await adminClient
        .from("identity_verifications")
        .update({
          stripe_session_id: verificationSession.id,
          status: "pending",
        })
        .eq("id", existingVerification.id);
    } else {
      await adminClient.from("identity_verifications").insert({
        user_id: targetUserId,
        stripe_session_id: verificationSession.id,
        status: "pending",
      });
    }

    await adminClient
      .from("profiles")
      .update({ stripe_verification_session_id: verificationSession.id })
      .eq("user_id", targetUserId);

    return NextResponse.json({
      sessionId: verificationSession.id,
      clientSecret: verificationSession.client_secret,
      url: verificationSession.url,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create identity verification session.";
    const isStripeConfigurationError =
      message.toLowerCase().includes("api key") ||
      message.toLowerCase().includes("stripe_secret_key") ||
      message.toLowerCase().includes("not configured");

    return NextResponse.json(
      {
        error: isStripeConfigurationError
          ? "Stripe Identity is not configured with a valid API key."
          : message,
      },
      { status: isStripeConfigurationError ? 503 : 500 },
    );
  }
}
