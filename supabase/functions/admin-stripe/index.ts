import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  // Verify admin role
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }
  const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }
  const userId = claimsData.claims.sub as string;

  // Check admin role
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleData) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });
  const { action, ...params } = await req.json();

  try {
    let result: unknown;

    switch (action) {
      // --- Lookup subscriptions by email ---
      case "lookup_customer": {
        const customers = await stripe.customers.list({ email: params.email, limit: 1 });
        if (customers.data.length === 0) {
          result = { customer: null, subscriptions: [], payments: [] };
          break;
        }
        const cust = customers.data[0];
        const subs = await stripe.subscriptions.list({ customer: cust.id, status: "all", limit: 10 });
        const payments = await stripe.paymentIntents.list({ customer: cust.id, limit: 10 });
        result = {
          customer: { id: cust.id, email: cust.email, name: cust.name, created: cust.created },
          subscriptions: subs.data.map((s) => ({
            id: s.id,
            status: s.status,
            current_period_end: s.current_period_end,
            cancel_at_period_end: s.cancel_at_period_end,
            items: s.items.data.map((i) => ({
              price_id: i.price.id,
              product_id: i.price.product,
              amount: i.price.unit_amount,
              currency: i.price.currency,
              interval: i.price.recurring?.interval,
            })),
          })),
          payments: payments.data.map((p) => ({
            id: p.id,
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            created: p.created,
          })),
        };
        break;
      }

      // --- Cancel subscription ---
      case "cancel_subscription": {
        const sub = await stripe.subscriptions.update(params.subscription_id, {
          cancel_at_period_end: true,
        });
        result = { id: sub.id, status: sub.status, cancel_at_period_end: sub.cancel_at_period_end };
        break;
      }

      // --- Create coupon ---
      case "create_coupon": {
        const couponParams: Stripe.CouponCreateParams = {
          name: params.name,
          duration: params.duration || "once",
        };
        if (params.percent_off) couponParams.percent_off = params.percent_off;
        else if (params.amount_off) {
          couponParams.amount_off = params.amount_off;
          couponParams.currency = params.currency || "brl";
        }
        if (params.duration === "repeating") couponParams.duration_in_months = params.duration_in_months;
        const coupon = await stripe.coupons.create(couponParams);
        result = coupon;
        break;
      }

      // --- List coupons ---
      case "list_coupons": {
        const coupons = await stripe.coupons.list({ limit: 20 });
        result = coupons.data;
        break;
      }

      // --- Delete coupon ---
      case "delete_coupon": {
        await stripe.coupons.del(params.coupon_id);
        result = { deleted: true };
        break;
      }

      // --- Create promotion code ---
      case "create_promo_code": {
        const promoCode = await stripe.promotionCodes.create({
          coupon: params.coupon_id,
          code: params.code,
          ...(params.max_redemptions ? { max_redemptions: params.max_redemptions } : {}),
        });
        result = promoCode;
        break;
      }

      // --- Apply coupon to subscription ---
      case "apply_coupon": {
        const updatedSub = await stripe.subscriptions.update(params.subscription_id, {
          coupon: params.coupon_id,
        });
        result = { id: updatedSub.id, discount: updatedSub.discount };
        break;
      }

      // --- Refund payment ---
      case "create_refund": {
        const refundParams: Stripe.RefundCreateParams = {
          payment_intent: params.payment_intent_id,
        };
        if (params.amount) refundParams.amount = params.amount;
        if (params.reason) refundParams.reason = params.reason;
        const refund = await stripe.refunds.create(refundParams);
        result = refund;
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[admin-stripe] ${action} error:`, msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
