import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" as any });
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminSession(request);
    const body = await request.json();
    const { userId, email } = body;

    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email are required." }, { status: 400 });
    }

    const stripe = getStripe();

    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: { userId, email, adminId: admin.userId },
      options: {
        document: {
          allowed_types: ["driving_license", "passport", "id_card"],
          require_matching_selfie: true,
        },
      },
    });

    // Record in identity_verifications table
    const adminClient = createSupabaseAdminClient() as any;
    await adminClient.from("identity_verifications").upsert({
      user_id: userId,
      stripe_session_id: session.id,
      status: "pending",
    }, { onConflict: "user_id" });

    return NextResponse.json({
      sessionId: session.id,
      clientSecret: session.client_secret,
      url: session.url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create identity verification session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
