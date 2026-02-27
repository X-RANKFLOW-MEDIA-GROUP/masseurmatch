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

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
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
  },
  standard: {
    maxPhotos: 6,
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
    planLabel: "Standard",
  },
  premium: {
    maxPhotos: 10,
    maxCities: 3,
    hasPremiumBadge: true,
    hasGoldBadge: false,
    hasPlatinumBadge: false,
    hasTopPlacement: false,
    hasBoost: true,
    hasMultipleCategories: true,
    hasPrioritySupport: false,
    hasAssistedSeo: true,
    hasAdvancedAnalytics: false,
    hasPermanentBoost: false,
    planLabel: "Premium",
  },
  gold: {
    maxPhotos: 20,
    maxCities: 5,
    hasPremiumBadge: true,
    hasGoldBadge: true,
    hasPlatinumBadge: false,
    hasTopPlacement: true,
    hasBoost: true,
    hasMultipleCategories: true,
    hasPrioritySupport: false,
    hasAssistedSeo: true,
    hasAdvancedAnalytics: true,
    hasPermanentBoost: false,
    planLabel: "Gold",
  },
  platinum: {
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
  const { subscription } = useAuth();

  const planKey = (subscription.plan_key as PlanKey) || (subscription.subscribed ? "standard" : null);
  const limits = PLAN_LIMITS[planKey || "free"] || PLAN_LIMITS.free;

  return {
    ...limits,
    planKey,
    isLoading: subscription.loading,
  };
};
