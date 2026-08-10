import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { STRIPE_API_VERSION } from "@/app/api/_lib/stripe-config";
import { SITE_URL } from "@/lib/site";

import {
  createSupabaseAdminClient,
  getUserByEmail,
  getUserRole,
  requireSession,
} from "@/app/api/_lib/supabase-server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured. Please ensure the Stripe connector is enabled.");
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const requesterRole = await getUserRole(session.userId);
    const adminClient = createSupabaseAdminClient();
    const body = await request.json().catch(() => ({} as Record<string, unknown>));

    let targetUserId = session.userId;
    let targetEmail = session.email || "";

    const requestedUserId = typeof body.userId === "string" && body.userId.trim() ? body.userId.trim() : null;
    const requestedEmail = typeof body.email === "string" && body.email.trim() ? body.email.trim().toLowerCase() : null;
    const returnToTrust = body.returnTo === "pro_trust";

    if (requesterRole === "admin" && (requestedUserId || requestedEmail)) {
      if (requestedUserId) {
        const { data, error } = await adminClient.auth.admin.getUserById(requestedUserId);
        if (error || !data.user) return NextResponse.json({ error: "Target user not found." }, { status: 404 });
        targetUserId = data.user.id;
        targetEmail = data.user.email ?? requestedEmail ?? "";
      } else if (requestedEmail) {
        const targetUser = await getUserByEmail(requestedEmail);
        if (!targetUser) return NextResponse.json({ error: "Target user not found." }, { status: 404 });
        targetUserId = targetUser.id;
        targetEmail = targetUser.email ?? requestedEmail;
      }
    } else {
      const { data } = await adminClient.auth.admin.getUserById(session.userId);
      targetEmail = data.user?.email ?? session.email ?? "";
    }

    const stripe = getStripe();
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: "document",
      return_url: returnToTrust
        ? `${SITE_URL}/pro/trust?identity_return=1`
        : `${SITE_URL}/signup/verify?identity_return=1`,
      metadata: { userId: targetUserId, email: targetEmail, requestedBy: session.userId },
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

    const verificationValues = {
      stripe_session_id: verificationSession.id,
      status: "pending",
      last_error: null,
      updated_at: new Date().toISOString(),
    };

    if (existingVerification?.id) {
      await adminClient.from("identity_verifications").update(verificationValues).eq("id", existingVerification.id);
    } else {
      await adminClient.from("identity_verifications").insert({ user_id: targetUserId, ...verificationValues });
    }

    await adminClient
      .from("profiles")
      .update({
        stripe_verification_session_id: verificationSession.id,
        is_verified_identity: false,
        verification_status: "pending",
        identity_verified_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", targetUserId);

    return NextResponse.json({
      sessionId: verificationSession.id,
      clientSecret: verificationSession.client_secret,
      url: verificationSession.url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create identity verification session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
