export const BLOCKED_ADULT_TERMS = ["escort", "erotic", "nuru", "sensual", "xxx", "adult", "explicit"];

export const BLOCKED_CLAIMS = [
  "better than",
  "the best replacement",
  "official alternative",
  "safer than",
  "verified licensed therapists",
  "book now",
];

export function hasUnsafeLanguage(input: string): boolean {
  const normalized = input.toLowerCase();
  return BLOCKED_ADULT_TERMS.some((term) => normalized.includes(term));
}

export function hasUnsupportedClaim(input: string): boolean {
  const normalized = input.toLowerCase();
  return BLOCKED_CLAIMS.some((term) => normalized.includes(term));
}

export function sanitizeForPublicText(input: string): string {
  let sanitized = input;
  for (const term of [...BLOCKED_ADULT_TERMS, ...BLOCKED_CLAIMS]) {
    sanitized = sanitized.replace(new RegExp(term, "gi"), "");
  }
  return sanitized.replace(/\s+/g, " ").trim();
}
