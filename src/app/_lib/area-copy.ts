import type { PublicTherapist } from "@/app/_lib/directory";

export type AreaCopyInput = {
  area: string;
  city: string;
  nearbyAreas: string[];
  serviceModes: string[];
  specialties: string[];
  activeProfiles: number;
  avgStartingPrice?: number | null;
  avgYearsExperience?: number | null;
};

function serviceModeSentence(input: AreaCopyInput) {
  if (!input.serviceModes.length) return "";
  return ` Current listed service formats include ${input.serviceModes.join(", ")}.`;
}

export function buildAreaIntro(input: AreaCopyInput): string {
  const specialties = input.specialties.slice(0, 4).join(", ");
  const nearby = input.nearbyAreas.slice(0, 3).join(", ");
  const nearbyLine = nearby ? ` and nearby areas such as ${nearby}` : "";
  const priceLine = input.avgStartingPrice
    ? ` Starting rates among currently matched profiles average around $${input.avgStartingPrice}.`
    : "";
  const profileLine = input.activeProfiles >= 2
    ? ` There are ${input.activeProfiles} active profiles currently matched to this area.`
    : input.activeProfiles === 1
      ? " There is 1 active profile currently matched to this area."
      : " No approved public profiles are currently matched to this area.";

  return (
    `Browse male massage provider coverage for ${input.area} in ${input.city}. ` +
    `MasseurMatch surfaces public profiles that list ${input.area}${nearbyLine} in their service coverage.` +
    serviceModeSentence(input) +
    (specialties ? ` Common specialties among currently matched profiles include ${specialties}.` : "") +
    ` Compare provider supplied profile details, availability, rates, and direct contact options before reaching out.` +
    priceLine +
    profileLine
  );
}

export function buildSuburbIntro(input: AreaCopyInput): string {
  const specialties = input.specialties.slice(0, 3).join(", ");
  const nearby = input.nearbyAreas.slice(0, 3).join(", ");
  const nearbyLine = nearby ? ` Nearby areas include ${nearby}.` : "";
  const priceLine = input.avgStartingPrice
    ? ` Starting rates among currently matched profiles average around $${input.avgStartingPrice}.`
    : "";
  const profileLine = input.activeProfiles >= 2
    ? ` ${input.activeProfiles} active profiles are currently matched to ${input.area}.`
    : input.activeProfiles === 1
      ? ` 1 active profile is currently matched to ${input.area}.`
      : ` No approved public profiles are currently matched to ${input.area}.`;

  return (
    `Browse public massage provider coverage for ${input.area}.` +
    nearbyLine +
    serviceModeSentence(input) +
    (specialties ? ` Common specialties among currently matched profiles include ${specialties}.` : "") +
    ` MasseurMatch is a directory, so visitors should review each independent provider's profile and confirm service details directly.` +
    priceLine +
    profileLine
  );
}

export function buildAreaFaq(
  input: AreaCopyInput,
): Array<{ question: string; answer: string }> {
  const nearbyText =
    input.nearbyAreas.slice(0, 2).join(" and ") ||
    `surrounding neighborhoods in ${input.city}`;

  return [
    {
      question: `How many therapists serve ${input.area}?`,
      answer:
        input.activeProfiles >= 2
          ? `There are currently ${input.activeProfiles} public profiles matched to ${input.area}. Use nearby pages for ${nearbyText} to expand your options if needed.`
          : input.activeProfiles === 1
            ? `There is currently 1 public profile matched to ${input.area}. Use nearby pages for ${nearbyText} to expand your options if needed.`
            : `No approved public profiles are currently matched to ${input.area}. Browse nearby areas such as ${nearbyText} or check back as new providers are approved.`,
    },
    {
      question: `What session types are available in ${input.area}, ${input.city}?`,
      answer:
        input.serviceModes.length
          ? `Currently matched profiles list ${input.serviceModes.join(", ")}. Contact providers directly to confirm format, location, and availability.`
          : `No session format is claimed for this area until a matching public provider lists one. Check individual public profiles and confirm all service details directly with the provider.`,
    },
    {
      question: `What is a typical starting price for massage in ${input.area}?`,
      answer: input.avgStartingPrice
        ? `Starting rates among currently matched profiles average around $${input.avgStartingPrice}. Pricing varies by provider, session length, and format, so confirm the current rate directly.`
        : `MasseurMatch does not publish an area average without matching provider pricing data. Check individual public profiles for current provider supplied rates.`,
    },
    {
      question: `How do I reach providers in ${input.area}?`,
      answer:
        `Profiles include direct contact options where the provider has chosen to publish them. MasseurMatch is a discovery directory and does not process massage session bookings or payments. Confirm all session details directly with the independent provider.`,
    },
  ];
}

