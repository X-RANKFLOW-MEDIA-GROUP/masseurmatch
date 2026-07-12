import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession, type RequestSession } from "@/app/_lib/session";
import {
  createSupabaseAdminClient,
  ensureUserProfileAndRole,
  recordAuditLog,
} from "@/app/api/_lib/supabase-server";
import type { Database } from "@/integrations/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const GROWTH_SELECT =
  "id, subscription_tier, available_now, available_now_expires, travel_schedule, promotions, current_status, is_active";

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

// Load the caller's profile row, creating it when missing. Accounts whose
// signup slipped past the profile-creation trigger (35 of the first 47 users)
// have a session but no profiles row, which turned every /pro surface that
// hits this route into a 404. Self-healing here repairs those accounts the
// moment they open their dashboard.
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

  const { data: authUser, error: userError } = await admin.auth.admin.getUserById(session.userId);
  if (userError || !authUser?.user) {
    throw new RouteError(404, "Profile not found.");
  }

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
    const session = requireRequestSession(request);
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

    const session = requireRequestSession(request);
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

    return json({ ok: true, profile: next });
  } catch (error) {
    return errorResponse(error);
  }
}
