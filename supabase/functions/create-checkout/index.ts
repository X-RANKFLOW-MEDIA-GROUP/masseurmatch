import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_PLANS = new Set(["free", "standard", "pro", "elite"]);
const STRIPE_PRICE_RE = /^price_[A-Za-z0-9]+$/;

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim() ?? "";
  if (!value) throw new HttpError(503, `${name} is not configured`);
  return value;
}

function getBearerToken(request: Request): string {
  const header = request.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) return "";
  return header.slice(7).trim();
}

function billingUrl(query: string): string {
  const configured = Deno.env.get("SITE_URL")?.trim() || "https://masseurmatch.com";
  const origin = new URL(configured);
  if (origin.protocol !== "https:" && origin.hostname !== "localhost") {
    throw new HttpError(503, "SITE_URL must use HTTPS");
  }
  const url = new URL("/pro/billing", origin);
  url.search = query;
  return url.toString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const stripeKey = requiredEnv("STRIPE_SECRET_KEY");
    const authToken = getBearerToken(req);
    if (!authToken) throw new HttpError(401, "Authentication required");

    const db = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userError } = await db.auth.getUser(authToken);
    if (userError || !userData.user?.email) {
      throw new HttpError(401, "Invalid or expired session");
    }
    const user = userData.user;

    const rl = checkRateLimit(`user:${user.id}`, { limit: 10, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    const payload = await req.json().catch(() => null) as { plan_key?: string } | null;
    const planKey = payload?.plan_key?.trim().toLowerCase() ?? "";
    if (!ALLOWED_PLANS.has(planKey)) {
      throw new HttpError(400, "Invalid subscription plan");
    }

    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("id, phone, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profileError) throw new HttpError(500, "Could not load provider profile");
    if (!profile) throw new HttpError(404, "Provider profile not found");

    const { data: plan, error: planError } = await db
      .from("subscription_plans")
      .select("id, code, stripe_price_id, is_active")
      .eq("code", planKey)
      .eq("is_active", true)
      .maybeSingle();
    if (planError) throw new HttpError(500, "Could not load subscription plan");
    if (!plan) throw new HttpError(400, "Subscription plan is unavailable");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    let customerId = profile.stripe_customer_id?.trim() || "";

    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 5 });
      customerId = customers.data[0]?.id || "";
    }

    if (customerId) {
      const [activeSubscriptions, trialingSubscriptions] = await Promise.all([
        stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 }),
        stripe.subscriptions.list({ customer: customerId, status: "trialing", limit: 1 }),
      ]);
      if (activeSubscriptions.data.length > 0 || trialingSubscriptions.data.length > 0) {
        throw new HttpError(409, "You already have an active subscription. Manage it from your dashboard.");
      }

      if (planKey === "free") {
        const allSubscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 50 });
        if (allSubscriptions.data.length > 0) {
          throw new HttpError(409, "Free trial is only available for new members. Please choose a paid plan.");
        }
      }
    }

    if (planKey === "free" && profile.phone) {
      const { data: duplicates, error: duplicateError } = await db
        .from("profiles")
        .select("id")
        .eq("phone", profile.phone)
        .neq("user_id", user.id)
        .limit(1);
      if (duplicateError) throw new HttpError(500, "Could not validate free trial eligibility");
      if (duplicates && duplicates.length > 0) {
        throw new HttpError(409, "This phone number is already associated with another account. Free trial is limited to one per person.");
      }
    }

    // Free is intentionally implemented as the existing 14-day cardless trial
    // on the Standard Stripe price. The public plan code remains "free" so the
    // webhook persists the correct MasseurMatch entitlement.
    let priceId = plan.stripe_price_id?.trim() || "";
    if (planKey === "free") {
      const { data: standardPlan, error: standardError } = await db
        .from("subscription_plans")
        .select("stripe_price_id")
        .eq("code", "standard")
        .eq("is_active", true)
        .maybeSingle();
      if (standardError) throw new HttpError(500, "Could not load free trial price");
      priceId = standardPlan?.stripe_price_id?.trim() || "";
    }

    if (!STRIPE_PRICE_RE.test(priceId)) {
      throw new HttpError(503, "Stripe pricing is not configured for this plan");
    }

    const metadata = {
      masseurmatch_plan: planKey,
      plan_code: planKey,
      profile_id: profile.id,
      user_id: user.id,
    };

    if (planKey === "free") {
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { profile_id: profile.id, user_id: user.id, source: "masseurmatch" },
        });
        customerId = customer.id;

        const { error: customerPersistError } = await db
          .from("profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", profile.id);
        if (customerPersistError) {
          throw new HttpError(500, "Could not persist Stripe customer mapping");
        }
      }

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: 14,
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        trial_settings: { end_behavior: { missing_payment_method: "pause" } },
        metadata,
      });

      console.log("[CREATE-CHECKOUT] Cardless trial created", {
        userId: user.id,
        profileId: profile.id,
        subscriptionId: subscription.id,
      });

      return json({
        success: true,
        subscription_id: subscription.id,
        trial_end: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId || undefined,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 14,
        metadata,
      },
      payment_method_collection: "if_required",
      allow_promotion_codes: true,
      success_url: billingUrl("?success=true"),
      cancel_url: billingUrl("?canceled=true"),
      metadata,
    });

    if (!session.url) throw new HttpError(502, "Stripe did not return a checkout URL");

    const { error: checkoutError } = await db.from("checkout_sessions").upsert(
      {
        profile_id: profile.id,
        plan_id: plan.id,
        stripe_checkout_session_id: session.id,
        stripe_customer_id: customerId || null,
        status: "open",
        metadata: { plan_code: planKey, user_id: user.id },
      },
      { onConflict: "stripe_checkout_session_id" },
    );
    if (checkoutError) throw new HttpError(500, "Could not persist checkout session");

    console.log("[CREATE-CHECKOUT] Checkout session created", {
      userId: user.id,
      profileId: profile.id,
      sessionId: session.id,
      plan: planKey,
    });

    return json({ url: session.url });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : String(error);
    if (status >= 500) console.error("[CREATE-CHECKOUT] Error", { message });
    return json({ error: status >= 500 ? "Checkout is temporarily unavailable." : message }, status);
  }
});
