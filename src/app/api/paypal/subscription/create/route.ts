import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { PAYPAL_PLAN_IDS, paypalRequest, type PayPalPlanKey } from "@/app/api/_lib/paypal";
import { canStartPaidSubscription } from "@/app/api/_lib/provider-billing-gates";
import { requireRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

const schema = z.object({
  plan_key: z.enum(["standard", "pro", "elite"]),
});

type CreateSubscriptionResponse = {
  id: string;
  status: string;
  links?: Array<{ href: string; rel: string; method?: string }>;
};

function appOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const body = await parseJsonBody(request, schema);
    const planKey = body.plan_key as PayPalPlanKey;
    const planId = PAYPAL_PLAN_IDS[planKey];
    const admin = createSupabaseAdminClient();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, subscription_tier, profile_status")
      .eq("user_id", session.userId)
      .single();
    if (profileError || !profile) throw new RouteError(404, "Provider profile not found.");

    if (!canStartPaidSubscription(profile.profile_status)) {
      throw new RouteError(409, "Your provider profile must be approved before starting a paid subscription.");
    }

    const { data: activeSubscriptions, error: activeError } = await admin
      .from("therapist_subscriptions")
      .select("id, provider_subscription_id, status")
      .eq("profile_id", profile.id)
      .eq("provider", "paypal")
      .in("status", ["trialing", "active"])
      .limit(1);
    if (activeError) throw new RouteError(500, activeError.message);
    if (activeSubscriptions?.length) {
      throw new RouteError(409, "You already have an active PayPal subscription. Cancel or change the current subscription first.");
    }

    const origin = appOrigin(request);
    const subscription = await paypalRequest<CreateSubscriptionResponse>("/v1/billing/subscriptions", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: session.userId,
        subscriber: session.email ? { email_address: session.email } : undefined,
        application_context: {
          brand_name: "MasseurMatch",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${origin}/pro/billing?paypal=approved`,
          cancel_url: `${origin}/pro/billing?paypal=canceled`,
        },
      }),
    });

    const approvalUrl = subscription.links?.find((link) => link.rel === "approve")?.href;
    if (!approvalUrl) throw new RouteError(502, "PayPal did not return an approval URL.");

    const { data: plan } = await admin
      .from("subscription_plans")
      .select("id")
      .eq("code", planKey)
      .maybeSingle();

    const { error: checkoutError } = await admin.from("checkout_sessions").insert({
      profile_id: profile.id,
      therapist_profile_id: profile.id,
      plan_id: plan?.id ?? null,
      status: "open",
      metadata: {
        provider: "paypal",
        paypal_subscription_id: subscription.id,
        paypal_plan_id: planId,
        plan_key: planKey,
        user_id: session.userId,
      },
      updated_at: new Date().toISOString(),
    });
    if (checkoutError) throw new RouteError(500, checkoutError.message);

    return json({
      ok: true,
      provider: "paypal",
      subscription_id: subscription.id,
      approval_url: approvalUrl,
      plan_key: planKey,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
