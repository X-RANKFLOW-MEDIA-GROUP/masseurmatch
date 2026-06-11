/**
 * Canonical source of truth for all plan data.
 * Every UI surface (homepage, /pricing, /signup/plan) must import from here.
 * Never hardcode plan prices or feature lists elsewhere.
 */

export type PlanId = "free" | "standard" | "pro" | "elite";
/** @deprecated alias for PlanId */
export type PlanTier = PlanId;

export interface Plan {
  id: PlanId;
  name: string;
  /** Monthly price in whole USD (0 for Free) */
  price: number;
  trialDays: number;
  features: readonly string[];
  mostPopular?: boolean;
  /** Market anchoring copy displayed near the price */
  anchor?: string;
}

/** First 50 founding members lock in 50% off for their first 3 months. */
export const FOUNDER_OFFER = { discountPct: 50, months: 3 } as const;

/**
 * When true, founding-member rates are grandfathered — the subscriber's
 * price never increases while the subscription remains active.
 * Do NOT touch live subscriptions when updating the Elite price.
 */
export const PRICE_LOCK = true;

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    trialDays: 0,
    features: [
      "1 photo",
      "1 city listing",
      "Direct contact buttons",
      "Bottom search placement",
      "1 travel schedule/month",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 39,
    trialDays: 14,
    features: [
      "6 photos",
      "Middle search placement",
      "Available Now (60 min)",
      "3 travel schedules/month",
      "Views analytics",
      "Newsletter eligible",
    ],
    anchor: "A fraction of what legacy directories charge for one city",
  },
  {
    id: "pro",
    name: "Pro",
    price: 79,
    trialDays: 14,
    mostPopular: true,
    features: [
      "12 photos + video",
      "Top search placement",
      "Available Now (120 min)",
      "Unlimited travel schedules",
      "Views + clicks analytics",
      "Homepage rotation",
      "Weekly specials",
      "Verified badge (Stripe Identity, with public verification date)",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 149,
    trialDays: 14,
    features: [
      "Everything in Pro",
      "3 active cities",
      "Knotty AI answering on your profile 24/7",
      "Demand Radar (city + neighborhood demand data)",
      "Auto tour pages for travel schedules",
      "Priority support",
    ],
    anchor: "Three cities + AI for less than half of one legacy city ad",
  },
];

export function getPlanById(id: PlanId): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

/** @deprecated Use getPlanById */
export function getPlanByTier(tier: PlanTier): Plan | undefined {
  return getPlanById(tier);
}
