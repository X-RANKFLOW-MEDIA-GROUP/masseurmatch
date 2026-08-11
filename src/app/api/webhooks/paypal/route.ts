import { NextResponse } from "next/server";

import {
  fetchPayPalSubscription,
  paypalRequest,
  syncPayPalSubscription,
} from "@/app/api/_lib/paypal";

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
  try {
    const rawBody = await request.text();
    const event = JSON.parse(rawBody) as PayPalWebhookEvent;

    if (typeof event.id !== "string") {
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

    const subscriptionId = getSubscriptionId(event);
    if (subscriptionId) {
      const subscription = await fetchPayPalSubscription(subscriptionId);
      await syncPayPalSubscription(subscription);
    }

    // Replayed PayPal events are safe: syncPayPalSubscription updates the same
    // provider_subscription_id row and recomputes the same profile entitlement.
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[paypal-webhook]", message);
    return NextResponse.json({ ok: false, error: "Webhook processing failed." }, { status: 500 });
  }
}
