import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CHECK-SUBSCRIPTION] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

const emptySubscriptionPayload = {
  subscribed: false,
  plan_key: null,
  plan_name: null,
  subscription_end: null,
  is_trial: false,
  has_founder_discount: false,
};

const normalizeStripeSecretKey = (rawKey: string): { key: string | null; error: string | null } => {
  const sanitized = rawKey.replace(/[^\x20-\x7E]/g, "").trim().replace(/^['"]+|['"]+$/g, "");
  const extracted = sanitized.match(/sk_(test|live)_[A-Za-z0-9_]+/);
  const candidate = extracted?.[0] ?? sanitized;

  if (!candidate) {
    return { key: null, error: "STRIPE_SECRET_KEY is not set" };
  }

  if (candidate.startsWith("pk_")) {
    return {
      key: null,
      error: "STRIPE_SECRET_KEY must be a secret key (sk_test_ or sk_live_), not a publishable key (pk_)",
    };
  }

  if (candidate.startsWith("rk_")) {
    return {
      key: null,
      error: "STRIPE_SECRET_KEY must be a full secret key (sk_test_ or sk_live_), not a restricted key (rk_)",
    };
  }

  if (!candidate.startsWith("sk_test_") && !candidate.startsWith("sk_live_")) {
    return { key: null, error: "STRIPE_SECRET_KEY is invalid (must start with sk_test_ or sk_live_)" };
  }

  return { key: candidate, error: null };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { key: stripeKey, error: stripeKeyError } = normalizeStripeSecretKey(
      Deno.env.get("STRIPE_SECRET_KEY") ?? ""
    );

    if (!stripeKey) {
      logStep("Stripe key invalid", { reason: stripeKeyError });
      return new Response(
        JSON.stringify({ ...emptySubscriptionPayload, config_error: stripeKeyError }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    logStep("Stripe key verified", { prefix: stripeKey.substring(0, 12) });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify(emptySubscriptionPayload), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 10,
    });

    const activeSub = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    if (!activeSub) {
      logStep("No active subscription");
      return new Response(JSON.stringify(emptySubscriptionPayload), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planKey = activeSub.metadata?.masseurmatch_plan || null;
    const isTrial = activeSub.status === "trialing";

    let subscriptionEnd: string | null = null;
    try {
      const endTs = Number(activeSub.current_period_end);
      if (endTs && !isNaN(endTs)) {
        subscriptionEnd = new Date(endTs * 1000).toISOString();
      }
    } catch { /* ignore */ }

    let trialEnd: string | null = null;
    try {
      if (activeSub.trial_end) {
        const trialTs = Number(activeSub.trial_end);
        if (trialTs && !isNaN(trialTs)) {
          trialEnd = new Date(trialTs * 1000).toISOString();
        }
      }
    } catch { /* ignore */ }

    const hasFounderDiscount = activeSub.discount?.coupon?.id === "FOUNDER50";

    const priceItem = activeSub.items.data[0];
    const product = await stripe.products.retrieve(priceItem.price.product as string);

    logStep("Active subscription found", {
      planKey,
      status: activeSub.status,
      isTrial,
      hasFounderDiscount,
    });

    return new Response(JSON.stringify({
      subscribed: true,
      plan_key: planKey,
      plan_name: product.name,
      subscription_end: subscriptionEnd,
      trial_end: trialEnd,
      is_trial: isTrial,
      has_founder_discount: hasFounderDiscount,
      status: activeSub.status,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });

    const isStripeKeyIssue =
      msg.includes("STRIPE_SECRET_KEY") ||
      msg.includes("Invalid API Key provided") ||
      msg.includes("You did not provide an API key") ||
      msg.includes("api_key");

    if (isStripeKeyIssue) {
      return new Response(
        JSON.stringify({ ...emptySubscriptionPayload, config_error: "stripe_key_invalid" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
