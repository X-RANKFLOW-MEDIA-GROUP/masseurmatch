import { NextResponse } from "next/server";

import {
  fetchPayPalSubscription,
  paypalRequest,
  syncPayPalSubscription,
} from "@/app/api/_lib/paypal";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export const dynamic = "force-dynamic";

type PayPalWebhookEvent = {
  id?: string;
  event_type?: string;
  resource?: Record<string, unknown>;
};

type VerificationResponse = {
  verification_status?: string;
};

const SUBSCRIPTION_EVENTS = new Set([
  "BILLING.SUBSCRIPTION.ACTIVATED",
  "BILLING.SUBSCRIPTION.UPDATED",
  "BILLING.SUBSCRIPTION.CANCELLED",
  "BILLING.SUBSCRIPTION.SUSPENDED",
  "BILLING.SUBSCRIPTION.EXPIRED",
  "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
]);

const PAYMENT_EVENTS = new Set([
  "PAYMENT.SALE.COMPLETED",
  "PAYMENT.SALE.REFUNDED",
  "PAYMENT.SALE.REVERSED",
]);

function getHeader(request: Request, name: string) {
  return request.headers.get(name) || request.headers.get(name.toLowerCase()) || "";
}

function getSubscriptionId(event: PayPalWebhookEvent) {
  const resource = event.resource || {};
  if (SUBSCRIPTION_EVENTS.has(event.event_type || "")) {
    return typeof resource.id === "string" ? resource.id : null;
  }
  if (PAYMENT_EVENTS.has(event.event_type || "")) {
    const billingAgreementId = resource.billing_agreement_id;
    return typeof billingAgreementId === "string" ? billingAgreementId : null;
  }
  return null;
}

export async function POST(request: Request) {
  const admin = createSupabaseAdminClient();
  let event: PayPalWebhookEvent | null = null;
  let eventId: string | null = null;

  try {
    const rawBody = await request.text();
    event = JSON.parse(rawBody) as PayPalWebhookEvent;
    eventId = typeof event.id === "string" ? event.id : null;
    const eventType = typeof event.event_type === "string" ? event.event_type : "unknown";

    if (!eventId) {
      return NextResponse.json({ ok: false, error: "Missing PayPal event id." }, { status: 400 });
    }

    const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
    if (!webhookId) {
      return NextResponse.json({ ok: false, error: "PAYPAL_WEBHOOK_ID is not configured." }, { status: 503 });
    }

    const transmissionId = getHeader(request, "paypal-transmission-id");
    const transmissionTime = getHeader(request, "paypal-transmission-time");
    const certUrl = getHeader(request, "paypal-cert-url");
    const authAlgo = getHeader(request, "paypal-auth-algo");
    const transmissionSig = getHeader(request, "paypal-transmission-sig");

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
      return NextResponse.json({ ok: false, error: "Missing PayPal webhook signature headers." }, { status: 400 });
    }

    const verification = await paypalRequest<VerificationResponse>("/v1/notifications/verify-webhook-signature", {
      method: "POST",
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: webhookId,
        webhook_event: event,
      }),
    });

    if (verification.verification_status !== "SUCCESS") {
      return NextResponse.json({ ok: false, error: "Invalid PayPal webhook signature." }, { status: 401 });
    }

    const { data: existing, error: lookupError } = await admin
      .from("paypal_events")
      .select("id")
      .eq("paypal_event_id", eventId)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (existing?.id) return NextResponse.json({ ok: true, duplicate: true });

    const { error: insertError } = await admin.from("paypal_events").insert({
      paypal_event_id: eventId,
      event_type: eventType,
      payload: event,
      processed_at: new Date().toISOString(),
    });
    if (insertError) {
      if (insertError.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
      throw new Error(insertError.message);
    }

    const subscriptionId = getSubscriptionId(event);
    if (subscriptionId) {
      const subscription = await fetchPayPalSubscription(subscriptionId);
      await syncPayPalSubscription(subscription);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (eventId) {
      await admin
        .from("paypal_events")
        .update({ processing_error: message, failed_at: new Date().toISOString() })
        .eq("paypal_event_id", eventId)
        .catch(() => undefined);
    }
    console.error("[paypal-webhook]", message);
    return NextResponse.json({ ok: false, error: "Webhook processing failed." }, { status: 500 });
  }
}
