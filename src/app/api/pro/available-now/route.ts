import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getAvailableNowProfile, recordAuditLog, setAvailableNow } from "@/app/_lib/store";
import { z } from "zod";

const activateSchema = z.object({
  activate: z.boolean(),
});

type SubscriptionTier = "free" | "standard" | "pro" | "elite";

type TierRule = {
  durationHours: number;
  maxActivationsPerDay: number;
  reactivationHours: number;
};

const TIER_RULES: Record<SubscriptionTier, TierRule | null> = {
  free: null,
  standard: { durationHours: 2, maxActivationsPerDay: 1, reactivationHours: 24 },
  pro: { durationHours: 3, maxActivationsPerDay: 2, reactivationHours: 8 },
  elite: { durationHours: 4, maxActivationsPerDay: 4, reactivationHours: 4 },
};

const VALID_TIERS = new Set<SubscriptionTier>(["free", "standard", "pro", "elite"]);

function toTier(value: string | null | undefined): SubscriptionTier {
  if (value !== null && value !== undefined && VALID_TIERS.has(value as SubscriptionTier)) {
    return value as SubscriptionTier;
  }
  return "free";
}

function getMidnightUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-available-now", { limit: 20, windowMs: 60_000 });

    const session = requireRequestSession(request);
    const body = await parseJsonBody(request, activateSchema);

    const profile = await getAvailableNowProfile(session.userId);
    if (!profile) throw new RouteError(404, "Profile not found.");

    const tier = toTier(profile._tier);

    if (!body.activate) {
      await setAvailableNow(session.userId, { available_now: false, available_now_expires: null });
      await recordAuditLog(session.userId, "provider.available_now.deactivate", "profile", profile.id, { tier });
      return json({ ok: true, available_now: false });
    }

    const rules = TIER_RULES[tier];
    if (!rules) {
      throw new RouteError(
        403,
        "Available Now is not available on the Free plan. Upgrade to Standard, Pro, or Elite.",
      );
    }

    const now = new Date();
    const midnight = getMidnightUTC();

    const dayStart = profile.available_now_day_start
      ? new Date(profile.available_now_day_start)
      : midnight;
    const isNewDay = dayStart.getTime() < midnight.getTime();

    const activationsToday = isNewDay ? 0 : (profile.available_now_activations_today ?? 0);

    if (activationsToday >= rules.maxActivationsPerDay) {
      throw new RouteError(
        429,
        `You have reached the maximum of ${rules.maxActivationsPerDay} Available Now activation(s) per day for your ${tier} plan. Try again tomorrow.`,
      );
    }

    if (!isNewDay && profile.available_now_last_activation) {
      const lastActivation = new Date(profile.available_now_last_activation);
      const reactivationAllowedAt = new Date(
        lastActivation.getTime() + rules.reactivationHours * 3_600_000,
      );
      if (now < reactivationAllowedAt) {
        const minutesLeft = Math.ceil(
          (reactivationAllowedAt.getTime() - now.getTime()) / 60_000,
        );
        throw new RouteError(
          429,
          `Please wait ${minutesLeft} more minute(s) before reactivating Available Now.`,
        );
      }
    }

    const expiresAt = new Date(now.getTime() + rules.durationHours * 3_600_000);

    await setAvailableNow(session.userId, {
      available_now: true,
      available_now_expires: expiresAt.toISOString(),
      available_now_activations_today: activationsToday + 1,
      available_now_last_activation: now.toISOString(),
      available_now_day_start: isNewDay
        ? midnight.toISOString()
        : dayStart.toISOString(),
    });

    await recordAuditLog(session.userId, "provider.available_now.activate", "profile", profile.id, {
      tier,
      durationHours: rules.durationHours,
      expiresAt: expiresAt.toISOString(),
    });

    return json({
      ok: true,
      available_now: true,
      expires_at: expiresAt.toISOString(),
      duration_hours: rules.durationHours,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
