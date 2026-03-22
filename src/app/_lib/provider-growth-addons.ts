export type GrowthAddonCategoryId =
  | "visibility"
  | "trust"
  | "geo"
  | "analytics"
  | "premium";

export type GrowthAddonPlanTier = "free" | "standard" | "pro" | "elite" | null;

export interface GrowthAddon {
  slug: string;
  categoryId: GrowthAddonCategoryId;
  name: string;
  priceLabel: string;
  description: string;
  impactPreview: string;
  duration: string;
  placement: string;
  bestResults: string;
  scarcityNote?: string;
  includedIn?: string;
  cadence?: "one-time" | "recurring" | "usage" | "included";
}

export interface GrowthAddonCategory {
  id: GrowthAddonCategoryId;
  eyebrow: string;
  title: string;
  description: string;
  revenueNote: string;
  addons: GrowthAddon[];
}

export interface GrowthBundle {
  slug: string;
  name: string;
  audience: string;
  priceLabel: string;
  summary: string;
  outcome: string;
  items: string[];
}

const visibilityAddons: GrowthAddon[] = [
  {
    slug: "explore-boost",
    categoryId: "visibility",
    name: "Explore Boost",
    priceLabel: "$12",
    description:
      "Temporarily moves your profile to the top of Explore results, increasing visibility during peak browsing hours.",
    impactPreview: "Estimated lift: up to 3x more Explore impressions during the active 24-hour window.",
    duration: "24 hours",
    placement: "Top of Explore results",
    bestResults: "Best results: Explore Boost + Trending Badge",
    cadence: "one-time",
  },
  {
    slug: "city-spotlight",
    categoryId: "visibility",
    name: "City Spotlight",
    priceLabel: "$29",
    description:
      "Places your profile in a featured position within your selected city, capturing high-intent local traffic.",
    impactPreview: "Estimated lift: above most standard city listings while the spotlight is active.",
    duration: "72 hours",
    placement: "Featured city results",
    bestResults: "Best results: City Spotlight + Weekend Boost",
    scarcityNote: "Featured city slots are capped each cycle.",
    cadence: "one-time",
  },
  {
    slug: "homepage-featured",
    categoryId: "visibility",
    name: "Homepage Featured",
    priceLabel: "$59",
    description:
      "Showcases your profile in the homepage carousel with premium exposure across all users.",
    impactPreview: "Impact preview: homepage carousel exposure across every browsing session for 7 days.",
    duration: "7 days",
    placement: "Homepage carousel",
    bestResults: "Best results: Homepage Featured + Trending Badge",
    scarcityNote: "Homepage carousel inventory is intentionally limited.",
    cadence: "one-time",
  },
  {
    slug: "weekend-boost",
    categoryId: "visibility",
    name: "Weekend Boost",
    priceLabel: "$22",
    description:
      "Automatically boosts your visibility during peak demand days when clients are most active.",
    impactPreview: "Impact preview: elevated placement from Friday through Sunday when browse demand peaks.",
    duration: "Fri-Sun",
    placement: "Explore and city results",
    bestResults: "Best results: Weekend Boost + City Spotlight",
    cadence: "one-time",
  },
  {
    slug: "trending-badge",
    categoryId: "visibility",
    name: "Trending Badge",
    priceLabel: "$12",
    description:
      'Adds a "Trending" label to your profile, increasing clicks through social proof and urgency.',
    impactPreview: "Impact preview: stronger click intent with visible momentum and social proof.",
    duration: "7 days",
    placement: "Profile card and profile header",
    bestResults: "Best results: Trending Badge + Explore Boost",
    cadence: "one-time",
  },
];

