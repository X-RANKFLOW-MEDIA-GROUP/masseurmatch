/**
 * Plan configuration for the signup flow.
 * Prices and features are the repo source of truth — synced with Stripe product metadata.
 */

export type SignupPlanTier = "free" | "standard" | "pro" | "elite";

export interface SignupPlan {
  tier: SignupPlanTier;
  name: string;
  price: number; // monthly USD cents
  priceDisplay: string; // formatted string e.g. "$39/mo"
  billingInterval: "month";
  description: string;
  features: string[];
  founderPrice?: string;
  popular?: boolean;
}

export const SIGNUP_PLANS: SignupPlan[] = [
  {
    tier: "free",
    name: "Free",
    price: 0,
    priceDisplay: "$0/mo",
    billingInterval: "month",
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
    billingInterval: "month",
    description: "A stronger everyday plan with better placement and light analytics.",
    features: [
      "6 photos",
      "Middle search placement",
      "Available Now (60 min)",
      "3 travel schedules/month",
      "Views analytics",
      "Newsletter eligible",
    ],
    founderPrice: "$19.50/mo for 3 months",
  },
  {
    tier: "pro",
    name: "Pro",
    price: 7900,
    priceDisplay: "$79/mo",
    billingInterval: "month",
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
    founderPrice: "$39.50/mo for 3 months",
    popular: true,
  },
  {
    tier: "elite",
    name: "Elite",
    price: 9900,
    priceDisplay: "$99/mo",
    billingInterval: "month",
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
    founderPrice: "$49.50/mo for 3 months",
  },
];

export function getPlanByTier(tier: SignupPlanTier): SignupPlan | undefined {
  return SIGNUP_PLANS.find((p) => p.tier === tier);
}
