import { useAuth } from "@/contexts/AuthContext";

export type PlanKey = "free" | "standard" | "pro" | "elite" | null;
type SupportedPlanKey = Exclude<PlanKey, null>;

export interface AvailableNowConfig {
  enabled: boolean;
  durationHours: number;
  cooldownHours: number;
  maxPerDay: number;
  rankPriority: number; // lower = higher priority in search (1=Elite, 2=Pro, 3=Standard, 99=Free)
  badgeLabel: string | null;
}

export interface PlanLimits {
  maxPhotos: number;
  maxCities: number;
  hasAvailableNow: boolean;
  availableNowMinutes: number;
  availableNowConfig: AvailableNowConfig;
  maxTravelSchedules: number; // -1 = unlimited
  hasVideo: boolean;
  hasVerifiedBadge: boolean;
  hasWeeklySpecials: boolean;
  hasHomepageRotation: boolean;
  hasNewsletter: boolean;
  hasBasicWatermark: boolean;
  hasTopPlacement: boolean;
  hasBoost: boolean;
  hasMultipleCategories: boolean;
  hasPrioritySupport: boolean;
  hasAssistedSeo: boolean;
  hasAdvancedAnalytics: boolean;
  hasBasicAnalytics: boolean;
  planLabel: string;
}

// Keep legacy Stripe metadata functional until older subscriptions renew onto the current catalog.
const LEGACY_PLAN_MAP: Record<string, SupportedPlanKey> = {
  premium: "pro",
  gold: "elite",
  platinum: "elite",
};

export const normalizePlanKey = (rawPlanKey: string | null | undefined): PlanKey => {
  if (!rawPlanKey) return null;

  const normalized = rawPlanKey.toLowerCase().trim();

  if (normalized === "free" || normalized === "standard" || normalized === "pro" || normalized === "elite") {
    return normalized;
  }

  return LEGACY_PLAN_MAP[normalized] || null;
};

const FREE_AVAILABLE_NOW: AvailableNowConfig = {
  enabled: false,
  durationHours: 0,
  cooldownHours: 0,
  maxPerDay: 0,
  rankPriority: 99,
  badgeLabel: null,
};

const FREE_LIMITS: PlanLimits = {
  maxPhotos: 1,
  maxCities: 1,
  hasAvailableNow: false,
  availableNowMinutes: 0,
  availableNowConfig: FREE_AVAILABLE_NOW,
  maxTravelSchedules: 1,
  hasVideo: false,
  hasVerifiedBadge: false,
  hasWeeklySpecials: false,
  hasHomepageRotation: false,
  hasNewsletter: false,
  hasBasicWatermark: true,
  hasTopPlacement: false,
  hasBoost: false,
  hasMultipleCategories: false,
  hasPrioritySupport: false,
  hasAssistedSeo: false,
  hasAdvancedAnalytics: false,
  hasBasicAnalytics: false,
  planLabel: "Free",
};

const PLAN_LIMITS: Record<SupportedPlanKey, PlanLimits> = {
  free: FREE_LIMITS,
  standard: {
    ...FREE_LIMITS,
    maxPhotos: 6,
    maxCities: 1,
    hasAvailableNow: true,
    availableNowMinutes: 120,
    availableNowConfig: {
      enabled: true,
      durationHours: 2,
      cooldownHours: 24,
      maxPerDay: 1,
      rankPriority: 3,
      badgeLabel: "Available Now",
    },
    maxTravelSchedules: 3,
    hasBasicWatermark: false,
    hasBasicAnalytics: true,
    hasNewsletter: true,
    planLabel: "Standard",
  },
  pro: {
    ...FREE_LIMITS,
    maxPhotos: 12,
    maxCities: 1,
    hasAvailableNow: true,
    availableNowMinutes: 180,
    availableNowConfig: {
      enabled: true,
      durationHours: 3,
      cooldownHours: 8,
      maxPerDay: 2,
      rankPriority: 2,
      badgeLabel: "Available Now",
    },
    maxTravelSchedules: -1,
    hasVideo: true,
    hasVerifiedBadge: true,
    hasWeeklySpecials: true,
    hasHomepageRotation: true,
    hasNewsletter: true,
    hasBasicWatermark: false,
    hasTopPlacement: true,
    hasBoost: true,
    hasMultipleCategories: true,
    hasBasicAnalytics: true,
    hasAdvancedAnalytics: true,
    planLabel: "Pro",
  },
  elite: {
    ...FREE_LIMITS,
    maxPhotos: 12,
    maxCities: 2,
    hasAvailableNow: true,
    availableNowMinutes: 240,
    availableNowConfig: {
      enabled: true,
      durationHours: 4,
      cooldownHours: 4,
      maxPerDay: -1, // unlimited
      rankPriority: 1,
      badgeLabel: "Available Now",
    },
    maxTravelSchedules: -1,
    hasVideo: true,
    hasVerifiedBadge: true,
    hasWeeklySpecials: true,
    hasHomepageRotation: true,
    hasNewsletter: true,
    hasBasicWatermark: false,
    hasTopPlacement: true,
    hasBoost: true,
    hasMultipleCategories: true,
    hasBasicAnalytics: true,
    hasAdvancedAnalytics: true,
    planLabel: "Elite",
  },
};

// Exported for search ranking logic
export const AVAILABLE_NOW_TIER_PRIORITY: Record<SupportedPlanKey, number> = {
  elite: 1,
  pro: 2,
  standard: 3,
  free: 99,
};

export const usePlanLimits = (): PlanLimits & { planKey: PlanKey; isLoading: boolean } => {
  const { subscription } = useAuth();
  const planKey = normalizePlanKey(subscription?.plan_key) || (subscription?.subscribed ? "standard" : null);
  const limits = PLAN_LIMITS[planKey || "free"] || FREE_LIMITS;

  return {
    ...limits,
    planKey,
    isLoading: subscription?.loading ?? false,
  };
};
