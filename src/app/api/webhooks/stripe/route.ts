import Stripe from "stripe";
import { NextResponse } from "next/server";
import { env, hasStripe } from "@/lib/env";

type SubscriptionTier = "free" | "standard" | "pro" | "elite";

const PHOTO_LIMITS: Record<SubscriptionTier, number> = {
  free: 2,
  standard: 6,
  pro: 12,
  elite: 20,
};

const VISIBILITY_LEVELS: Record<SubscriptionTier, number> = {
  free: 1,
  standard: 2,
  pro: 3,
  elite: 4,
};

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
  id?: string;
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
  current_period_end?: number;
};

type StripeEvent = {
  type: string;
  data: {
    object: StripeEventObject;
  };
};

const VALID_TIERS = new Set<SubscriptionTier>(["free", "standard", "pro", "elite"]);

function resolveTier(obj: StripeEventObject, subscriptionStatus?: string): SubscriptionTier {
  const isActive = !subscriptionStatus || subscriptionStatus === "active" || subscriptionStatus === "trialing";
  if (!isActive) return "free";

  const planKey = obj?.metadata?.masseurmatch_plan ?? obj?.metadata?.plan_key;
  if (planKey && VALID_TIERS.has(planKey as SubscriptionTier)) {
    return planKey as SubscriptionTier;
  }

  const firstItemPriceId = obj?.items?.data?.[0]?.price?.id ?? obj?.plan?.id;
  const tierFromPrice = priceIdToTier(firstItemPriceId);
  if (tierFromPrice) return tierFromPrice;

  return "standard";
}

function getStripeClient() {
  if (!hasStripe || !env.stripeSecretKey) return null;
  return new Stripe(env.stripeSecretKey, { apiVersion: "2025-08-27.basil" });
}

async function updateProfileBilling(userId: string, updates: any) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
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
    body: JSON.stringify({
      ...updates,
      updated_at: new Date().toISOString(),
    }),
  });
}

export async function GET() {
  return NextResponse.json({
    configured: Boolean(hasStripe && env.stripeWebhookSecret),
    endpoint: "/api/webhooks/stripe",
  });
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const stripeSignature = request.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const rawBody = await request.text();

  const isLocalDev = process.env.NODE_ENV !== "production" && !webhookSecret;

  let event: StripeEvent;
  if (isLocalDev) {
    event = JSON.parse(rawBody) as StripeEvent;
  } else {
    if (!webhookSecret || !stripe) {
      return NextResponse.json({ error: "Webhook secret not configured." }, { status: 400 });
    }
    try {
      event = stripe.webhooks.constructEvent(rawBody, stripeSignature, webhookSecret) as any;
    } catch {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }
  }

  const obj = event.data?.object;
  const userId = obj?.metadata?.user_id ?? obj?.metadata?.userId;

  if (!userId) {
    return NextResponse.json({ ok: true, skipped: "no_user_id" });
  }

  if (event.type === "checkout.session.completed" || event.type === "customer.subscription.updated") {
    const status = obj?.status || "active";
    const tier = resolveTier(obj, status);
    const subscriptionId = (obj as any).subscription || (obj as any).id;
    
    const updates: any = {
      subscription_tier: tier,
      _tier: tier, // Legacy sync
      photo_limit: PHOTO_LIMITS[tier],
      visibility_level: VISIBILITY_LEVELS[tier],
      stripe_customer_id: obj.customer,
      stripe_subscription_id: subscriptionId,
    };

    if (obj.current_period_end) {
      updates.current_period_end = new Date(obj.current_period_end * 1000).toISOString();
    }

    await updateProfileBilling(userId, updates);
  } else if (event.type === "customer.subscription.deleted") {
    await updateProfileBilling(userId, {
      subscription_tier: "free",
      _tier: "free",
      photo_limit: 2,
      visibility_level: 1,
      stripe_subscription_id: null,
      current_period_end: null,
    });
  }

  return NextResponse.json({ ok: true });
}
