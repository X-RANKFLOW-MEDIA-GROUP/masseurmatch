import { useAuth } from "@/contexts/AuthContext";

export type PlanKey = "free" | "standard" | "pro" | "elite" | null;

export interface PlanLimits {
  maxPhotos: number;
  maxCities: number;
  hasAvailableNow: boolean;
  availableNowMinutes: number;
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

const FREE_LIMITS: PlanLimits = {
  maxPhotos: 1,
  maxCities: 1,
  hasAvailableNow: false,
  availableNowMinutes: 0,
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

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: FREE_LIMITS,
  standard: {
    ...FREE_LIMITS,
    maxPhotos: 6,
    hasAvailableNow: true,
    availableNowMinutes: 60,
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
    availableNowMinutes: 120,
    maxTravelSchedules: -1,
    hasVideo: true,
    hasVerifiedBadge: true,
    hasWeeklySpecials: true,
    hasHomepageRotation: true,
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
    availableNowMinutes: 120,
    maxTravelSchedules: -1,
    hasVideo: true,
    hasVerifiedBadge: true,
    hasWeeklySpecials: true,
    hasHomepageRotation: true,
    hasBasicWatermark: false,
    hasTopPlacement: true,
    hasBoost: true,
    hasMultipleCategories: true,
    hasPrioritySupport: true,
    hasBasicAnalytics: true,
    hasAdvancedAnalytics: true,
    planLabel: "Elite",
  },
};

export const usePlanLimits = (): PlanLimits & { planKey: PlanKey; isLoading: boolean } => {
  try {
    const { subscription } = useAuth();
    const planKey = (subscription?.plan_key as PlanKey) || (subscription?.subscribed ? "standard" : null);
    const limits = PLAN_LIMITS[planKey || "free"] || FREE_LIMITS;

    return {
      ...limits,
      planKey,
      isLoading: subscription?.loading ?? false,
    };
  } catch {
    return {
      ...FREE_LIMITS,
      planKey: null,
      isLoading: false,
    };
  }
};
