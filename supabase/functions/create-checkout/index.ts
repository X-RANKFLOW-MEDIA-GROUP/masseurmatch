import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-CHECKOUT] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

// Plan definitions — prices are created lazily in Stripe on first use
const PLANS: Record<string, { name: string; amount: number; features: string }> = {
  standard: { name: "Standard", amount: 2900, features: "Full profile, 1 city, 6 photos" },
  premium:  { name: "Premium",  amount: 5900, features: "3 cities, 10 photos, Premium badge, SEO" },
  gold:     { name: "Gold",     amount: 9900, features: "5 cities, top placement, analytics" },
  platinum: { name: "Platinum", amount: 14900, features: "Unlimited cities, permanent boost, priority support" },
};

const FOUNDER_COUPON_ID = "FOUNDER50";
const FOUNDER_MAX_REDEMPTIONS = 50;

async function getOrCreatePrice(stripe: Stripe, planKey: string): Promise<string> {
  const plan = PLANS[planKey];
  // Search for existing product by metadata
  const products = await stripe.products.search({
    query: `metadata["masseurmatch_plan"]:"${planKey}"`,
  });

  let productId: string;
  if (products.data.length > 0) {
    productId = products.data[0].id;
    logStep("Found existing product", { planKey, productId });
  } else {
    const product = await stripe.products.create({
      name: `MasseurMatch ${plan.name}`,
      description: plan.features,
      metadata: { masseurmatch_plan: planKey },
    });
    productId = product.id;
    logStep("Created product", { planKey, productId });
  }

  // Find existing recurring price for this product
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    type: "recurring",
    limit: 5,
  });

  const existingPrice = prices.data.find(
    (p) => p.unit_amount === plan.amount && p.recurring?.interval === "month"
  );

  if (existingPrice) {
    logStep("Found existing price", { priceId: existingPrice.id });
    return existingPrice.id;
  }

  const price = await stripe.prices.create({
    product: productId,
    unit_amount: plan.amount,
    currency: "usd",
    recurring: { interval: "month" },
  });
  logStep("Created price", { priceId: price.id });
  return price.id;
}

async function getOrCreateFounderCoupon(stripe: Stripe): Promise<string | null> {
  try {
    const coupon = await stripe.coupons.retrieve(FOUNDER_COUPON_ID);
    // Check if coupon still has redemptions left
    if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
      logStep("Founder coupon fully redeemed");
      return null;
    }
    logStep("Found existing founder coupon", { timesRedeemed: coupon.times_redeemed });
    return coupon.id;
  } catch {
    // Create the coupon
    try {
      const coupon = await stripe.coupons.create({
        id: FOUNDER_COUPON_ID,
        percent_off: 50,
        duration: "forever",
        max_redemptions: FOUNDER_MAX_REDEMPTIONS,
        name: "Founder Deal — 50% OFF",
        metadata: { source: "masseurmatch" },
      });
      logStep("Created founder coupon", { couponId: coupon.id });
      return coupon.id;
    } catch (e) {
      logStep("Failed to create coupon", { error: String(e) });
      return null;
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    const { plan_key } = await req.json();
    if (!plan_key || !PLANS[plan_key]) {
      throw new Error(`Invalid plan: ${plan_key}. Valid plans: ${Object.keys(PLANS).join(", ")}`);
    }
    logStep("Plan requested", { plan_key });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get or create customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });

      // Check for active subscription
      const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
      if (subs.data.length > 0) {
        throw new Error("You already have an active subscription. Manage it from your dashboard.");
      }
    }

    // Get or create the price for this plan
    const priceId = await getOrCreatePrice(stripe, plan_key);

    // Check founder coupon availability
    const founderCouponId = await getOrCreateFounderCoupon(stripe);

    // Build checkout session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 14,
        metadata: { masseurmatch_plan: plan_key, user_id: user.id },
      },
      payment_method_collection: "always",
      success_url: `${req.headers.get("origin")}/dashboard/subscription?success=true`,
      cancel_url: `${req.headers.get("origin")}/dashboard/subscription?canceled=true`,
      metadata: { user_id: user.id, plan_key },
    };

    // Apply founder coupon if available
    if (founderCouponId) {
      sessionParams.discounts = [{ coupon: founderCouponId }];
      logStep("Applying founder coupon");
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
