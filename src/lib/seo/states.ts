export type SeoState = { slug: string; name: string; code: string };

export const SEO_STATES: SeoState[] = [
  { slug: "california-ca", name: "California", code: "CA" },
  { slug: "texas-tx", name: "Texas", code: "TX" },
  { slug: "florida-fl", name: "Florida", code: "FL" },
  { slug: "new-york-ny", name: "New York", code: "NY" },
  { slug: "illinois-il", name: "Illinois", code: "IL" },
  { slug: "georgia-ga", name: "Georgia", code: "GA" },
  { slug: "washington-wa", name: "Washington", code: "WA" },
  { slug: "colorado-co", name: "Colorado", code: "CO" },
  { slug: "arizona-az", name: "Arizona", code: "AZ" },
  { slug: "nevada-nv", name: "Nevada", code: "NV" },
];

export const STATE_SLUG_SET = new Set(SEO_STATES.map((s) => s.slug));
