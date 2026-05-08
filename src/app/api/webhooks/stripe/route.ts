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

const WEBHOOK_RATE_LIMIT = { windowMs: 60_000, max: 120 };
const webhookHits = new Map<string, { count: number; resetAt: number }>();
const processedEvents = new Map<string, number>();
const EVENT_TTL_MS = 24 * 60 * 60 * 1000;

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
  id?: string;
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

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const existing = webhookHits.get(ip);
  if (!existing || now >= existing.resetAt) {
    webhookHits.set(ip, { count: 1, resetAt: now + WEBHOOK_RATE_LIMIT.windowMs });
    return false;
  }

  if (existing.count >= WEBHOOK_RATE_LIMIT.max) return true;
  existing.count += 1;
  return false;
}

function cleanupProcessedEvents() {
  const now = Date.now();
  for (const [id, timestamp] of processedEvents.entries()) {
    if (now - timestamp > EVENT_TTL_MS) {
      processedEvents.delete(id);
    }
  }
}

async function updateProfileBilling(userId: string, updates: Record<string, unknown>) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { ok: false, status: 500, error: "Supabase env vars missing" } as const;
  }

  try {
    const response = await fetch(`${url}/rest/v1/profiles?user_id=eq.${userId}`, {
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

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, status: response.status, error: text || "Supabase update failed" } as const;
    }

    return { ok: true } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, status: 500, error: message } as const;
  }
}

export async function GET() {
  return NextResponse.json({
    configured: Boolean(hasStripe && env.stripeWebhookSecret),
    endpoint: "/api/webhooks/stripe",
  });
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(getClientIp(request))) {
      console.warn("[stripe-webhook] rate-limited request");
      return NextResponse.json({ error: "Too many webhook requests" }, { status: 429 });
    }

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
        console.error("[stripe-webhook] secret or stripe client not configured");
        return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 500 });
      }
      try {
        event = stripe.webhooks.constructEvent(rawBody, stripeSignature, webhookSecret) as StripeEvent;
      } catch {
        console.warn("[stripe-webhook] invalid webhook signature");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    cleanupProcessedEvents();
    if (event.id && processedEvents.has(event.id)) {
      return NextResponse.json({ ok: true, skipped: "duplicate_event" });
    }

    const obj = event.data?.object;
    const userId = obj?.metadata?.user_id ?? obj?.metadata?.userId;

    if (!userId) {
      console.info(`[stripe-webhook] skipped event ${event.id ?? "unknown"}: no user_id metadata`);
      return NextResponse.json({ ok: true, skipped: "no_user_id" });
    }

    let updateResult: { ok: boolean; status?: number; error?: string } = { ok: true };

    if (event.type === "checkout.session.completed" || event.type === "customer.subscription.updated") {
      const status = obj?.status || "active";
      const tier = resolveTier(obj, status);
      const subscriptionId = obj.subscription || obj.id;

      const updates: Record<string, unknown> = {
        subscription_tier: tier,
        _tier: tier,
        photo_limit: PHOTO_LIMITS[tier],
        visibility_level: VISIBILITY_LEVELS[tier],
        stripe_customer_id: obj.customer,
        stripe_subscription_id: subscriptionId,
      };

      if (obj.current_period_end) {
        updates.current_period_end = new Date(obj.current_period_end * 1000).toISOString();
      }

      updateResult = await updateProfileBilling(userId, updates);
    } else if (event.type === "customer.subscription.deleted") {
      updateResult = await updateProfileBilling(userId, {
        subscription_tier: "free",
        _tier: "free",
        photo_limit: 2,
        visibility_level: 1,
        stripe_subscription_id: null,
        current_period_end: null,
      });
    }

    if (!updateResult.ok) {
      console.error(`[stripe-webhook] failed persisting event ${event.id ?? "unknown"}`, {
        status: updateResult.status,
        error: updateResult.error,
      });
      // SECURITY FIX: Return 500 to trigger Stripe retry - prevents lost payment events
      return NextResponse.json({ ok: false, error: "persist_failed" }, { status: 500 });
    }

    if (event.id) {
      processedEvents.set(event.id, Date.now());
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[stripe-webhook] unhandled error", {
      message: error instanceof Error ? error.message : "unknown",
    });
    // SECURITY FIX: Return 500 to trigger Stripe retry on unexpected errors
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
