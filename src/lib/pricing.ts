/**
 * Canonical source of truth for all plan data.
 * Every UI surface (homepage, /pricing, /signup/plan) must import from here.
 * Never hardcode plan prices or feature lists elsewhere.
 */

export type PlanTier = "free" | "standard" | "pro" | "elite";

export interface Plan {
  tier: PlanTier;
  name: string;
  /** Monthly price in USD cents */
  price: number;
  /** Formatted price string, e.g. "$39/mo" */
  priceDisplay: string;
  description: string;
  features: string[];
  /** Trial period in days (paid tiers) */
  trialDays?: number;
  /** Founder discount copy */
  founderOffer?: string;
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    tier: "free",
    name: "Free",
    price: 0,
    priceDisplay: "$0/mo",
    description: "A basic listing for getting discovered without a monthly cost.",
    features: [
      "1 photo",
      "Bottom search placement",
      "1 travel schedule/month",
      "No analytics",
    ],
  },
  {
    tier: "standard",
    name: "Standard",
    price: 3900,
    priceDisplay: "$39/mo",
    description: "A stronger everyday plan with better placement and light analytics.",
    features: [
      "6 photos",
      "Middle search placement",
      "Available Now (60 min)",
      "3 travel schedules/month",
      "Views analytics",
      "Newsletter eligible",
    ],
    trialDays: 14,
    founderOffer: "50% off first 3 months",
  },
  {
    tier: "pro",
    name: "Pro",
    price: 7900,
    priceDisplay: "$79/mo",
    description: "Our most popular growth tier for therapists who want top exposure.",
    features: [
      "12 photos + video",
      "Top search placement",
      "Available Now (120 min)",
      "Unlimited travel schedules",
      "Views + clicks analytics",
      "Homepage rotation",
      "Weekly specials",
      "Verified badge",
    ],
    trialDays: 14,
    founderOffer: "50% off first 3 months",
    popular: true,
  },
  {
    tier: "elite",
    name: "Elite",
    price: 9900,
    priceDisplay: "$99/mo",
    description: "Everything in Pro plus a second active city for broader reach.",
    features: [
      "12 photos + video",
      "Top search placement",
      "Available Now (120 min)",
      "Unlimited travel schedules",
      "Views + clicks analytics",
      "Homepage rotation",
      "Weekly specials",
      "Verified badge",
      "2 active cities",
    ],
    trialDays: 14,
    founderOffer: "50% off first 3 months",
  },
];

export function getPlanByTier(tier: PlanTier): Plan | undefined {
  return PLANS.find((p) => p.tier === tier);
}
