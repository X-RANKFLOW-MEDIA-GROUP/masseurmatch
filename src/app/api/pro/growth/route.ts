import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession, type RequestSession } from "@/app/_lib/session";
import {
  createSupabaseAdminClient,
  ensureUserProfileAndRole,
  recordAuditLog,
} from "@/app/api/_lib/supabase-server";
import { normalizeProviderTier, TRAVEL_DESTINATION_LIMITS } from "@/lib/provider-product-rules";
import type { Database } from "@/integrations/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const GROWTH_SELECT =
  "id, subscription_tier, available_now, available_now_expires, travel_schedule, promotions, current_status, is_active";

const travelEntrySchema = z.object({
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().max(60).nullable().optional(),
  start_date: z.string().date(),
  end_date: z.string().date(),
});

const promotionSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(400),
});

const growthSchema = z.object({
  travel_schedule: z.array(travelEntrySchema).max(40).optional(),
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

function validateTravelSchedule(
  schedule: z.infer<typeof travelEntrySchema>[],
  subscriptionTier: string | null,
) {
  const tier = normalizeProviderTier(subscriptionTier);
  const limit = TRAVEL_DESTINATION_LIMITS[tier];
  const countsByMonth = new Map<string, number>();
  const seen = new Set<string>();

  for (const trip of schedule) {
    const start = new Date(`${trip.start_date}T00:00:00Z`);
    const end = new Date(`${trip.end_date}T00:00:00Z`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new RouteError(422, "Every trip must include valid start and end dates.", "TRAVEL_DATE_INVALID");
    }
    if (end < start) {
      throw new RouteError(422, "A trip end date cannot be before its start date.", "TRAVEL_DATE_ORDER");
    }

    const duplicateKey = [trip.city.toLowerCase(), (trip.state || "").toLowerCase(), trip.start_date, trip.end_date].join("|");
    if (seen.has(duplicateKey)) {
      throw new RouteError(422, "The same destination and dates were added more than once.", "TRAVEL_DUPLICATE");
    }
    seen.add(duplicateKey);

    const monthKey = trip.start_date.slice(0, 7);
    countsByMonth.set(monthKey, (countsByMonth.get(monthKey) || 0) + 1);
  }

  if (limit !== null) {
    for (const [month, count] of countsByMonth) {
      if (count > limit) {
        throw new RouteError(
          403,
          `Your ${tier} plan includes ${limit} travel destination${limit === 1 ? "" : "s"} per month. ${month} currently has ${count}.`,
          "TRAVEL_LIMIT_REACHED",
        );
      }
    }
  }

  return { tier, limit };
}

export async function GET(request: Request) {
  try {
    const session = requireRequestSession(request);
    const admin = createSupabaseAdminClient();
    const data = await loadOrCreateGrowthProfile(admin, session);
    const tier = normalizeProviderTier(data.subscription_tier);

    return json({
      ok: true,
      profile: data,
      limits: {
        travel_destinations_per_month: TRAVEL_DESTINATION_LIMITS[tier],
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-growth", { limit: 30, windowMs: 60_000 });

    const session = requireRequestSession(request);
    const body = await parseJsonBody(request, growthSchema);
    const admin = createSupabaseAdminClient();
    const profile = await loadOrCreateGrowthProfile(admin, session);

    if (body.travel_schedule !== undefined) {
      validateTravelSchedule(body.travel_schedule, profile.subscription_tier);
    }

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

    const tier = normalizeProviderTier(next?.subscription_tier ?? profile.subscription_tier);
    return json({
      ok: true,
      profile: next,
      limits: { travel_destinations_per_month: TRAVEL_DESTINATION_LIMITS[tier] },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
