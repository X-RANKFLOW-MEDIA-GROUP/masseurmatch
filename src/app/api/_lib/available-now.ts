import { RouteError } from "@/app/api/_lib/http";

type Tier = "free" | "standard" | "pro" | "elite";

interface TierLimits {
  enabled: boolean;
  durationHours: number;
  cooldownHours: number;
  maxPerDay: number;
}

const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: { enabled: false, durationHours: 0, cooldownHours: 0, maxPerDay: 0 },
  standard: { enabled: true, durationHours: 2, cooldownHours: 24, maxPerDay: 1 },
  pro: { enabled: true, durationHours: 3, cooldownHours: 8, maxPerDay: 2 },
  elite: { enabled: true, durationHours: 4, cooldownHours: 4, maxPerDay: -1 },
};

export function getAvailableNowLimits(tier: string | null | undefined): TierLimits {
  const normalized = (tier || "free").toLowerCase().trim() as Tier;
  return TIER_LIMITS[normalized] || TIER_LIMITS.free;
}

export function validateAvailableNowActivation(
  tier: string | null | undefined,
  profile: {
    available_now_activated_at?: string | null;
    available_now_activations_today?: number;
    available_now_last_reset_date?: string | null;
  },
): { expiresAt: Date } {
  const limits = getAvailableNowLimits(tier);

  if (!limits.enabled) {
    throw new RouteError(403, "Available Now is not available on your current plan. Please upgrade to access this feature.");
  }

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const activationsToday =
    profile.available_now_last_reset_date === todayStr
      ? (profile.available_now_activations_today || 0)
      : 0;

  if (limits.maxPerDay > 0 && activationsToday >= limits.maxPerDay) {
    throw new RouteError(429, `You have reached your daily Available Now limit (${limits.maxPerDay} per day on your plan).`);
  }

  if (profile.available_now_activated_at && limits.cooldownHours > 0) {
    const lastActivation = new Date(profile.available_now_activated_at);
    const cooldownEnd = new Date(lastActivation.getTime() + limits.cooldownHours * 3600_000);
    if (now < cooldownEnd) {
      const minutesLeft = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 60_000);
      throw new RouteError(429, `Cooldown active. You can activate Available Now again in ${minutesLeft} minutes.`);
    }
  }

  const expiresAt = new Date(now.getTime() + limits.durationHours * 3600_000);
  return { expiresAt };
}
