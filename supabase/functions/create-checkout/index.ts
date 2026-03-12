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
// "free" is a $0 setup-intent trial (14 days) requiring card on file
const PLANS: Record<string, { name: string; amount: number; features: string; isFree?: boolean }> = {
  free:     { name: "Free", amount: 0, features: "1 photo, bottom search, no analytics", isFree: true },
  standard: { name: "Standard", amount: 3900, features: "6 photos, mid search, Available Now 60min" },
  pro:      { name: "Pro",      amount: 7900, features: "12 photos + video, top search, Verified badge" },
  elite:    { name: "Elite",    amount: 9900, features: "Everything in Pro, 2 cities" },
};

// Promotion codes are now entered by users at checkout (allow_promotion_codes: true)

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


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseClient = createClient(supabaseUrl, supabaseAnon);
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

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
    const plan = PLANS[plan_key];
    logStep("Plan requested", { plan_key, isFree: !!plan.isFree });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // ── Anti-fraud: check for existing Stripe customers with same email or past subs ──
    const customers = await stripe.customers.list({ email: user.email, limit: 5 });
    let customerId: string | undefined;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });

      // Check for any active or trialing subscription
      const activeSubs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
      const trialingSubs = await stripe.subscriptions.list({ customer: customerId, status: "trialing", limit: 1 });
      if (activeSubs.data.length > 0 || trialingSubs.data.length > 0) {
        throw new Error("You already have an active subscription. Manage it from your dashboard.");
      }

      // Anti-fraud for free plan: block if they ever had a subscription (prevents trial abuse)
      if (plan.isFree) {
        const allSubs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 50 });
        if (allSubs.data.length > 0) {
          throw new Error("Free trial is only available for new members. Please choose a paid plan.");
        }
      }
    }

    // ── Anti-fraud for free plan: check if another profile exists with same phone ──
    if (plan.isFree) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("phone")
        .eq("user_id", user.id)
        .single();

      if (profile?.phone) {
        const { data: duplicates } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("phone", profile.phone)
          .neq("user_id", user.id)
          .limit(1);

        if (duplicates && duplicates.length > 0) {
          throw new Error("This phone number is already associated with another account. Free trial is limited to one per person.");
        }
      }
    }

    // For free plan: create a trial subscription without requiring a credit card
    if (plan.isFree) {
      const priceId = await getOrCreatePrice(stripe, "standard"); // Use standard as the base

      // Create or reuse customer
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { user_id: user.id, source: "masseurmatch" },
        });
        customerId = customer.id;
        logStep("Created new customer for cardless trial", { customerId });
      }

      // Create subscription directly with 14-day trial, no payment method required
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: 14,
        payment_behavior: "default_incomplete",
        payment_settings: {
          save_default_payment_method: "on_subscription",
        },
        trial_settings: {
          end_behavior: { missing_payment_method: "pause" },
        },
        metadata: { masseurmatch_plan: "free", user_id: user.id },
      });

      logStep("Free trial subscription created (no card)", { subscriptionId: subscription.id });

      return new Response(JSON.stringify({
        success: true,
        subscription_id: subscription.id,
        trial_end: new Date(subscription.trial_end! * 1000).toISOString(),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Paid plan checkout ──
    const priceId = await getOrCreatePrice(stripe, plan_key);

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 14,
        metadata: { masseurmatch_plan: plan_key, user_id: user.id },
      },
      payment_method_collection: "if_required",
      allow_promotion_codes: true,
      success_url: `${req.headers.get("origin")}/dashboard/subscription?success=true`,
      cancel_url: `${req.headers.get("origin")}/dashboard/subscription?canceled=true`,
      metadata: { user_id: user.id, plan_key },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
