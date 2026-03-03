import { useAuth } from "@/contexts/AuthContext";

export type PlanKey = "free" | "standard" | "premium" | "gold" | "platinum" | null;

export interface PlanLimits {
  maxPhotos: number;
  maxCities: number;
  hasPremiumBadge: boolean;
  hasGoldBadge: boolean;
  hasPlatinumBadge: boolean;
  hasTopPlacement: boolean;
  hasBoost: boolean;
  hasMultipleCategories: boolean;
  hasPrioritySupport: boolean;
  hasAssistedSeo: boolean;
  hasAdvancedAnalytics: boolean;
  hasPermanentBoost: boolean;
  planLabel: string;
}

const FREE_LIMITS: PlanLimits = {
  maxPhotos: 3,
  maxCities: 1,
  hasPremiumBadge: false,
  hasGoldBadge: false,
  hasPlatinumBadge: false,
  hasTopPlacement: false,
  hasBoost: false,
  hasMultipleCategories: false,
  hasPrioritySupport: false,
  hasAssistedSeo: false,
  hasAdvancedAnalytics: false,
  hasPermanentBoost: false,
  planLabel: "Free Trial",
};

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: FREE_LIMITS,
  standard: {
    ...FREE_LIMITS,
    maxPhotos: 6,
    planLabel: "Standard",
  },
  premium: {
    ...FREE_LIMITS,
    maxPhotos: 10,
    maxCities: 3,
    hasPremiumBadge: true,
    hasBoost: true,
    hasMultipleCategories: true,
    hasAssistedSeo: true,
    planLabel: "Premium",
  },
  gold: {
    ...FREE_LIMITS,
    maxPhotos: 20,
    maxCities: 5,
    hasPremiumBadge: true,
    hasGoldBadge: true,
    hasTopPlacement: true,
    hasBoost: true,
    hasMultipleCategories: true,
    hasAssistedSeo: true,
    hasAdvancedAnalytics: true,
    planLabel: "Gold",
  },
  platinum: {
    ...FREE_LIMITS,
    maxPhotos: 50,
    maxCities: 999,
    hasPremiumBadge: true,
    hasGoldBadge: true,
    hasPlatinumBadge: true,
    hasTopPlacement: true,
    hasBoost: true,
    hasMultipleCategories: true,
    hasPrioritySupport: true,
    hasAssistedSeo: true,
    hasAdvancedAnalytics: true,
    hasPermanentBoost: true,
    planLabel: "Platinum",
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
    // If AuthContext is unavailable or subscription check fails, return safe defaults
    return {
      ...FREE_LIMITS,
      planKey: null,
      isLoading: false,
    };
  }
};
