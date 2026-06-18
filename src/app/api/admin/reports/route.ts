export const dynamic = "force-dynamic";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient();

    // Fetch aggregate learning scores (top therapists by performance)
    const { data: topTherapists, error: scoresError } = await adminClient
      .from("therapist_learning_scores")
      .select("therapist_id, city, intent, impressions, profile_clicks, contact_clicks, ctr, contact_rate, weighted_score, updated_at")
      .eq("city", "__all__")
      .eq("intent", "general")
      .order("weighted_score", { ascending: false })
      .limit(20);

    if (scoresError) {
      // Table might not exist yet; gracefully degrade
    }

    // Fetch recent ranking events count by event_name
    const { data: eventCounts, error: eventsError } = await adminClient
      .rpc("get_ranking_event_counts")
      .maybeSingle();

    // If RPC doesn't exist, do a direct count approach
    let eventBreakdown: Record<string, number> = {};
    if (eventsError || !eventCounts) {
      const { data: events } = await adminClient
        .from("ranking_events")
        .select("event_name")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (events) {
        for (const e of events) {
          eventBreakdown[e.event_name] = (eventBreakdown[e.event_name] || 0) + 1;
        }
      }
    } else {
      eventBreakdown = eventCounts as Record<string, number>;
    }

    // Fetch total profiles count
    const { count: totalProfiles } = await adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true });

    const { count: activeProfiles } = await adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    const { count: verifiedProfiles } = await adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_verified_identity", true);

    // Fetch identity verification stats
    const { count: pendingVerifications } = await adminClient
      .from("identity_verifications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: completedVerifications } = await adminClient
      .from("identity_verifications")
      .select("id", { count: "exact", head: true })
      .eq("status", "verified");

    return json({
      ok: true,
      profiles: {
        total: totalProfiles ?? 0,
        active: activeProfiles ?? 0,
        verified: verifiedProfiles ?? 0,
      },
      identityVerifications: {
        pending: pendingVerifications ?? 0,
        completed: completedVerifications ?? 0,
      },
      topTherapists: (topTherapists ?? []).map((t: any) => ({
        therapistId: t.therapist_id,
        impressions: t.impressions,
        profileClicks: t.profile_clicks,
        contactClicks: t.contact_clicks,
        ctr: Number(t.ctr),
        contactRate: Number(t.contact_rate),
        weightedScore: Number(t.weighted_score),
      })),
      events: eventBreakdown,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
