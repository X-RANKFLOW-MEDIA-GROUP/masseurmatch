import Stripe from "stripe";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";
import { findGrowthAddon, parseAddonPriceForCheckout } from "@/app/_lib/provider-growth-addons";
import { env } from "@/lib/env";

function getStripe() {
  if (!env.stripeSecretKey) {
    throw new RouteError(500, "Stripe is not configured.");
  }

  return new Stripe(env.stripeSecretKey, { apiVersion: "2025-08-27.basil" });
}

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const body = (await request.json().catch(() => ({}))) as { addonSlug?: string };
    const addonSlug = typeof body.addonSlug === "string" ? body.addonSlug : "";

    if (!addonSlug) {
      throw new RouteError(400, "addonSlug is required.");
    }

    const addon = findGrowthAddon(addonSlug);
    if (!addon) {
      throw new RouteError(404, "Add-on not found.");
    }

    const priceSpec = parseAddonPriceForCheckout(addon);
    if (!priceSpec) {
      throw new RouteError(422, "This add-on does not have a checkout price.");
    }

    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("display_name")
      .eq("user_id", session.userId)
      .maybeSingle();

    const stripe = getStripe();
    const origin = request.headers.get("origin") || env.appUrl;

    const customer = await stripe.customers.create({
      email: session.email,
      name: profile?.display_name || undefined,
      metadata: {
        source: "masseurmatch-provider-dashboard",
        user_id: session.userId,
      },
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: priceSpec.recurringInterval ? "subscription" : "payment",
      customer: customer.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: priceSpec.unitAmountCents,
            recurring: priceSpec.recurringInterval ? { interval: priceSpec.recurringInterval } : undefined,
            product_data: {
              name: `MasseurMatch Add-on · ${addon.name}`,
              description: addon.description,
              metadata: {
                addon_slug: addon.slug,
                addon_category: addon.categoryId,
              },
            },
          },
        },
      ],
      success_url: `${origin}/pro/billing?addon_success=true&addon=${encodeURIComponent(addon.slug)}`,
      cancel_url: `${origin}/pro/billing?addon_canceled=true&addon=${encodeURIComponent(addon.slug)}`,
      metadata: {
        user_id: session.userId,
        addon_slug: addon.slug,
      },
      allow_promotion_codes: true,
    });

    return json({ ok: true, url: checkoutSession.url });
  } catch (error) {
    return errorResponse(error);
  }
}
