import { COMPETITORS } from "@/lib/seo/competitors";

export type CompetitorRouteType = "vs" | "alternative" | "hub";

export type CompetitorRoute = {
  slug: string;
  competitorSlug?: string;
  type: CompetitorRouteType;
  title: string;
  description: string;
  keywords: string[];
  indexable: boolean;
  qualityApproved: boolean;
  searchDemandEvidence: boolean;
  manualEditorialHub: boolean;
  priority: number;
  changeFrequency: "monthly";
};

const HUB_ROUTES: CompetitorRoute[] = [
  {
    slug: "best-gay-massage-directory-alternatives",
    type: "hub",
    title: "Best Gay Massage Directory Alternatives | MasseurMatch",
    description:
      "Compare professional massage directory alternatives for finding independent massage therapists, LGBT friendly providers, male massage therapists, and direct contact options.",
    keywords: ["best gay massage directory alternatives"],
    indexable: true,
    qualityApproved: true,
    searchDemandEvidence: true,
    manualEditorialHub: true,
    priority: 0.5,
    changeFrequency: "monthly",
  },
  {
    slug: "best-lgbt-friendly-massage-directory",
    type: "hub",
    title: "Best LGBT Friendly Massage Directory | MasseurMatch",
    description:
      "Compare professional massage directory alternatives for finding independent massage therapists, LGBT friendly providers, male massage therapists, and direct contact options.",
    keywords: ["best lgbt friendly massage directory"],
    indexable: true,
    qualityApproved: true,
    searchDemandEvidence: true,
    manualEditorialHub: true,
    priority: 0.5,
    changeFrequency: "monthly",
  },
  {
    slug: "best-male-massage-directory-alternatives",
    type: "hub",
    title: "Best Male Massage Directory Alternatives | MasseurMatch",
    description:
      "Compare professional massage directory alternatives for finding independent massage therapists, LGBT friendly providers, male massage therapists, and direct contact options.",
    keywords: ["best male massage directory alternatives"],
    indexable: true,
    qualityApproved: true,
    searchDemandEvidence: true,
    manualEditorialHub: true,
    priority: 0.5,
    changeFrequency: "monthly",
  },
  {
    slug: "best-massage-directory-alternatives",
    type: "hub",
    title: "Best Massage Directory Alternatives | MasseurMatch",
    description:
      "Compare professional massage directory alternatives for finding independent massage therapists, LGBT friendly providers, male massage therapists, and direct contact options.",
    keywords: ["best massage therapist directory", "best independent massage therapist directory"],
    indexable: true,
    qualityApproved: true,
    searchDemandEvidence: true,
    manualEditorialHub: true,
    priority: 0.5,
    changeFrequency: "monthly",
  },
];

const EXPLICIT_ALIAS_MAP: Record<string, string> = {
  "rent-massuer-alternative": "rentmasseur-alternative",
  "rent-masseur-alternative": "rentmasseur-alternative",
  "massuerfinder-alternative": "masseurfinder-alternative",
  "masseurfinder-vs-masseurmatch": "masseurmatch-vs-masseurfinder",
};

function hasSearchDemandEvidence(keywords: string[]) {
  return keywords.some((keyword) => keyword.includes("alternative") || keyword.includes("vs") || keyword.includes("best"));
}

export const COMPETITOR_ROUTES: CompetitorRoute[] = COMPETITORS.flatMap((competitor) => {
  if (!competitor.allowedForComparison) {
    return [];
  }

  const vsSlug = `masseurmatch-vs-${competitor.slug}`;
  const altSlug = `${competitor.slug}-alternative`;

  const vsKeywords = [`${competitor.slug} vs masseurmatch`, ...competitor.vsKeywords];
  const altKeywords = [`${competitor.slug} alternative`, ...competitor.alternativeKeywords];

  const vsDemand = hasSearchDemandEvidence(vsKeywords);
  const altDemand = hasSearchDemandEvidence(altKeywords);

  return [
    {
      slug: vsSlug,
      competitorSlug: competitor.slug,
      type: "vs" as const,
      title: `MasseurMatch vs ${competitor.name} | Massage Directory Comparison`,
      description:
        `Compare MasseurMatch and ${competitor.name} for finding independent massage therapists, LGBT friendly providers, city based search, profile details, and direct contact options.`,
      keywords: vsKeywords,
      indexable: competitor.indexable && vsDemand,
      qualityApproved: true,
      searchDemandEvidence: vsDemand,
      manualEditorialHub: false,
      priority: 0.65,
      changeFrequency: "monthly",
    },
    {
      slug: altSlug,
      competitorSlug: competitor.slug,
      type: "alternative" as const,
      title: `${competitor.name} Alternative | Find Massage Therapists on MasseurMatch`,
      description:
        `Looking for an alternative to ${competitor.name}? Explore MasseurMatch, a directory first platform for browsing independent massage therapist profiles and contacting providers directly.`,
      keywords: altKeywords,
      indexable: competitor.indexable && altDemand,
      qualityApproved: true,
      searchDemandEvidence: altDemand,
      manualEditorialHub: false,
      priority: 0.55,
      changeFrequency: "monthly",
    },
  ];
});

export const COMPETITOR_INDEX_ROUTES = [...COMPETITOR_ROUTES, ...HUB_ROUTES];

export const ALL_COMPETITOR_ROUTE_SLUGS = COMPETITOR_INDEX_ROUTES.map((entry) => entry.slug);

export function getCompetitorRouteBySlug(slug: string): CompetitorRoute | null {
  const canonicalSlug = EXPLICIT_ALIAS_MAP[slug] ?? slug;
  return COMPETITOR_INDEX_ROUTES.find((route) => route.slug === canonicalSlug) ?? null;
}

export function getCanonicalCompetitorRouteSlug(slug: string): string {
  return EXPLICIT_ALIAS_MAP[slug] ?? slug;
}

export function getSitemapCompetitorRoutes(): CompetitorRoute[] {
  return COMPETITOR_INDEX_ROUTES.filter((route) => route.indexable && route.qualityApproved && route.searchDemandEvidence);
}
