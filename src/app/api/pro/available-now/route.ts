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
};

const TIER_RULES: Record<SubscriptionTier, TierRule | null> = {
  free: null,
  standard: { durationHours: 1 },
  pro: { durationHours: 2 },
  elite: { durationHours: 3 },
};

const VALID_TIERS = new Set<SubscriptionTier>(["free", "standard", "pro", "elite"]);

function toTier(value: string | null | undefined): SubscriptionTier {
  if (value !== null && value !== undefined && VALID_TIERS.has(value as SubscriptionTier)) {
    return value as SubscriptionTier;
  }
  return "free";
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-available-now", { limit: 20, windowMs: 60_000 });

    const session = await requireRequestSession(request);
    const body = await parseJsonBody(request, activateSchema);

    const profile = await getAvailableNowProfile(session.userId);
    if (!profile) throw new RouteError(404, "Profile not found.");

    const tier = toTier(profile.subscription_tier);

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
    const currentExpiry = profile.available_now_expires ? new Date(profile.available_now_expires) : null;
    const hasValidExpiry = currentExpiry !== null && !Number.isNaN(currentExpiry.getTime());

    if (profile.available_now && hasValidExpiry && currentExpiry > now) {
      throw new RouteError(409, "Available Now is already active for your profile.");
    }

    if (profile.available_now && (!hasValidExpiry || (currentExpiry !== null && currentExpiry <= now))) {
      await setAvailableNow(session.userId, {
        available_now: false,
        available_now_expires: null,
      });
    }

    const expiresAt = new Date(now.getTime() + rules.durationHours * 3_600_000);

    await setAvailableNow(session.userId, {
      available_now: true,
      available_now_expires: expiresAt.toISOString(),
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
