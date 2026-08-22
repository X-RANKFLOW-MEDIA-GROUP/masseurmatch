import { RouteError } from "@/app/api/_lib/http";

type SubscriptionTier = "free" | "standard" | "pro" | "elite";

type AvailableNowProfileLike = {
  subscription_tier?: string | null;
  available_now?: boolean | null;
  available_now_expires?: string | null;
};

type AvailableNowTransition = {
  tier: SubscriptionTier;
  changed: boolean;
  availableNow: boolean;
  expiresAt: string | null;
  durationHours: number | null;
  updates: {
    available_now: boolean;
    available_now_expires: string | null;
  };
};

const TIER_DURATION_HOURS: Record<SubscriptionTier, number | null> = {
  free: null,
  standard: 1,
  pro: 2,
  elite: 3,
};

const VALID_TIERS = new Set<SubscriptionTier>(["free", "standard", "pro", "elite"]);

function toTier(value: string | null | undefined): SubscriptionTier {
  if (value && VALID_TIERS.has(value as SubscriptionTier)) {
    return value as SubscriptionTier;
  }
  return "free";
}

function hasFutureExpiry(value: string | null | undefined, now: Date): boolean {
  if (!value) return false;
  const expiry = new Date(value);
  return !Number.isNaN(expiry.getTime()) && expiry > now;
}

export function resolveAvailableNowTransition(
  profile: AvailableNowProfileLike,
  activate: boolean,
  now = new Date(),
): AvailableNowTransition {
  const tier = toTier(profile.subscription_tier);

  if (!activate) {
    const changed = profile.available_now === true || profile.available_now_expires != null;
    return {
      tier,
      changed,
      availableNow: false,
      expiresAt: null,
      durationHours: null,
      updates: { available_now: false, available_now_expires: null },
    };
  }

  // Saving an already-active badge is idempotent and must not extend its timer.
  if (profile.available_now === true && hasFutureExpiry(profile.available_now_expires, now)) {
    return {
      tier,
      changed: false,
      availableNow: true,
      expiresAt: profile.available_now_expires ?? null,
      durationHours: TIER_DURATION_HOURS[tier],
      updates: {
        available_now: true,
        available_now_expires: profile.available_now_expires ?? null,
      },
    };
  }

  const durationHours = TIER_DURATION_HOURS[tier];
  if (!durationHours) {
    throw new RouteError(
      403,
      "Available Now is not available on the Free plan. Upgrade to Standard, Pro, or Elite.",
    );
  }

  const expiresAt = new Date(now.getTime() + durationHours * 3_600_000).toISOString();
  return {
    tier,
    changed: true,
    availableNow: true,
    expiresAt,
    durationHours,
    updates: { available_now: true, available_now_expires: expiresAt },
  };
}
