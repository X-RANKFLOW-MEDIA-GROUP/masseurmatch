export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { STRIPE_API_VERSION } from "@/app/api/_lib/stripe-config";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession(request);
    const { id } = await context.params;
    const adminClient = createSupabaseAdminClient();

    const { data: verification, error } = await adminClient
      .from("identity_verifications")
      .select("id, stripe_session_id")
      .eq("id", id)
      .maybeSingle();

    if (error || !verification?.stripe_session_id) {
      return NextResponse.json({ error: "Verification session not found." }, { status: 404 });
    }

    const stripe = getStripe();
    const session = await stripe.identity.verificationSessions.retrieve(verification.stripe_session_id, {
      expand: ["last_verification_report"],
    });

    const report = session.last_verification_report;
    if (!report || typeof report === "string") {
      return NextResponse.json({ error: "Stripe verification report is not available yet." }, { status: 404 });
    }

    const selfieFileId = report.selfie?.selfie;
    if (!selfieFileId) {
      return NextResponse.json({ error: "No Stripe selfie is available for this verification." }, { status: 404 });
    }

    const fileLink = await stripe.fileLinks.create({
      file: selfieFileId,
      expires_at: Math.floor(Date.now() / 1000) + 30,
    });

    if (!fileLink.url) {
      return NextResponse.json({ error: "Stripe did not return a usable verification photo URL." }, { status: 502 });
    }

    return NextResponse.redirect(fileLink.url, 302);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load Stripe verification photo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
