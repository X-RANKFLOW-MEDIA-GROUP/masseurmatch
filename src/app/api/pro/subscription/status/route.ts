import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: subscription, error } = await supabase
      .from("profiles")
      .select(
        `stripe_subscription_id,
        stripe_customer_id,
        subscription_tier,
        current_period_end`
      )
      .eq("user_id", session.userId)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: "Subscription not found" }, { status: 404 });
    }

    const tier = subscription.subscription_tier || "free";
    return NextResponse.json({
      ok: true,
      subscription: {
        plan: tier,
        status: tier === "free" ? "free" : "active",
        current_period_start: null,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: false,
        stripe_customer_id: subscription.stripe_customer_id,
        stripe_subscription_id: subscription.stripe_subscription_id,
      },
    });
  } catch (error) {
    console.error("[api/pro/subscription/status] Error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch subscription status" }, { status: 500 });
  }
}