export const AREA_NEARBY_MAP: Record<string, string[]> = {
  "oak-lawn": ["Uptown", "Turtle Creek", "Medical District"],
  uptown: ["Oak Lawn", "Design District", "Turtle Creek"],
  "deep-ellum": ["Downtown", "Uptown", "Design District"],
  "turtle-creek": ["Oak Lawn", "Highland Park", "Uptown"],
  "medical-district": ["Uptown", "Love Field", "Downtown"],
  "highland-park": ["University Park", "Oak Lawn", "Uptown"],
  "university-park": ["Highland Park", "Uptown", "Turtle Creek"],
  downtown: ["Uptown", "Design District", "Medical District"],
  "design-district": ["Uptown", "Downtown", "Oak Lawn"],
  "love-field": ["Medical District", "Uptown", "DFW Airport"],
  "dfw-airport": ["Love Field", "Irving", "Uptown"],
  plano: ["Richardson", "Dallas", "Frisco"],
  irving: ["Dallas", "Highland Park", "Grand Prairie"],
  richardson: ["Plano", "Dallas", "Garland"],
  "fort-worth": ["Arlington", "Grand Prairie", "Dallas"],
  frisco: ["Plano", "Dallas", "McKinney"],
  addison: ["Dallas", "Carrollton", "Farmers Branch"],
  carrollton: ["Addison", "Dallas", "Grand Prairie"],
  arlington: ["Fort Worth", "Grand Prairie", "Irving"],
  "grand-prairie": ["Arlington", "Irving", "Dallas"],
  montrose: ["Downtown Houston", "Midtown", "Museum District"],
  "the-heights": ["Montrose", "Midtown", "Downtown Houston"],
  midtown: ["Downtown Houston", "Montrose", "Museum District"],
  "downtown-houston": ["Montrose", "Midtown", "EaDo"],
  "south-congress": ["Downtown Austin", "Zilker", "East Austin"],
  "east-austin": ["South Congress", "Downtown Austin", "Zilker"],
  "king-william": ["Downtown San Antonio", "Southtown", "Alamo Heights"],
  "river-north": ["Streeterville", "Gold Coast", "West Loop"],
  brickell: ["Downtown Miami", "Edgewater", "Miami Beach"],
};

function deriveServiceModes(
  therapists: Pick<PublicTherapist, "incall_price" | "outcall_price" | "modality">[],
): string[] {
  const modes: string[] = [];
  if (therapists.some((t) => t.incall_price != null)) modes.push("incall");
  if (therapists.some((t) => t.outcall_price != null)) modes.push("outcall");
  if (therapists.some((t) => t.modality?.toLowerCase().includes("hotel"))) modes.push("hotel sessions");
  if (therapists.some((t) => t.modality?.toLowerCase().includes("mobile"))) modes.push("mobile");
  return modes;
}

function deriveSpecialties(
  therapists: Pick<PublicTherapist, "specialties" | "modality">[],
): string[] {
  const counts: Record<string, number> = {};
  for (const t of therapists) {
    for (const s of t.specialties ?? []) counts[s] = (counts[s] ?? 0) + 1;
    if (t.modality) counts[t.modality] = (counts[t.modality] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k)
    .slice(0, 6);
}

function deriveAvgStartingPrice(
  therapists: Pick<PublicTherapist, "incall_price" | "outcall_price">[],
): number | null {
  const prices = therapists
    .flatMap((t) => [t.incall_price, t.outcall_price])
    .filter((p): p is number => p != null);
  if (!prices.length) return null;
  return Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
}

function deriveAvgYearsExperience(
  therapists: Pick<PublicTherapist, "years_experience" | "start_year">[],
): number | null {
  const currentYear = new Date().getFullYear();
  const values = therapists
    .map((t) =>
      t.years_experience != null
        ? t.years_experience
        : t.start_year != null
          ? currentYear - t.start_year
          : null,
    )
    .filter((v): v is number => v != null && v >= 0);
  if (!values.length) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export function buildAreaCopyInput(params: {
  area: string;
  city: string;
  therapists: Pick<
    PublicTherapist,
    "incall_price" | "outcall_price" | "modality" | "specialties" | "years_experience" | "start_year"
  >[];
}): AreaCopyInput {
  return {
    area: params.area,
    city: params.city,
    nearbyAreas: AREA_NEARBY_MAP[params.area.toLowerCase().replace(/ /g, "-")] ?? [],
    serviceModes: deriveServiceModes(params.therapists),
    specialties: deriveSpecialties(params.therapists),
    activeProfiles: params.therapists.length,
    avgStartingPrice: deriveAvgStartingPrice(params.therapists),
    avgYearsExperience: deriveAvgYearsExperience(params.therapists),
  };
}
