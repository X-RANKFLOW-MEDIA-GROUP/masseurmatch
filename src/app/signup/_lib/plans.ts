/**
 * Re-exports plan data from the canonical source.
 * All plan prices and features live in src/lib/pricing.ts.
 */

import { PLANS, type Plan, type PlanTier } from "@/lib/pricing";

// Backward-compatible type aliases
export type SignupPlanTier = PlanTier;
export type SignupPlan = Plan & { founderPrice?: string };

// Backward-compatible SIGNUP_PLANS array — founderPrice mirrors founderOffer
export const SIGNUP_PLANS: SignupPlan[] = PLANS.map((p) => ({
  ...p,
  billingInterval: "month" as const,
  founderPrice: p.founderOffer ? `${p.priceDisplay.replace("/mo", "").replace("$", "$")} for 3 months` : undefined,
}));

export function getPlanByTier(tier: SignupPlanTier): SignupPlan | undefined {
  return SIGNUP_PLANS.find((p) => p.tier === tier);
}