const trustAddons: GrowthAddon[] = [
  {
    slug: "verified-badge-renewal",
    categoryId: "trust",
    name: "Verified Badge Renewal",
    priceLabel: "$39/year",
    description:
      "Keeps your verified status active, maintaining trust and ranking priority.",
    impactPreview: "Impact preview: keeps trust cues and ranking support visible year-round.",
    duration: "12 months",
    placement: "Profile card, profile header, trust filters",
    bestResults: "Best results: Verified Badge Renewal + Profile Stats Badge",
    cadence: "recurring",
  },
  {
    slug: "in-person-verified-badge",
    categoryId: "trust",
    name: "In-Person Verified Badge",
    priceLabel: "$79 one-time",
    description:
      "Premium verification for profiles that complete additional identity checks, increasing client confidence significantly.",
    impactPreview: "Impact preview: stronger first-contact trust when clients compare similar profiles.",
    duration: "Permanent badge",
    placement: "Profile card, profile header, trust modules",
    bestResults: "Best results: In-Person Verified Badge + Verified Reviews Import",
    cadence: "one-time",
  },
  {
    slug: "profile-stats-badge",
    categoryId: "trust",
    name: "Profile Stats Badge",
    priceLabel: "$6/month",
    description:
      "Displays monthly profile views to build credibility and social proof.",
    impactPreview: "Impact preview: visible traffic proof that reinforces profile activity and demand.",
    duration: "Monthly recurring",
    placement: "Profile card and profile quick facts",
    bestResults: "Best results: Profile Stats Badge + Verified Badge Renewal",
    cadence: "recurring",
  },
  {
    slug: "verified-reviews-import",
    categoryId: "trust",
    name: "Verified Reviews Import",
    priceLabel: "$5 per review",
    description:
      "Import verified reviews from external platforms like Google or Yelp to strengthen your reputation.",
    impactPreview: "Impact preview: third-party proof stacked directly inside your profile trust layer.",
    duration: "Per imported review",
    placement: "Review module and profile proof points",
    bestResults: "Best results: Verified Reviews Import + In-Person Verified Badge",
    cadence: "usage",
  },
];

const geoAddons: GrowthAddon[] = [
  {
    slug: "keyword-boost",
    categoryId: "geo",
    name: "Keyword Boost",
    priceLabel: "$12/month",
    description:
      'Prioritizes your profile for specific search terms like "deep tissue" or "sports massage."',
    impactPreview: "Impact preview: stronger placement for the exact search terms tied to your niche.",
    duration: "Monthly recurring",
    placement: "Keyword search results",
    bestResults: "Best results: Keyword Boost + AI Keyword Insights",
    cadence: "recurring",
  },
  {
    slug: "regional-feature",
    categoryId: "geo",
    name: "Regional Feature",
    priceLabel: "$35",
    description:
      'Highlights your profile in curated regional lists like "Top in Dallas" or "Best in Texas."',
    impactPreview: "Impact preview: inclusion inside curated discovery blocks for local-intent traffic.",
    duration: "Featured cycle",
    placement: "Regional landing pages and curated lists",
    bestResults: "Best results: Regional Feature + City Spotlight",
    scarcityNote: "Regional features run with limited list inventory.",
    cadence: "one-time",
  },
  {
    slug: "auto-location-boost",
    categoryId: "geo",
    name: "Auto Location Boost",
    priceLabel: "$15/month",
    description:
      "Dynamically updates your visibility based on your real-time location to stay relevant in local searches.",
    impactPreview: "Impact preview: keeps your placement aligned with where you are actively working.",
    duration: "Monthly recurring",
    placement: "Nearby and local discovery surfaces",
    bestResults: "Best results: Auto Location Boost + Travel Boost",
    cadence: "recurring",
  },
  {
    slug: "travel-boost",
    categoryId: "geo",
    name: "Travel Boost",
    priceLabel: "$29/trip",
    description:
      "Pushes your profile higher when you mark yourself as traveling to a new city.",
    impactPreview: "Impact preview: gets travel dates seen faster right when you enter a new market.",
    duration: "Per trip",
    placement: "Travel search and city results",
    bestResults: "Best results: Travel Boost + Travel Map Visibility",
    cadence: "usage",
  },
  {
    slug: "travel-map-visibility",
    categoryId: "geo",
    name: "Travel Map Visibility",
    priceLabel: "$19/month",
    description:
      "Displays your travel schedule on an interactive map, helping clients plan ahead.",
    impactPreview: "Impact preview: map-based discovery for clients planning upcoming travel windows.",
    duration: "Monthly recurring",
    placement: "Travel map and travel modules",
    bestResults: "Best results: Travel Map Visibility + Travel Boost",
    cadence: "recurring",
  },
];

