import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/api/_lib/session";
import { getAvailableNowProfile, recordAuditLog, setAvailableNow } from "@/app/_lib/store";
import { resolveAvailableNowTransition } from "@/app/_lib/available-now";
import { z } from "zod";

const activateSchema = z.object({
  activate: z.boolean(),
});

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-available-now", { limit: 20, windowMs: 60_000 });

    const session = await requireRequestSession(request);
    const body = await parseJsonBody(request, activateSchema);

    const profile = await getAvailableNowProfile(session.userId);
    if (!profile) throw new RouteError(404, "Profile not found.");

    const transition = resolveAvailableNowTransition(profile, body.activate);

    if (body.activate && !transition.changed) {
      throw new RouteError(409, "Available Now is already active for your profile.");
    }

    await setAvailableNow(session.userId, transition.updates);

    await recordAuditLog(
      session.userId,
      body.activate ? "provider.available_now.activate" : "provider.available_now.deactivate",
      "profile",
      profile.id,
      {
        tier: transition.tier,
        durationHours: transition.durationHours,
        expiresAt: transition.expiresAt,
      },
    );

    return json({
      ok: true,
      available_now: transition.availableNow,
      expires_at: transition.expiresAt,
      duration_hours: transition.durationHours,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
