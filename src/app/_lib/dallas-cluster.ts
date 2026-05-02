import { getCanonicalCitySlug, resolveCitySlug } from "@/app/_lib/city-routing";

export type CanonicalPageKind = "service" | "session" | "neighborhood";

export type CanonicalCategory = {
  slug: string;
  label: string;
  kind: CanonicalPageKind;
  primaryKeyword: string;
  title: string;
  h1: string;
  intro: string;
};

export const DALLAS_SERVICE_SLUGS = [
  "gay-massage",
  "male-massage",
  "deep-tissue",
  "swedish",
  "sports-massage",
] as const;

export const DALLAS_SESSION_SLUGS = [
  "incall",
  "outcall",
  "mobile",
  "hotel",
] as const;

export const DALLAS_NEIGHBORHOOD_SLUGS = [
  "oak-lawn",
  "turtle-creek",
  "uptown",
  "medical-district",
  "university-park",
  "highland-park",
  "dfw-airport",
  "love-field",
] as const;

export const DFW_SUBURB_GAY_CITY_SLUGS = [
  "plano",
  "richardson",
  "carrollton",
  "addison",
  "arlington",
  "fort-worth",
  "irving",
  "frisco",
  "grand-prairie",
  "farmers-branch",
] as const;

const DALLAS_CATEGORY_COPY: Record<string, Omit<CanonicalCategory, "slug">> = {
  "gay-massage": {
    label: "Gay Massage",
    kind: "service",
    primaryKeyword: "gay massage dallas",
    title: "Gay Massage in Dallas, TX | Verified Male Massage Therapists | MasseurMatch",
    h1: "Dallas Gay Massage and Male Massage Therapists",
    intro:
      "Find gay massage in Dallas through a city-first directory built for direct contact and stronger trust signals. This page focuses on verified male therapists, clear incall and outcall options, visible starting rates, and neighborhood context that helps you decide quickly. Compare profile quality, specialties, and response preferences in one place instead of jumping across thin listings. Dallas is the beachhead market for MasseurMatch, so this route is optimized for high-intent local search and cleaner user journeys. Use it to move from broad city discovery into service, session type, and neighborhood pages without losing relevance.",
  },
  "male-massage": {
    label: "Male Massage",
    kind: "service",
    primaryKeyword: "male massage dallas",
    title: "Male Massage in Dallas, TX | Verified Male Therapists | MasseurMatch",
    h1: "Male Massage in Dallas, TX",
    intro:
      "Browse male massage listings in Dallas with profile depth, transparent session formats, and direct contact actions. Instead of shallow directory cards, this page emphasizes verification signals, neighborhood coverage, and entry pricing so users can shortlist confidently. Dallas remains the primary proving ground for MasseurMatch over the next 60 to 90 days, which means this page receives focused internal links from city, guide, and neighborhood clusters. Use it as the main route for broad male massage intent, then pivot into deep tissue, Swedish, outcall, or local micro-area pages based on your exact needs.",
  },
  "deep-tissue": {
    label: "Deep Tissue Massage",
    kind: "service",
    primaryKeyword: "deep tissue massage dallas",
    title: "Deep Tissue Massage in Dallas, TX | Verified Male Therapists | MasseurMatch",
    h1: "Deep Tissue Massage in Dallas, TX",
    intro:
      "Explore deep tissue massage in Dallas with a strong local trust layer and city-specific profile comparison. This page targets users who already know they want focused pressure, recovery support, and therapists who clearly explain approach and pricing. Listings prioritize clear service details, visibility into incall versus outcall, and direct contact pathways that reduce friction. As part of the Dallas-first cluster strategy, this route is tightly linked to neighborhood and guide content so intent stays aligned from search click to provider contact. Use it to compare deep tissue options fast and move directly into relevant local subareas.",
  },
  swedish: {
    label: "Swedish Massage",
    kind: "service",
    primaryKeyword: "swedish massage dallas",
    title: "Swedish Massage in Dallas, TX | Verified Male Therapists | MasseurMatch",
    h1: "Swedish Massage in Dallas, TX",
    intro:
      "Find Swedish massage in Dallas through a premium city page that balances calm presentation with high-intent SEO structure. This route highlights therapists who clearly communicate session style, comfort, and boundaries while keeping pricing and service format visible. Dallas is being used as the main beachhead market, so this page connects tightly to neighborhood pages and editorial guides that support user confidence. Compare listings by verification status, location context, and direct-contact readiness. If you want restorative maintenance rather than high-pressure bodywork, this is the best starting point before drilling into local micro-areas.",
  },
  "sports-massage": {
    label: "Sports Massage",
    kind: "service",
    primaryKeyword: "sports massage dallas",
    title: "Sports Massage in Dallas, TX | Verified Male Therapists | MasseurMatch",
    h1: "Sports Massage in Dallas, TX",
    intro:
      "Discover sports massage in Dallas with city-level relevance and profile-level clarity. This page is designed for users looking for recovery, mobility support, and performance-focused bodywork without marketplace clutter. Therapist cards emphasize session format, neighborhood context, and visible rates so decision-making stays fast on mobile and desktop. Within the Dallas-first rollout, this route functions as a high-intent service node connected to Oak Lawn, Uptown, Medical District, and airport-area demand pages. Start here to compare options, then move to neighborhood and guide routes that match your schedule and location needs.",
  },
  incall: {
    label: "Incall Massage",
    kind: "session",
    primaryKeyword: "incall massage dallas",
    title: "Incall Massage in Dallas, TX | Verified Male Therapists | MasseurMatch",
    h1: "Incall Massage in Dallas, TX",
    intro:
      "Use this Dallas incall page to find therapists who host sessions in a dedicated location and provide clear setup expectations. The layout is built for users who value environment consistency, transparent rates, and direct communication before a session. Listings surface trust signals, modality details, and neighborhood context to improve match quality. As part of the Dallas beachhead strategy, this route is linked to service and neighborhood pages so local intent is preserved throughout discovery. Review profile details, compare starting prices, and reach out directly to providers whose studio format and boundaries fit your preferences.",
  },
  outcall: {
    label: "Outcall Massage",
    kind: "session",
    primaryKeyword: "outcall massage dallas",
    title: "Outcall Massage in Dallas, TX | Verified Male Therapists | MasseurMatch",
    h1: "Outcall Massage in Dallas, TX",
    intro:
      "Find outcall massage in Dallas through a route built for high-intent mobile and hotel-based demand. This page prioritizes therapists who clearly indicate travel availability, neighborhood coverage, and direct communication preferences. Cards highlight starting rates, verification context, and session format so users can quickly decide who to contact. Because Dallas is the 60 to 90 day proving ground, this page receives strong internal links from guides and neighborhood routes where outcall intent is common. Use it to compare travel-ready providers and move directly from search intent to a confident outreach decision.",
  },
  mobile: {
    label: "Mobile Massage",
    kind: "session",
    primaryKeyword: "mobile male massage dallas",
    title: "Mobile Massage in Dallas, TX | Verified Male Therapists | MasseurMatch",
    h1: "Mobile Massage in Dallas, TX",
    intro:
      "Browse mobile massage in Dallas with a local-first directory experience designed around convenience and trust. This page focuses on providers who can travel, communicate clearly, and show transparent session details before contact. Instead of generic listings, users get stronger context on neighborhood coverage, service style, and pricing entry points. Dallas is intentionally prioritized as the beachhead market, so this route is integrated with airport, hotel, and micro-area pages where mobile demand is highest. Compare options quickly, then connect directly with therapists who match your location and session expectations.",
  },
  hotel: {
    label: "Hotel Massage",
    kind: "session",
    primaryKeyword: "hotel massage dallas",
    title: "Hotel Massage in Dallas, TX | Verified Male Therapists | MasseurMatch",
    h1: "Hotel Massage in Dallas, TX",
    intro:
      "This Dallas hotel massage page is built for travelers and locals who need fast discovery with clear trust signals. Listings prioritize providers who support hotel sessions, display starting rates, and communicate availability directly. The page structure reduces friction by connecting hotel intent to nearby neighborhoods, outcall-ready therapists, and practical editorial guides. As part of the Dallas-first rollout, it works as a conversion-focused node tied to DFW Airport and Love Field micro-markets. Use it to shortlist providers quickly and move from high-intent search to direct contact without unnecessary intermediaries.",
  },
  "oak-lawn": {
    label: "Oak Lawn",
    kind: "neighborhood",
    primaryKeyword: "oak lawn gay massage",
    title: "Gay Massage in Oak Lawn, Dallas, TX | Verified Male Therapists | MasseurMatch",
    h1: "Gay Massage in Oak Lawn, Dallas",
    intro:
      "Find gay massage options in Oak Lawn with neighborhood-level relevance and Dallas-wide trust infrastructure. This page exists because micro-location intent converts better when users can compare local coverage, profile quality, and session format quickly. Listings include verification context, starting prices, and direct-contact pathways to keep discovery practical. Oak Lawn is one of the first Dallas micro-areas in the beachhead strategy, linked tightly to city, service, and session pages. Use it when neighborhood proximity matters and you want a shortlist that aligns with local access, comfort, and availability expectations.",
  },
  "turtle-creek": {
    label: "Turtle Creek",
    kind: "neighborhood",
    primaryKeyword: "turtle creek gay massage",
    title: "Gay Massage in Turtle Creek, Dallas, TX | Verified Male Therapists | MasseurMatch",
    h1: "Gay Massage in Turtle Creek, Dallas",
    intro:
      "Explore Turtle Creek gay massage listings through a page tailored for micro-area search behavior in Dallas. Users can compare verified profiles, session formats, and starting rates while keeping local context central to the decision. This route supports the Dallas-first cluster by connecting neighborhood intent to high-performing service and guide pages. Direct contact stays at the core, with less noise and clearer profile signals than broad marketplaces. Use Turtle Creek as a focused entry point when location fit and efficient outreach matter as much as modality and provider presentation.",
  },
  uptown: {
    label: "Uptown",
    kind: "neighborhood",
    primaryKeyword: "uptown dallas male massage",
    title: "Gay Massage in Uptown, Dallas, TX | Verified Male Therapists | MasseurMatch",
    h1: "Gay Massage in Uptown, Dallas",
    intro:
      "This Uptown Dallas page helps users capture neighborhood-specific intent without sacrificing trust and profile depth. Listings are presented with clear modality cues, session format details, and transparent starting prices to speed up decisions. Uptown is part of the first wave of Dallas micro-areas in the 60 to 90 day beachhead rollout, with direct links to city and service routes. The goal is straightforward: better local relevance, cleaner internal linking, and faster contact readiness. Start here if your search is tied to Uptown access and you want focused, high-intent options.",
  },
  "medical-district": {
    label: "Medical District",
    kind: "neighborhood",
    primaryKeyword: "medical district massage for men",
    title: "Male Massage in Medical District, Dallas, TX | Verified Therapists | MasseurMatch",
    h1: "Male Massage in Medical District, Dallas",
    intro:
      "Find male massage in Dallas Medical District through a neighborhood page built for practical local intent. Provider cards highlight direct-contact readiness, session format, and pricing visibility so users can evaluate quickly. This route is part of the Dallas beachhead cluster and links to service and session pages for deeper matching. Instead of broad search detours, users stay in a focused corridor where location context remains clear from first click to outreach. Use it when Medical District proximity is a primary filter and you want a shortlist with stronger trust indicators.",
  },
  "university-park": {
    label: "University Park",
    kind: "neighborhood",
    primaryKeyword: "university park gay massage",
    title: "Gay Massage in University Park, Dallas, TX | Verified Male Therapists | MasseurMatch",
    h1: "Gay Massage in University Park, Dallas",
    intro:
      "University Park demand is captured here with a focused neighborhood template tied to Dallas city authority. Listings surface trust and session details up front, then connect users to profile pages with direct contact options. This page is part of the first Dallas micro-area launch because nearby-intent searches often outperform broad city terms for conversion. Internal links keep users moving between service, session, and guide pages without losing context. Use University Park as your starting point when local convenience and neighborhood relevance are essential to your provider choice.",
  },
  "highland-park": {
    label: "Highland Park",
    kind: "neighborhood",
    primaryKeyword: "highland park gay massage",
    title: "Gay Massage in Highland Park, Dallas, TX | Verified Male Therapists | MasseurMatch",
    h1: "Gay Massage in Highland Park, Dallas",
    intro:
      "This Highland Park page targets micro-area search intent with stronger local context than a generic city listing. Users can compare verified providers, visible rates, and session format details while staying inside a neighborhood-focused flow. Highland Park is a strategic part of the Dallas-first rollout due to existing competitor visibility in nearby terms. The page links tightly to city, service, and session routes to reinforce authority and reduce bounce. Use it when Highland Park proximity matters and you want a cleaner discovery path from search to direct provider contact.",
  },
  "dfw-airport": {
    label: "DFW Airport",
    kind: "neighborhood",
    primaryKeyword: "dfw airport gay massage",
    title: "Gay Massage near DFW Airport, TX | Verified Male Therapists | MasseurMatch",
    h1: "Gay Massage near DFW Airport",
    intro:
      "DFW Airport is treated as a high-intent micro-market where travel timing and response speed matter. This page highlights providers relevant to airport-adjacent demand with clear outcall and direct-contact signals. It supports the Dallas beachhead by connecting travelers and nearby users to trusted profile listings and session pages. Instead of forcing broad-city navigation, users can stay in an airport-focused funnel and move quickly to outreach. Use this route for hotel and transit-related intent where location precision and direct-contact readiness are both critical.",
  },
  "love-field": {
    label: "Love Field",
    kind: "neighborhood",
    primaryKeyword: "love field gay massage",
    title: "Gay Massage near Love Field, Dallas, TX | Verified Male Therapists | MasseurMatch",
    h1: "Gay Massage near Love Field, Dallas",
    intro:
      "Love Field search intent is handled here through a focused Dallas micro-area page optimized for direct contact and local relevance. Listings show trust context, session format, and pricing cues that help users decide fast. This route complements DFW Airport and hotel pages as part of the Dallas-first proving model. Internal links connect travel-adjacent users to service and city pages without diluting intent. Use Love Field as your entry point when proximity to airport corridors is a strong part of your therapist selection criteria.",
  },
};