const analyticsAddons: GrowthAddon[] = [
  {
    slug: "traffic-alerts",
    categoryId: "analytics",
    name: "Traffic Alerts",
    priceLabel: "$6/month",
    description:
      "Get notified when your profile experiences spikes in traffic so you can react instantly.",
    impactPreview: "Impact preview: faster follow-up when demand surges instead of discovering it later.",
    duration: "Monthly recurring",
    placement: "Provider dashboard alerts",
    bestResults: "Best results: Traffic Alerts + AI Keyword Insights",
    cadence: "recurring",
  },
  {
    slug: "market-comparison-insights",
    categoryId: "analytics",
    name: "Market Comparison Insights",
    priceLabel: "$12/month",
    description:
      "See how your profile performs compared to others in your city and category.",
    impactPreview: "Impact preview: benchmark your visibility against local competition and spot gaps fast.",
    duration: "Monthly recurring",
    placement: "Provider dashboard analytics",
    bestResults: "Best results: Market Comparison Insights + Keyword Boost",
    cadence: "recurring",
  },
  {
    slug: "ai-keyword-insights",
    categoryId: "analytics",
    name: "AI Keyword Insights",
    priceLabel: "$19/month",
    description:
      "Discover which keywords bring traffic and get recommendations to improve visibility.",
    impactPreview: "Impact preview: turns search behavior into concrete keyword and copy actions.",
    duration: "Monthly recurring",
    placement: "Provider dashboard analytics",
    bestResults: "Best results: AI Keyword Insights + Keyword Boost",
    cadence: "recurring",
  },
  {
    slug: "heatmap-click-tracking",
    categoryId: "analytics",
    name: "Heatmap Click Tracking",
    priceLabel: "Included in Pro+",
    description:
      "Visualize where users interact most on your profile to optimize performance.",
    impactPreview: "Impact preview: see the exact profile sections drawing attention and clicks.",
    duration: "Included while on Pro or Elite",
    placement: "Provider dashboard analytics",
    bestResults: "Best results: included automatically when you upgrade to Pro or Elite.",
    includedIn: "Pro+",
    cadence: "included",
  },
];

const premiumAddons: GrowthAddon[] = [
  {
    slug: "masseur-of-the-day",
    categoryId: "premium",
    name: "Masseur of the Day",
    priceLabel: "$29/day",
    description:
      "Top homepage placement plus highest priority in regional search for 24 hours.",
    impactPreview: "Impact preview: your strongest one-day push across homepage and regional discovery.",
    duration: "24 hours",
    placement: "Homepage hero and regional search priority",
    bestResults: "Best results: Masseur of the Day + Geo Ads Campaign",
    scarcityNote: "Only one daily feature slot runs per city.",
    cadence: "one-time",
  },
  {
    slug: "virtual-line-priority",
    categoryId: "premium",
    name: "Virtual Line Priority",
    priceLabel: "$24/month",
    description:
      "Places your profile ahead of others in high-demand browsing queues.",
    impactPreview: "Impact preview: earlier placement in queue-style browsing where speed matters most.",
    duration: "Monthly recurring",
    placement: "High-demand browse queues",
    bestResults: "Best results: Virtual Line Priority + Weekend Boost",
    cadence: "recurring",
  },
  {
    slug: "extra-gallery-space",
    categoryId: "premium",
    name: "Extra Gallery Space",
    priceLabel: "$14/month",
    description:
      "Add more photos to better showcase your services and increase engagement.",
    impactPreview: "Impact preview: more visual proof for visitors deciding between similar profiles.",
    duration: "Monthly recurring",
    placement: "Public profile gallery",
    bestResults: "Best results: Extra Gallery Space + Verified Reviews Import",
    cadence: "recurring",
  },
  {
    slug: "geo-ads-campaign",
    categoryId: "premium",
    name: "Geo Ads Campaign",
    priceLabel: "$15-$39 per campaign",
    description:
      "Run targeted campaigns in specific cities or regions to drive additional traffic to your profile.",
    impactPreview: "Impact preview: paid city-level reach for launches, reactivations, or travel pushes.",
    duration: "Per campaign",
    placement: "Sponsored city and regional discovery",
    bestResults: "Best results: Geo Ads Campaign + Masseur of the Day",
    scarcityNote: "Campaign inventory is capped by market to protect performance.",
    cadence: "usage",
  },
];

