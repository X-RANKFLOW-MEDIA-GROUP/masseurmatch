/**
 * Re-exports plan data from the canonical source with backward-compat shims
 * for the signup flow (priceDisplay, description, tier, popular, founderOffer).
 * All authoritative plan data lives in src/lib/pricing.ts.
 */

import { PLANS, FOUNDER_OFFER, type Plan, type PlanId, type PlanTier } from "@/lib/pricing";

export type { PlanTier };
export type SignupPlanTier = PlanTier;

const descriptions: Record<PlanId, string> = {
  free: "A basic listing for getting discovered without a monthly cost.",
  standard: "A stronger everyday plan with better placement and light analytics.",
  pro: "Our most popular growth tier for therapists who want top exposure.",
  elite: "Three cities, Knotty AI, and Demand Radar for maximum coverage.",
};

export interface SignupPlan extends Plan {
  /** Backward-compat alias for id */
  tier: PlanId;
  /** Formatted price string e.g. "$39/mo" */
  priceDisplay: string;
  /** Short plan description for plan-picker UI */
  description: string;
  /** Founder-offer copy shown under the price */
  founderOffer?: string;
  /** Short founder price label */
  founderPrice?: string;
  /** @deprecated Use mostPopular */
  popular?: boolean;
}

export const SIGNUP_PLANS: SignupPlan[] = PLANS.map((p) => {
  const hasFounderOffer = p.price > 0;
  return {
    ...p,
    tier: p.id,
    priceDisplay: p.price === 0 ? "$0/mo" : `$${p.price}/mo`,
    description: descriptions[p.id],
    popular: p.mostPopular,
    founderOffer: hasFounderOffer
      ? `${FOUNDER_OFFER.discountPct}% off first ${FOUNDER_OFFER.months} months`
      : undefined,
    founderPrice: hasFounderOffer
      ? `$${Math.round((p.price * (1 - FOUNDER_OFFER.discountPct / 100)))} first ${FOUNDER_OFFER.months} months`
      : undefined,
  };
});

export function getPlanByTier(tier: SignupPlanTier): SignupPlan | undefined {
  return SIGNUP_PLANS.find((p) => p.tier === tier);
}
