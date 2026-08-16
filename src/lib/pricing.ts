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

/** First 50 founding members receive 50% off for their first 3 paid months. */
export const FOUNDER_OFFER = { discountPct: 50, months: 3 } as const;

/**
 * When true, the eligible founding member's base subscription rate that applies
 * after any temporary introductory discount is grandfathered while that same
 * subscription remains continuously active and in good standing.
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
      "Public Identity Verified badge after successful identity review",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 99,
    trialDays: 14,
    features: [
      "Everything in Pro",
      "3 active cities",
      "Knotty AI answering on your profile 24/7",
      "Full Demand Radar city market intelligence",
      "Auto tour pages for travel schedules",
      "Priority support",
    ],
    anchor: "Three cities + AI for a fraction of one legacy city ad",
  },
];

function getPlanById(id: PlanId): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

/** @deprecated Use getPlanById */
function getPlanByTier(tier: PlanTier): Plan | undefined {
  return getPlanById(tier);
}

/** Plans that unlock tour pages (Standard and above). Import this instead of duplicating the set. */
export const TOUR_PAGE_TIERS = new Set<PlanId>(["standard", "pro", "elite"]);
