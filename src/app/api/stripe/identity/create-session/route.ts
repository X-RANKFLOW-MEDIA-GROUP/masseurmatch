import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import {
  createSupabaseAdminClient,
  getUserByEmail,
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

function createMockVerificationSession(userId: string, email: string) {
  const id = `vsim_${userId.slice(0, 8)}_${Date.now()}`;

  return {
    id,
    client_secret: `vsim_secret_${userId.slice(0, 8)}`,
    url: `https://dashboard.stripe.com/test/identity/verification-sessions/${id}?prefilled_email=${encodeURIComponent(email)}`,
  };
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

    const stripe = getStripe(request);
    const verificationSession = stripe
      ? await stripe.identity.verificationSessions.create({
          type: "document",
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
        })
      : createMockVerificationSession(targetUserId, targetEmail);

    const { data: existingVerification, error: existingVerificationError } = await adminClient
      .from("identity_verifications")
      .select("id")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingVerificationError) {
      throw new Error(existingVerificationError.message);
    }

    if (existingVerification?.id) {
      const { error: updateError } = await adminClient
        .from("identity_verifications")
        .update({
          stripe_session_id: verificationSession.id,
          status: "pending",
        })
        .eq("id", existingVerification.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      const { error: insertError } = await adminClient.from("identity_verifications").insert({
        user_id: targetUserId,
        stripe_session_id: verificationSession.id,
        status: "pending",
      });

      if (insertError) {
        const isLegacySchemaConstraintError =
          /not-null|null value|violates check constraint|column .* does not exist/i.test(insertError.message);

        if (!isLegacySchemaConstraintError) {
          throw new Error(insertError.message);
        }

        console.warn("identity_verifications insert skipped due to schema mismatch", {
          message: insertError.message,
          code: insertError.code,
        });
      }
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
