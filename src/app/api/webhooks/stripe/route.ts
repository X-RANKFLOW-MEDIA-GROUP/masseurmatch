import Stripe from "stripe";
import { NextResponse } from "next/server";

type SubscriptionTier = "free" | "standard" | "pro" | "elite";

// Price ID → tier mapping (set STRIPE_PRICE_<TIER> env vars, or fall back to metadata)
// This is the authoritative resolution path for subscription plan changes.
function priceIdToTier(priceId: string | undefined): SubscriptionTier | null {
  if (!priceId) return null;
  const standardPrice = process.env.STRIPE_PRICE_STANDARD;
  const proPrice = process.env.STRIPE_PRICE_PRO;
  const elitePrice = process.env.STRIPE_PRICE_ELITE;
  if (standardPrice && priceId === standardPrice) return "standard";
  if (proPrice && priceId === proPrice) return "pro";
  if (elitePrice && priceId === elitePrice) return "elite";
  return null;
}

type StripeEventObject = {
  metadata?: {
    userId?: string;
    user_id?: string;
    plan_key?: string;
    masseurmatch_plan?: string;
  };
  customer?: string;
  status?: string;
  subscription?: string;
  items?: {
    data?: Array<{ price?: { id?: string } }>;
  };
  plan?: { id?: string };
};

type StripeEvent = {
  type: string;
  data: {
    object: StripeEventObject;
  };
};

const VALID_TIERS = new Set<SubscriptionTier>(["free", "standard", "pro", "elite"]);

/**
 * Resolve the subscription tier from:
 * 1. Checkout session / subscription metadata (explicit intent, e.g. free plan via masseurmatch_plan key)
 * 2. Subscription item price IDs (authoritative for portal plan swaps with no metadata)
 * 3. Fallback: if status is active/trialing without a recognized plan → "standard"
 *
 * Returns "free" whenever the subscription is not active/trialing.
 * Metadata is checked FIRST because the free plan uses the standard price ID as its
 * Stripe vehicle — checking price ID first would incorrectly resolve it to "standard".
 */
function resolveTier(obj: StripeEventObject, subscriptionStatus?: string): SubscriptionTier {
  const isActive = !subscriptionStatus || subscriptionStatus === "active" || subscriptionStatus === "trialing";

  if (!isActive) return "free";

  // Priority 1: explicit metadata plan (checked FIRST to handle free-trial case where
  // the free plan uses the standard price ID as the Stripe vehicle but sets
  // masseurmatch_plan: 'free' in metadata — price-ID mapping would incorrectly
  // resolve it to 'standard' if checked first).
  const planKey = obj?.metadata?.masseurmatch_plan ?? obj?.metadata?.plan_key;
  if (planKey && VALID_TIERS.has(planKey as SubscriptionTier)) {
    return planKey as SubscriptionTier;
  }

  // Priority 2: subscription item price ID (authoritative for portal plan swaps where
  // no metadata plan key is set — e.g., the customer upgraded via billing portal).
  const firstItemPriceId = obj?.items?.data?.[0]?.price?.id ?? obj?.plan?.id;
  const tierFromPrice = priceIdToTier(firstItemPriceId);
  if (tierFromPrice) return tierFromPrice;

  // Priority 3: active subscription with unknown plan key → standard (minimum paid tier)
  return "standard";
}

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_MCP_KEY || "";
  return new Stripe(key, { apiVersion: "2025-08-27.basil" });
}

async function updateTier(userId: string, tier: SubscriptionTier) {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return;

  await fetch(`${url}/rest/v1/profiles?user_id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ _tier: tier }),
  });
}

export async function GET() {
  return NextResponse.json({
    configured: Boolean((process.env.STRIPE_SECRET_KEY || process.env.STRIPE_MCP_KEY) && process.env.STRIPE_WEBHOOK_SECRET),
    endpoint: "/api/webhooks/stripe",
  });
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const stripeSignature = request.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const rawBody = await request.text();

  // Fail closed: always require a valid signature except in explicit local dev mode.
  // When STRIPE_WEBHOOK_SECRET is not set in production this returns 400 immediately.
  const isLocalDev = process.env.NODE_ENV !== "production" && !webhookSecret;

  let event: StripeEvent;
  if (isLocalDev) {
    event = JSON.parse(rawBody) as StripeEvent;
  } else {
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook secret not configured." }, { status: 400 });
    }
    try {
      event = stripe.webhooks.constructEvent(rawBody, stripeSignature, webhookSecret) as StripeEvent;
    } catch {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }
  }

  const obj = event.data?.object;
  const userId = obj?.metadata?.user_id ?? obj?.metadata?.userId;

  if (!userId) {
    return NextResponse.json({ ok: true, skipped: "no_user_id" });
  }

  if (event.type === "checkout.session.completed") {
    const tier = resolveTier(obj, "active");
    await updateTier(userId, tier);
  } else if (event.type === "customer.subscription.updated") {
    const status = obj?.status;
    const tier = resolveTier(obj, status);
    await updateTier(userId, tier);
  } else if (event.type === "customer.subscription.deleted") {
    await updateTier(userId, "free");
  }

  return NextResponse.json({ ok: true });
}
