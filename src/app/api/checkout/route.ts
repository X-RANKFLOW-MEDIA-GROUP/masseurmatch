import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-12-18.acacia",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
);

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "https://masseurmatch.com";

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY is missing" }, { status: 500 });
    }

    const body = await request.json();
    const planCode = String(body.planCode ?? body.plan_code ?? "").trim();
    const profileId = String(body.profileId ?? body.profile_id ?? "").trim();
    const therapistProfileId = String(body.therapistProfileId ?? body.therapist_profile_id ?? "").trim();

    if (!planCode || !profileId || !therapistProfileId) {
      return NextResponse.json({ error: "planCode, profileId and therapistProfileId are required" }, { status: 400 });
    }

    const { data: plan, error: planError } = await supabaseAdmin
      .from("subscription_plans")
      .select("id, code, name, price_cents, currency, stripe_price_id")
      .eq("code", planCode)
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (!plan.stripe_price_id) {
      return NextResponse.json({ error: `Missing stripe_price_id for ${plan.code}` }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      success_url: `${siteUrl}/dashboard/billing?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
      metadata: {
        profile_id: profileId,
        therapist_profile_id: therapistProfileId,
        plan_code: plan.code,
      },
      subscription_data: {
        metadata: {
          profile_id: profileId,
          therapist_profile_id: therapistProfileId,
          plan_code: plan.code,
        },
      },
    });

    await supabaseAdmin.from("checkout_sessions").insert({
      profile_id: profileId,
      therapist_profile_id: therapistProfileId,
      plan_id: plan.id,
      stripe_checkout_session_id: session.id,
      stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
      status: "open",
      metadata: session as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
