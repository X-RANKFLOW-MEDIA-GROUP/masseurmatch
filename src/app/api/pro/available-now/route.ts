import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getAvailableNowProfile, recordAuditLog, setAvailableNow } from "@/app/_lib/store";
import { z } from "zod";

const activateSchema = z.object({ activate: z.boolean() });

type SubscriptionTier = "free" | "standard" | "pro" | "elite";
type TierRule = { durationMinutes: number; label: string };

const TIER_RULES: Record<SubscriptionTier, TierRule> = {
  free: { durationMinutes: 30, label: "30 minutes" },
  standard: { durationMinutes: 60, label: "1 hour" },
  pro: { durationMinutes: 120, label: "2 hours" },
  elite: { durationMinutes: 120, label: "2 hours" },
};

const VALID_TIERS = new Set<SubscriptionTier>(["free", "standard", "pro", "elite"]);

function toTier(value: string | null | undefined): SubscriptionTier {
  if (value && VALID_TIERS.has(value as SubscriptionTier)) return value as SubscriptionTier;
  return "free";
}

function remainingSeconds(expiresAt: Date, now: Date) {
  return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000));
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-available-now", { limit: 20, windowMs: 60_000 });

    const session = requireRequestSession(request);
    const body = await parseJsonBody(request, activateSchema);
    const profile = await getAvailableNowProfile(session.userId);
    if (!profile) throw new RouteError(404, "Profile not found.");

    const tier = toTier(profile.subscription_tier);
    const rules = TIER_RULES[tier];
    const now = new Date();
    const currentExpiry = profile.available_now_expires ? new Date(profile.available_now_expires) : null;
    const hasValidFutureExpiry = Boolean(
      currentExpiry && !Number.isNaN(currentExpiry.getTime()) && currentExpiry > now,
    );

    if (!body.activate) {
      await setAvailableNow(session.userId, {
        available_now: false,
        available_now_expires: hasValidFutureExpiry && currentExpiry ? currentExpiry.toISOString() : null,
      });

      await recordAuditLog(session.userId, "provider.available_now.deactivate", "profile", profile.id, {
        tier,
        cooldownUntil: hasValidFutureExpiry && currentExpiry ? currentExpiry.toISOString() : null,
      });

      return json({
        ok: true,
        available_now: false,
        cooldown_until: hasValidFutureExpiry && currentExpiry ? currentExpiry.toISOString() : null,
        remaining_seconds: hasValidFutureExpiry && currentExpiry ? remainingSeconds(currentExpiry, now) : 0,
      });
    }

    if (hasValidFutureExpiry && currentExpiry) {
      throw new RouteError(
        409,
        `Your previous Available Now window is still running. You can activate it again after ${currentExpiry.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}.`,
        "AVAILABLE_NOW_COOLDOWN",
      );
    }

    if (profile.available_now) {
      await setAvailableNow(session.userId, { available_now: false, available_now_expires: null });
    }

    const expiresAt = new Date(now.getTime() + rules.durationMinutes * 60_000);

    await setAvailableNow(session.userId, {
      available_now: true,
      available_now_expires: expiresAt.toISOString(),
    });

    await recordAuditLog(session.userId, "provider.available_now.activate", "profile", profile.id, {
      tier,
      durationMinutes: rules.durationMinutes,
      expiresAt: expiresAt.toISOString(),
    });

    return json({
      ok: true,
      available_now: true,
      expires_at: expiresAt.toISOString(),
      duration_minutes: rules.durationMinutes,
      duration_label: rules.label,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
