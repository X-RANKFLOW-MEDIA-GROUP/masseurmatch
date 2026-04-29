import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient();

    // 1. Total Stats
    const { count: totalTherapists } = await adminClient
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: pendingReviews } = await adminClient
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("profile_status", "pending_review");

    const { count: verifiedIdentity } = await adminClient
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "verified");

    // 2. Revenue by Tier (Approximate based on active subscriptions)
    const { data: tierData } = await adminClient
      .from("profiles")
      .select("subscription_tier");

    const revenueByTier = (tierData || []).reduce((acc: any, curr) => {
      const tier = curr.subscription_tier || 'free';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});

    // 3. Top Cities
    const { data: cityData } = await adminClient
      .from("profiles")
      .select("city")
      .not("city", "is", null);

    const topCities = (cityData || []).reduce((acc: any, curr) => {
      const city = curr.city;
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    const sortedCities = Object.entries(topCities)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // 4. Recent Signups (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: recentSignups } = await adminClient
      .from("profiles")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString());

    const signupsByDay = (recentSignups || []).reduce((acc: any, curr) => {
      const date = new Date(curr.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return json({
      ok: true,
      stats: {
        totalTherapists: totalTherapists || 0,
        pendingReviews: pendingReviews || 0,
        verifiedIdentity: verifiedIdentity || 0,
      },
      revenueByTier,
      topCities: sortedCities,
      signupsByDay: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
