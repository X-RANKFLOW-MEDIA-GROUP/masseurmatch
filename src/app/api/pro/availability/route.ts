import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getProfileByUserId, updateProfileByUserId, recordAuditLog, createSupabaseAdminClient } from "@/app/_lib/store";
import { validateAvailableNowActivation } from "@/app/api/_lib/available-now";
import { z } from "zod";

const availabilitySchema = z.object({
  status: z.enum(["available", "mobile", "traveling", "hidden"]),
  radius: z.number().int().min(0).max(200).optional(),
  travelDestination: z.string().max(120).optional(),
  availableNow: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-availability", { limit: 30, windowMs: 60_000 });

    const session = requireRequestSession(request);
    const profile = await getProfileByUserId(session.userId);

    if (!profile) {
      throw new RouteError(404, "Profile not found.");
    }

    const body = await parseJsonBody(request, availabilitySchema);

    const updates: Record<string, unknown> = {
      current_status: body.status,
      service_radius_km: body.radius ?? (profile as any).service_radius_km ?? 15,
      travel_destination: body.travelDestination ?? null,
    };

    if (body.availableNow === true) {
      const adminClient = createSupabaseAdminClient() as any;
      const { data: fullProfile } = await adminClient
        .from("profiles")
        .select("_tier, available_now_activated_at, available_now_activations_today, available_now_last_reset_date")
        .eq("user_id", session.userId)
        .maybeSingle();

      const { expiresAt } = validateAvailableNowActivation(
        fullProfile?._tier,
        fullProfile || {},
      );

      const todayStr = new Date().toISOString().slice(0, 10);
      const currentActivations =
        fullProfile?.available_now_last_reset_date === todayStr
          ? (fullProfile?.available_now_activations_today || 0)
          : 0;

      updates.available_now = true;
      updates.available_now_expires = expiresAt.toISOString();
      updates.available_now_activated_at = new Date().toISOString();
      updates.available_now_activations_today = currentActivations + 1;
      updates.available_now_last_reset_date = todayStr;
    } else if (body.availableNow === false) {
      updates.available_now = false;
      updates.available_now_expires = null;
    }

    const nextProfile = await updateProfileByUserId(session.userId, updates as any);

    await recordAuditLog(session.userId, "provider.availability.update", "profile", profile.id, {
      status: body.status,
      radius: body.radius,
      travelDestination: body.travelDestination,
      availableNow: body.availableNow,
    });

    return json({
      ok: true,
      profile: nextProfile,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
