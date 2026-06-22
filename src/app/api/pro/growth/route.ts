import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { createSupabaseAdminClient, recordAuditLog } from "@/app/api/_lib/supabase-server";
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

export async function GET(request: Request) {
  try {
    const session = requireRequestSession(request);
    const admin = createSupabaseAdminClient();

    const { data, error } = await admin
      .from("profiles")
      .select(GROWTH_SELECT)
      .eq("user_id", session.userId)
      .maybeSingle();

    if (error) throw new RouteError(500, error.message);
    if (!data) throw new RouteError(404, "Profile not found.");

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

    const { data: profile, error: lookupError } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (lookupError) throw new RouteError(500, lookupError.message);
    if (!profile) throw new RouteError(404, "Profile not found.");

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
