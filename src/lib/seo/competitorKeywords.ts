import { COMPETITORS } from "@/lib/seo/competitors";

export type KeywordClassification =
  | "safe commercial"
  | "safe informational"
  | "brand alternative"
  | "misspelling"
  | "unsafe adult"
  | "blocked competitor"
  | "not relevant";

export type ImportedKeyword = {
  keyword: string;
  volume?: number;
  kd?: number;
  cpc?: number;
  position?: number;
  url?: string;
  intent?: string;
  source?: string;
  competitor?: string;
};

export const HUB_KEYWORDS = [
  "best gay massage directory alternatives",
  "best lgbt friendly massage directory",
  "best male massage directory alternatives",
  "best massage therapist directory",
  "best independent massage therapist directory",
  "gay friendly massage directory",
  "lgbt friendly massage therapist directory",
  "male massage therapist directory",
];

export const KEYWORD_NORMALIZATION_MAP: Record<string, string> = {
  "rent massuer": "rentmasseur",
  "rent masseur": "rentmasseur",
  "massuerfinder": "masseurfinder",
  "masseurfinder": "masseurfinder",
  "masseur finder": "masseurfinder",
  "gay massage finder": "masseurfinder",
};

const UNSAFE_TERMS = [
  "escort",
  "erotic",
  "nuru",
  "sensual",
  "xxx",
  "adult",
  "explicit",
];

export const INTERNAL_SYNONYMS = [
  "rent massuer",
  "rent masseur",
  "rentmasseur",
  "massuerfinder",
  "masseur finder",
  "masseurfinder",
  "gay massage finder",
  "male massage directory",
  "gay massage directory",
  "lgbt friendly massage directory",
];

export function normalizeKeyword(raw: string): string {
  const cleaned = raw.trim().toLowerCase().replace(/\s+/g, " ");
  return KEYWORD_NORMALIZATION_MAP[cleaned] ?? cleaned;
}

export function classifyKeyword(keyword: string, competitorSlug?: string): KeywordClassification {
  const normalized = normalizeKeyword(keyword);

  if (UNSAFE_TERMS.some((term) => normalized.includes(term))) {
    return "unsafe adult";
  }

  if (competitorSlug === "rentmen") {
    return "blocked competitor";
  }

  if (normalized.includes("alternative") || normalized.includes("vs") || normalized.includes("sites like")) {
    return "brand alternative";
  }

  if (Object.keys(KEYWORD_NORMALIZATION_MAP).includes(keyword.trim().toLowerCase())) {
    return "misspelling";
  }

  if (normalized.includes("directory") || normalized.includes("massage therapist")) {
    return "safe informational";
  }

  if (COMPETITORS.some((competitor) => competitor.slug === normalized || competitor.name.toLowerCase() === normalized)) {
    return "safe commercial";
  }

  return "not relevant";
}

export function canUseKeywordPublicly(classification: KeywordClassification): boolean {
  return ["safe commercial", "safe informational", "brand alternative", "misspelling"].includes(classification);
}
