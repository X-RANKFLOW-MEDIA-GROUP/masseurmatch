import { errorResponse, json } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient();

    const { count: totalTherapists } = await adminClient
      .from("therapist_profiles")
      .select("id", { count: "exact", head: true });

    const { count: pendingReviews } = await adminClient
      .from("therapist_profiles")
      .select("id", { count: "exact", head: true })
      .eq("moderation_status", "pending");

    const { count: verifiedIdentity } = await adminClient
      .from("therapist_profiles")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "verified");

    const { data: cityRows } = await adminClient
      .from("therapist_profiles")
      .select("city")
      .not("city", "is", null);

    const cityCounts: Record<string, number> = {};
    for (const row of cityRows || []) {
      const city = String(row.city || "Unknown");
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    }

    const topCities = Object.entries(cityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const { data: subscriptionRows } = await adminClient
      .from("therapist_subscriptions")
      .select("subscription_plans(code)")
      .in("status", ["trialing", "active"]);

    const revenueByTier: Record<string, number> = {};
    for (const row of subscriptionRows || []) {
      const plan = Array.isArray(row.subscription_plans) ? row.subscription_plans[0] : row.subscription_plans;
      const tier = plan?.code || "free";
      revenueByTier[tier] = (revenueByTier[tier] || 0) + 1;
    }

    return json({
      ok: true,
      stats: {
        totalTherapists: totalTherapists || 0,
        pendingReviews: pendingReviews || 0,
        verifiedIdentity: verifiedIdentity || 0,
      },
      revenueByTier,
      topCities,
      signupsByDay: [],
    });
  } catch (error) {
    return errorResponse(error);
  }
}