export const PROVIDER_GROWTH_ADDON_CATEGORIES: GrowthAddonCategory[] = [
  {
    id: "visibility",
    eyebrow: "High Volume, Fast Cash",
    title: "Visibility Boosts",
    description:
      "The highest-velocity upgrades for therapists who want immediate placement gains without changing their base plan.",
    revenueNote: "Low-ticket impulse buys designed for stacking.",
    addons: visibilityAddons,
  },
  {
    id: "trust",
    eyebrow: "High ROI, Lower Volume",
    title: "Trust & Credibility",
    description:
      "Conversion-rate upgrades that make first contact easier and help justify stronger pricing.",
    revenueNote: "Best for profiles that already get traffic and need stronger proof.",
    addons: trustAddons,
  },
  {
    id: "geo",
    eyebrow: "Smart Targeting",
    title: "Geo & Discovery",
    description:
      "Intent-based placements built around city demand, keyword relevance, and travel visibility.",
    revenueNote: "Ideal for therapists who rotate cities or own a strong niche.",
    addons: geoAddons,
  },
  {
    id: "analytics",
    eyebrow: "Upgrade Lever",
    title: "Analytics & Performance",
    description:
      "Data products that increase retention, reveal missed opportunity, and create a natural path into Pro and Elite.",
    revenueNote: "Recurring software-style revenue with strong expansion potential.",
    addons: analyticsAddons,
  },
  {
    id: "premium",
    eyebrow: "Limited Slots, High Margin",
    title: "Premium Exposure",
    description:
      "Scarcity-driven placements for therapists who want concentrated bursts of demand or market launches.",
    revenueNote: "Best positioned as premium inventory with capped availability.",
    addons: premiumAddons,
  },
];

export const PROVIDER_GROWTH_BUNDLES: GrowthBundle[] = [
  {
    slug: "city-takeover",
    name: "City Takeover",
    audience: "For local domination",
    priceLabel: "$51",
    summary: "Own a city cycle with the strongest local visibility stack.",
    outcome: "Result: premium local placement from browse entry to city results.",
    items: ["City Spotlight", "Weekend Boost"],
  },
  {
    slug: "trust-conversion-stack",
    name: "Trust Conversion Stack",
    audience: "For higher reply rates",
    priceLabel: "$85 + $5/review",
    summary: "Layer the proof signals that reduce hesitation on first contact.",
    outcome: "Result: a more credible profile that converts traffic into outreach faster.",
    items: ["In-Person Verified Badge", "Profile Stats Badge", "Verified Reviews Import"],
  },
  {
    slug: "travel-launch-kit",
    name: "Travel Launch Kit",
    audience: "For visiting a new city",
    priceLabel: "$48 + $29/trip",
    summary: "Make sure a travel announcement turns into visible local demand.",
    outcome: "Result: better placement before, during, and after arrival in a travel market.",
    items: ["Auto Location Boost", "Travel Map Visibility", "Travel Boost"],
  },
  {
    slug: "premium-push",
    name: "Premium Push",
    audience: "For concentrated demand bursts",
    priceLabel: "$44-$68/day",
    summary: "Stack capped inventory for the biggest possible homepage-to-search lift.",
    outcome: "Result: the strongest short-window visibility package in the catalog.",
    items: ["Masseur of the Day", "Geo Ads Campaign"],
  },
];

const allAddons = PROVIDER_GROWTH_ADDON_CATEGORIES.flatMap((category) => category.addons);

export const PROVIDER_GROWTH_HERO_ADDONS = [
  "explore-boost",
  "city-spotlight",
  "travel-boost",
].map((slug) => allAddons.find((addon) => addon.slug === slug)).filter(Boolean) as GrowthAddon[];

export function findGrowthAddon(slug: string) {
  return allAddons.find((addon) => addon.slug === slug) || null;
}

export function buildAddonSupportHref(label: string, source: string) {
  const subject = `Activate ${label}`;
  const body = [
    "Hi MasseurMatch,",
    "",
    `I want to activate ${label}.`,
    "",
    `Source: ${source}`,
    "Please send the next step for billing and activation.",
  ].join("\n");

  return `mailto:billing@masseurmatch.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function isAddonIncludedInPlan(addon: GrowthAddon, currentPlan: GrowthAddonPlanTier) {
  if (!addon.includedIn) return false;
  if (addon.includedIn !== "Pro+") return false;

  return currentPlan === "pro" || currentPlan === "elite";
}
