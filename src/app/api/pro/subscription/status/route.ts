import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll() {},
      },
    }
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: subscription, error } = await supabase
      .from("profiles")
      .select(
        `
        stripe_subscription_id,
        stripe_customer_id,
        subscription_plan,
        subscription_status,
        subscription_current_period_start,
        subscription_current_period_end,
        subscription_cancel_at_period_end
      `
      )
      .eq("user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      subscription: {
        plan: subscription.subscription_plan || "free",
        status: subscription.subscription_status || "active",
        current_period_start: subscription.subscription_current_period_start,
        current_period_end: subscription.subscription_current_period_end,
        cancel_at_period_end: subscription.subscription_cancel_at_period_end || false,
        stripe_customer_id: subscription.stripe_customer_id,
        stripe_subscription_id: subscription.stripe_subscription_id,
      },
    });
  } catch (error) {
    console.error("[api/pro/subscription/status] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}
