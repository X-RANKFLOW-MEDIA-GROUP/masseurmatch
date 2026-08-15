import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession, type RequestSession } from "@/app/api/_lib/session";
import {
  createSupabaseAdminClient,
  ensureUserProfileAndRole,
  recordAuditLog,
} from "@/app/api/_lib/supabase-server";
import { buildCityRevalidatePaths, buildTherapistRevalidatePaths, normalizeRevalidatePaths, triggerRevalidate } from "@/app/_lib/revalidate";
import { slugify } from "@/app/_lib/utils";
import type { Database } from "@/integrations/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const GROWTH_SELECT =
  "id, slug, city, subscription_tier, available_now, available_now_expires, travel_schedule, promotions, visibility_status, is_active, profile_status, profile_views";

const travelEntrySchema = z.object({
  city: z.string().min(1).max(120),
  state: z.string().max(60).nullable().optional(),
  start_date: z.string().min(1).max(40),
  end_date: z.string().min(1).max(40),
});

const promotionSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(400),
});

const growthSchema = z.object({
  travel_schedule: z.array(travelEntrySchema).max(20).optional(),
  promotions: z.array(promotionSchema).max(10).optional(),
});

async function loadOrCreateGrowthProfile(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  session: RequestSession,
) {
  const { data, error } = await admin
    .from("profiles")
    .select(GROWTH_SELECT)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error) throw new RouteError(500, error.message);
  if (data) return data;

  if (session.role !== "provider" && session.role !== "admin") {
    throw new RouteError(404, "Profile not found.");
  }

  const { data: authUser, error: userError } = await admin.auth.admin.getUserById(session.userId);
  if (userError || !authUser?.user) throw new RouteError(404, "Profile not found.");

  await ensureUserProfileAndRole(authUser.user, { defaultRole: "provider" });

  const { data: created, error: retryError } = await admin
    .from("profiles")
    .select(GROWTH_SELECT)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (retryError) throw new RouteError(500, retryError.message);
  if (!created) throw new RouteError(404, "Profile not found.");
  return created;
}

async function loadDashboardInsights(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  session: RequestSession,
  profileId: string,
) {
  const db = admin as any;
  const [snapshotResult, photosResult, identityResult, supportResult, notificationResult] = await Promise.all([
    db
      .from("ai_profile_coach_daily_snapshots")
      .select("profile_score,visibility_score,trust_score,content_score,conversion_score,profile_views_7d,profile_views_30d,contact_clicks_7d,contact_rate_pct,average_search_position,local_demand_score,local_demand_trend,strongest_keyword,top_recommendation_title,top_recommendation_action,snapshot_date")
      .eq("profile_id", profileId)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    db.from("profile_photos").select("moderation_status").eq("profile_id", profileId),
    db
      .from("identity_verifications")
      .select("status,updated_at")
      .eq("user_id", session.userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    db.from("support_tickets").select("id", { count: "exact", head: true }).eq("user_id", session.userId).in("status", ["open", "pending", "in_progress"]),
    db.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", session.userId).eq("is_read", false),
  ]);

  const photoCounts = { approved: 0, pending: 0, rejected: 0 };
  for (const photo of photosResult.data ?? []) {
    const status = photo.moderation_status || "pending";
    if (status === "approved") photoCounts.approved += 1;
    else if (status === "rejected") photoCounts.rejected += 1;
    else photoCounts.pending += 1;
  }

  return {
    ai: snapshotResult.data ?? null,
    photos: photoCounts,
    identityStatus: identityResult.data?.status ?? "not_started",
    supportOpen: supportResult.count ?? 0,
    unreadNotifications: notificationResult.count ?? 0,
  };
}

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const admin = createSupabaseAdminClient();
    const data = await loadOrCreateGrowthProfile(admin, session);
    const insights = await loadDashboardInsights(admin, session, data.id);
    return json({ ok: true, profile: data, insights });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-growth", { limit: 30, windowMs: 60_000 });
    const session = await requireRequestSession(request);
    const body = await parseJsonBody(request, growthSchema);
    const admin = createSupabaseAdminClient();
    const profile = await loadOrCreateGrowthProfile(admin, session);

    const updates: ProfileUpdate = { updated_at: new Date().toISOString() };
    if (body.travel_schedule !== undefined) updates.travel_schedule = body.travel_schedule;
    if (body.promotions !== undefined) updates.promotions = body.promotions;

    const { data: next, error: updateError } = await admin
      .from("profiles")
      .update(updates)
      .eq("user_id", session.userId)
      .select(GROWTH_SELECT)
      .maybeSingle();

    if (updateError) throw new RouteError(500, updateError.message);

    await recordAuditLog(session.userId, "provider.growth.update", "profile", profile.id, {
      fields: Object.keys(body),
    });

    if (next) {
      try {
        const therapistPaths = await buildTherapistRevalidatePaths({ id: next.id, slug: next.slug, city: next.city });
        const travelPaths = body.travel_schedule
          ? await Promise.all(body.travel_schedule.map((trip) => buildCityRevalidatePaths(slugify(trip.city))))
          : [];
        await triggerRevalidate(normalizeRevalidatePaths([...therapistPaths, ...travelPaths.flat()]), { request });
      } catch (revalidationError) {
        console.error("[api/pro/growth] Revalidation failed:", revalidationError);
      }
    }

    return json({ ok: true, profile: next });
  } catch (error) {
    return errorResponse(error);
  }
}