export const DALLAS_ORDERED_CATEGORY_SLUGS = [
  "gay-massage",
  "male-massage",
  "deep-tissue",
  "swedish",
  "sports-massage",
  "incall",
  "outcall",
  "mobile",
  "hotel",
  "oak-lawn",
  "turtle-creek",
  "uptown",
  "medical-district",
  "university-park",
  "highland-park",
  "dfw-airport",
  "love-field",
] as const;

export function getDallasCategory(slug: string): CanonicalCategory | null {
  const category = DALLAS_CATEGORY_COPY[slug];
  if (!category) {
    return null;
  }

  return { slug, ...category };
}

export function getCanonicalCategoryForCity(cityCanonicalSlug: string, categorySlug: string): CanonicalCategory | null {
  const citySlug = resolveCitySlug(cityCanonicalSlug);
  if (!citySlug) {
    return null;
  }

  if (citySlug === "dallas") {
    return getDallasCategory(categorySlug);
  }

  const dfwSuburbMatch = DFW_SUBURB_GAY_CITY_SLUGS.includes(citySlug as (typeof DFW_SUBURB_GAY_CITY_SLUGS)[number]);
  if (dfwSuburbMatch && categorySlug === "gay-massage") {
    return {
      slug: categorySlug,
      kind: "service",
      label: "Gay Massage",
      primaryKeyword: `${citySlug.replace(/-/g, " ")} gay massage`,
      title: `Gay Massage in ${cityCanonicalSlug.replace(/-/g, " ")} | Verified Male Therapists | MasseurMatch`,
      h1: `Gay Massage in ${cityCanonicalSlug.replace(/-/g, " ")}`,
      intro:
        "This DFW support page captures nearby gay massage intent and reinforces Dallas cluster authority. It provides a focused local entry point with direct profile contact, visible session format, and stronger trust context than generic listing pages.",
    };
  }

  return null;
}

export function isDallasBeachheadCity(cityCanonicalSlug: string): boolean {
  const citySlug = resolveCitySlug(cityCanonicalSlug);
  return citySlug === "dallas";
}

export function getCityCanonicalCategorySlugs(cityCanonicalSlug: string): string[] {
  const citySlug = resolveCitySlug(cityCanonicalSlug);
  if (!citySlug) {
    return [];
  }

  if (citySlug === "dallas") {
    return [...DALLAS_ORDERED_CATEGORY_SLUGS];
  }

  const dfwSuburbMatch = DFW_SUBURB_GAY_CITY_SLUGS.includes(citySlug as (typeof DFW_SUBURB_GAY_CITY_SLUGS)[number]);
  if (dfwSuburbMatch) {
    return ["gay-massage"];
  }

  return [];
}

export function getDfwSupportCanonicalCitySlugs(): string[] {
  return DFW_SUBURB_GAY_CITY_SLUGS.map((slug) => getCanonicalCitySlug(slug));
}
