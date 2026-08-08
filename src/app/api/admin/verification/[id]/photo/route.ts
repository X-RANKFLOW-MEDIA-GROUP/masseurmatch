export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { STRIPE_API_VERSION } from "@/app/api/_lib/stripe-config";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

function getIdentityStripe() {
  const key = process.env.STRIPE_IDENTITY_RESTRICTED_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
}

function photoUnavailable() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
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
      return photoUnavailable();
    }

    const stripe = getIdentityStripe();
    if (!stripe) {
      return photoUnavailable();
    }

    const session = await stripe.identity.verificationSessions.retrieve(verification.stripe_session_id, {
      expand: ["last_verification_report"],
    });

    const report = session.last_verification_report;
    if (!report || typeof report === "string") {
      return photoUnavailable();
    }

    const selfieFileId = report.selfie?.selfie;
    if (!selfieFileId) {
      return photoUnavailable();
    }

    const fileLink = await stripe.fileLinks.create({
      file: selfieFileId,
      expires_at: Math.floor(Date.now() / 1000) + 30,
    });

    if (!fileLink.url) {
      return photoUnavailable();
    }

    return NextResponse.redirect(fileLink.url, 302);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Stripe Identity photo error";
    console.warn("[admin/verification/photo] Stripe Identity photo unavailable:", message);
    return photoUnavailable();
  }
}
