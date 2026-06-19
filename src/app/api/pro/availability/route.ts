import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getProfileByUserId, updateProfileByUserId, recordAuditLog } from "@/app/_lib/store";
import { z } from "zod";

const availabilitySchema = z.object({
  status: z.enum(["available", "mobile", "traveling", "hidden"]),
  radius: z.number().int().min(0).max(200).optional(),
  travelDestination: z.string().max(120).optional(),
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

    const nextProfile = await updateProfileByUserId(session.userId, {
      current_status: body.status,
      available_now: body.status === "available",
      is_active: body.status !== "hidden",
      service_radius_km: body.radius ?? 15,
      travel_destination: body.travelDestination ?? null,
    });

    await recordAuditLog(session.userId, "provider.availability.update", "profile", profile.id, {
      status: body.status,
      radius: body.radius,
      travelDestination: body.travelDestination,
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
