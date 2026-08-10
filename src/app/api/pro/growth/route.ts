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
  "id, slug, city, subscription_tier, available_now, available_now_expires, travel_schedule, promotions, current_status, is_active";

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

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const admin = createSupabaseAdminClient();
    const data = await loadOrCreateGrowthProfile(admin, session);
    return json({ ok: true, profile: data });
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
          ? await Promise.all(
              body.travel_schedule.map((trip) => buildCityRevalidatePaths(slugify(trip.city))),
            )
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
