import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { fetchPayPalSubscription, syncPayPalSubscription } from "@/app/api/_lib/paypal";
import { requireRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export async function POST(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const admin = createSupabaseAdminClient();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", session.userId)
      .single();
    if (profileError || !profile) throw new RouteError(404, "Provider profile not found.");

    const { data: rows, error } = await admin
      .from("checkout_sessions")
      .select("id, metadata, created_at")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new RouteError(500, error.message);

    const checkout = rows?.find((row) => {
      const metadata = row.metadata as Record<string, unknown> | null;
      return metadata?.provider === "paypal" && typeof metadata?.paypal_subscription_id === "string";
    });

    const metadata = checkout?.metadata as Record<string, unknown> | null;
    const subscriptionId = typeof metadata?.paypal_subscription_id === "string" ? metadata.paypal_subscription_id : null;
    if (!subscriptionId) throw new RouteError(404, "No PayPal subscription checkout found.");

    const subscription = await fetchPayPalSubscription(subscriptionId);
    if (subscription.custom_id !== session.userId) throw new RouteError(403, "Subscription ownership mismatch.");

    const synced = await syncPayPalSubscription(subscription);

    if (checkout?.id) {
      await admin
        .from("checkout_sessions")
        .update({
          status: subscription.status === "APPROVAL_PENDING" ? "open" : "complete",
          updated_at: new Date().toISOString(),
        })
        .eq("id", checkout.id);
    }

    return json({
      ok: true,
      provider: "paypal",
      subscription_id: subscription.id,
      paypal_status: subscription.status,
      plan_key: synced.planKey,
      status: synced.localStatus,
      current_period_end: synced.nextBilling,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
