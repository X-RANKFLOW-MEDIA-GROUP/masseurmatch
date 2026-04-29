export type Competitor = {
  name: string;
  slug: string;
  domain: string;
  category: string;
  directCompetitor: boolean;
  allowedForComparison: boolean;
  excludedReason?: string;
  primaryKeywords: string[];
  alternativeKeywords: string[];
  vsKeywords: string[];
  safeIntentKeywords: string[];
  unsafeBlockedKeywords: string[];
  minimumSearchVolume: number;
  priority: number;
  indexable: boolean;
  lastReviewed: string;
};

const LAST_REVIEWED = "2026-04-28";

export const COMPETITORS: Competitor[] = [
  {
    name: "MasseurFinder",
    slug: "masseurfinder",
    domain: "masseurfinder.com",
    category: "gay massage directory, male massage directory",
    directCompetitor: true,
    allowedForComparison: true,
    primaryKeywords: ["masseurfinder", "masseur finder", "gay massage finder"],
    alternativeKeywords: [
      "masseurfinder alternative",
      "masseur finder alternative",
      "best alternative to masseurfinder",
      "sites like masseurfinder",
      "gay massage finder alternative",
    ],
    vsKeywords: ["masseurfinder vs masseurmatch"],
    safeIntentKeywords: ["male massage directory", "lgbt friendly massage directory"],
    unsafeBlockedKeywords: ["escort", "erotic", "nuru", "sensual", "xxx", "adult", "explicit"],
    minimumSearchVolume: 10,
    priority: 0.65,
    indexable: true,
    lastReviewed: LAST_REVIEWED,
  },
  {
    name: "RentMasseur",
    slug: "rentmasseur",
    domain: "rentmasseur.com",
    category: "gay massage, male masseur directory",
    directCompetitor: true,
    allowedForComparison: true,
    primaryKeywords: ["rentmasseur", "rent masseur", "rent massuer"],
    alternativeKeywords: [
      "rentmasseur alternative",
      "rent masseur alternative",
      "rent massuer alternative",
      "sites like rentmasseur",
      "best rentmasseur alternative",
    ],
    vsKeywords: ["rentmasseur vs masseurmatch", "rent masseur vs masseurmatch"],
    safeIntentKeywords: ["male massage directory", "gay friendly massage directory"],
    unsafeBlockedKeywords: ["escort", "erotic", "nuru", "sensual", "xxx", "adult", "explicit"],
    minimumSearchVolume: 10,
    priority: 0.65,
    indexable: true,
    lastReviewed: LAST_REVIEWED,
  },
  {
    name: "GuysMasseur",
    slug: "guysmasseur",
    domain: "guysmasseur.com",
    category: "male massage and gay massage therapist directory",
    directCompetitor: true,
    allowedForComparison: true,
    primaryKeywords: ["guysmasseur"],
    alternativeKeywords: ["guysmasseur alternative", "sites like guysmasseur"],
    vsKeywords: ["guysmasseur vs masseurmatch"],
    safeIntentKeywords: ["male massage directory alternative", "gay massage directory alternative"],
    unsafeBlockedKeywords: ["escort", "erotic", "nuru", "sensual", "xxx", "adult", "explicit"],
    minimumSearchVolume: 10,
    priority: 0.65,
    indexable: true,
    lastReviewed: LAST_REVIEWED,
  },
  {
    name: "FindMasseurs",
    slug: "findmasseurs",
    domain: "findmasseurs.com",
    category: "male massage therapist directory",
    directCompetitor: true,
    allowedForComparison: true,
    primaryKeywords: ["findmasseurs"],
    alternativeKeywords: ["findmasseurs alternative", "sites like findmasseurs"],
    vsKeywords: ["findmasseurs vs masseurmatch"],
    safeIntentKeywords: ["male massage therapist directory alternative"],
    unsafeBlockedKeywords: ["escort", "erotic", "nuru", "sensual", "xxx", "adult", "explicit"],
    minimumSearchVolume: 10,
    priority: 0.65,
    indexable: true,
    lastReviewed: LAST_REVIEWED,
  },
  {
    name: "SearchMasseur",
    slug: "searchmasseur",
    domain: "searchmasseur.com",
    category: "male masseurs and gay friendly massage therapists directory",
    directCompetitor: true,
    allowedForComparison: true,
    primaryKeywords: ["searchmasseur"],
    alternativeKeywords: ["searchmasseur alternative", "sites like searchmasseur"],
    vsKeywords: ["searchmasseur vs masseurmatch"],
    safeIntentKeywords: ["male masseur directory alternative"],
    unsafeBlockedKeywords: ["escort", "erotic", "nuru", "sensual", "xxx", "adult", "explicit"],
    minimumSearchVolume: 10,
    priority: 0.65,
    indexable: true,
    lastReviewed: LAST_REVIEWED,
  },
  {
    name: "RentMen",
    slug: "rentmen",
    domain: "rent.men",
    category: "adult escort adjacent platform",
    directCompetitor: false,
    allowedForComparison: false,
    excludedReason:
      "Adult and escort adjacent positioning does not match MasseurMatch professional directory rules.",
    primaryKeywords: ["rentmen"],
    alternativeKeywords: [],
    vsKeywords: [],
    safeIntentKeywords: [],
    unsafeBlockedKeywords: ["escort", "erotic", "nuru", "sensual", "xxx", "adult", "explicit"],
    minimumSearchVolume: 10,
    priority: 0,
    indexable: false,
    lastReviewed: LAST_REVIEWED,
  },
];

export function getCompetitorBySlug(slug: string) {
  return COMPETITORS.find((competitor) => competitor.slug === slug);
}
