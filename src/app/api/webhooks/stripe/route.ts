import { NextResponse } from "next/server";
import Stripe from "stripe";
import { updateSubscriptionTier } from "@/mm/lib/mutations";

function getStripeClient(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
  });
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;

  if (stripe && signature && process.env.STRIPE_WEBHOOK_SECRET) {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } else {
    event = JSON.parse(rawBody) as Stripe.Event;
  }

  const userId = (event.data.object as { metadata?: Record<string, string> }).metadata?.userId;

  if (!userId) {
    return NextResponse.json({ ok: true });
  }

  if (event.type === "checkout.session.completed") {
    const tier = ((event.data.object as { metadata?: Record<string, string> }).metadata?.tier || "pro") as "pro" | "featured";
    await updateSubscriptionTier(userId, tier);
  }

  if (event.type === "customer.subscription.updated") {
    const planNickname = ((event.data.object as { items?: { data?: Array<{ price?: { nickname?: string | null } }> } }).items?.data?.[0]?.price?.nickname ||
      "pro")
      .toLowerCase()
      .includes("featured")
      ? "featured"
      : "pro";
    await updateSubscriptionTier(userId, planNickname);
  }

  if (event.type === "customer.subscription.deleted") {
    await updateSubscriptionTier(userId, "free");
  }

  return NextResponse.json({ ok: true });
}
