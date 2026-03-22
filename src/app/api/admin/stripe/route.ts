import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdminSession } from "@/app/api/_lib/supabase-server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" as any });
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(request);
    const stripe = getStripe();

    if (!stripe) {
      return NextResponse.json({
        configured: false,
        subscriptions: [],
        payments: [],
        stats: { totalRevenue: 0, activeSubscriptions: 0, totalCustomers: 0, mrr: 0 },
      });
    }

    // Fetch subscriptions
    const subscriptions = await stripe.subscriptions.list({
      limit: 50,
      status: "all",
      expand: ["data.customer", "data.items.data.price.product"],
    });

    // Fetch recent payments
    const payments = await stripe.paymentIntents.list({
      limit: 50,
    });

    // Fetch balance
    const balance = await stripe.balance.retrieve();

    // Calculate stats
    const activeSubs = subscriptions.data.filter((s) => s.status === "active" || s.status === "trialing");
    const mrr = activeSubs.reduce((sum, sub) => {
      const item = sub.items?.data?.[0];
      return sum + (item?.price?.unit_amount ?? 0);
    }, 0);

    const totalRevenue = payments.data
      .filter((p) => p.status === "succeeded")
      .reduce((sum, p) => sum + (p.amount_received ?? 0), 0);

    const subs = subscriptions.data.map((s) => {
      const customer = typeof s.customer === "string" ? null : s.customer;
      const item = s.items?.data?.[0];
      const product = item?.price?.product;
      const productName = (product && typeof product !== "string" && !("deleted" in product)) ? product.name : null;
      const planKey = s.metadata?.masseurmatch_plan ?? productName ?? "Unknown";
      const raw = s as any;

      return {
        id: s.id,
        status: s.status,
        planKey,
        customerId: typeof s.customer === "string" ? s.customer : s.customer?.id,
        customerEmail: (customer && "email" in customer ? customer.email : null) ?? s.metadata?.email ?? null,
        userId: s.metadata?.user_id ?? null,
        amount: (item?.price?.unit_amount ?? 0) / 100,
        currency: item?.price?.currency ?? "usd",
        currentPeriodStart: raw.current_period_start ? new Date(raw.current_period_start * 1000).toISOString() : null,
        currentPeriodEnd: raw.current_period_end ? new Date(raw.current_period_end * 1000).toISOString() : null,
        trialEnd: raw.trial_end ? new Date(raw.trial_end * 1000).toISOString() : null,
        canceledAt: raw.canceled_at ? new Date(raw.canceled_at * 1000).toISOString() : null,
        created: new Date(s.created * 1000).toISOString(),
      };
    });

    const pays = payments.data.map((p) => ({
      id: p.id,
      status: p.status,
      amount: (p.amount ?? 0) / 100,
      amountReceived: (p.amount_received ?? 0) / 100,
      currency: p.currency ?? "usd",
      customerEmail: typeof p.customer === "string" ? null : null,
      description: p.description,
      created: new Date(p.created * 1000).toISOString(),
    }));

    return NextResponse.json({
      configured: true,
      subscriptions: subs,
      payments: pays,
      stats: {
        totalRevenue: totalRevenue / 100,
        activeSubscriptions: activeSubs.length,
        totalCustomers: new Set(subscriptions.data.map((s) => typeof s.customer === "string" ? s.customer : s.customer?.id)).size,
        mrr: mrr / 100,
        availableBalance: (balance.available?.[0]?.amount ?? 0) / 100,
        pendingBalance: (balance.pending?.[0]?.amount ?? 0) / 100,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch Stripe data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
