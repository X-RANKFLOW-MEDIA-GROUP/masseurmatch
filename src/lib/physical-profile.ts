export const BODY_TYPES = [
  "slim",
  "athletic",
  "average",
  "muscular",
  "stocky",
  "large",
] as const;

export type BodyType = (typeof BODY_TYPES)[number];

export const BODY_TYPE_OPTIONS: Array<{ value: BodyType; label: string }> = [
  { value: "slim", label: "Slim" },
  { value: "athletic", label: "Athletic" },
  { value: "average", label: "Average" },
  { value: "muscular", label: "Muscular" },
  { value: "stocky", label: "Stocky" },
  { value: "large", label: "Large" },
];

const BODY_TYPE_LABELS = new Map(BODY_TYPE_OPTIONS.map((option) => [option.value, option.label] as const));
const BODY_TYPE_MATCH_TERMS: Record<BodyType, string[]> = {
  slim: ["slim", "lean", "slender", "thin", "magro"],
  athletic: ["athletic", "fit", "toned", "atletico"],
  average: ["average", "regular build", "medium build", "medio", "normal"],
  muscular: ["muscular", "muscle", "buff", "built", "jacked", "musculoso", "forte"],
  stocky: ["stocky", "solid", "thick", "encorpado"],
  large: ["large", "big", "heavier", "heavyset", "bigger", "grande", "grandao", "maior"],
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeBodyTypeValue(bodyType: string | null | undefined) {
  if (!bodyType) {
    return null;
  }

  const normalized = normalizeSearchText(bodyType.trim());
  return BODY_TYPES.includes(normalized as BodyType) ? (normalized as BodyType) : null;
}

export function matchBodyTypeKeyword(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = normalizeSearchText(value);

  for (const [bodyType, terms] of Object.entries(BODY_TYPE_MATCH_TERMS) as Array<[BodyType, string[]]>) {
    if (terms.some((term) => normalized.includes(normalizeSearchText(term)))) {
      return bodyType;
    }
  }

  return normalizeBodyTypeValue(normalized);
}

export function getBodyTypeLabel(bodyType: string | null | undefined) {
  const normalized = normalizeBodyTypeValue(bodyType);
  return normalized ? BODY_TYPE_LABELS.get(normalized) || null : null;
}

export function formatHeightInches(heightInches: number | null | undefined) {
  if (typeof heightInches !== "number" || !Number.isFinite(heightInches) || heightInches <= 0) {
    return null;
  }

  const rounded = Math.round(heightInches);
  const feet = Math.floor(rounded / 12);
  const inches = rounded % 12;

  return `${feet}'${inches}"`;
}

export function formatWeightLb(weightLb: number | null | undefined) {
  if (typeof weightLb !== "number" || !Number.isFinite(weightLb) || weightLb <= 0) {
    return null;
  }

  return `${Math.round(weightLb)} lb`;
}

export function buildPhysicalProfileSummary(input: {
  heightInches?: number | null;
  weightLb?: number | null;
  bodyType?: string | null;
}) {
  const parts = [
    formatHeightInches(input.heightInches),
    formatWeightLb(input.weightLb),
    getBodyTypeLabel(input.bodyType),
  ].filter((value): value is string => Boolean(value));

  return parts.length > 0 ? parts.join(" / ") : null;
}

export function buildPhysicalSearchTerms(input: {
  heightInches?: number | null;
  weightLb?: number | null;
  bodyType?: string | null;
}) {
  const bodyType = normalizeBodyTypeValue(input.bodyType);
  const bodyTypeLabel = getBodyTypeLabel(bodyType);
  const height = formatHeightInches(input.heightInches);
  const weight = formatWeightLb(input.weightLb);

  return [
    bodyType,
    bodyTypeLabel,
    ...(bodyType ? BODY_TYPE_MATCH_TERMS[bodyType] : []),
    height,
    weight,
    typeof input.heightInches === "number" ? `${input.heightInches} in` : null,
    typeof input.weightLb === "number" ? `${Math.round(input.weightLb)} lb` : null,
  ].filter((value): value is string => Boolean(value));
}
