import type { PublicTherapist } from "@/app/_lib/directory";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Intro builder (exact user-spec template) ─────────────────────────────────

export function buildAreaIntro(input: AreaCopyInput): string {
  const modes = input.serviceModes.length ? input.serviceModes.join(", ") : "incall and outcall";
  const specialties = input.specialties.slice(0, 4).join(", ");
  const nearby = input.nearbyAreas.slice(0, 3).join(", ");

  const priceLine =
    input.avgStartingPrice
      ? ` Starting rates in the area average around $${input.avgStartingPrice}.`
      : "";

  const profileLine =
    input.activeProfiles >= 2
      ? ` There are ${input.activeProfiles} active profiles matched to this area.`
      : "";

  return (
    `${input.area} is one of the most searched areas for male massage in ${input.city}. ` +
    `MasseurMatch highlights therapists who serve ${input.area} and nearby areas like ${nearby}, ` +
    `with options that may include ${modes}. ` +
    (specialties
      ? `Common specialties in this part of ${input.city} include ${specialties}. `
      : "") +
    `Profiles shown here are matched to local intent so visitors can quickly compare style, availability, and direct contact options before reaching out.` +
    priceLine +
    profileLine
  );
}

// ─── Suburb intro (for DFW support city pages) ────────────────────────────────

export function buildSuburbIntro(input: AreaCopyInput): string {
  const modes = input.serviceModes.length ? input.serviceModes.join(", ") : "incall and outcall";
  const specialties = input.specialties.slice(0, 3).join(", ");
  const nearby = input.nearbyAreas.slice(0, 3).join(", ");

  const priceLine =
    input.avgStartingPrice
      ? ` Average starting rates are around $${input.avgStartingPrice}.`
      : "";

  const profileLine =
    input.activeProfiles >= 2
      ? ` ${input.activeProfiles} active profiles are currently matched to ${input.area}.`
      : input.activeProfiles === 1
        ? ` 1 active profile is currently listed for ${input.area}.`
        : "";

  return (
    `${input.area} is a growing node in the DFW male massage market within the MasseurMatch Dallas-first strategy. ` +
    `Therapists serving ${input.area} often cover nearby areas including ${nearby}, ` +
    `with session formats that may include ${modes}. ` +
    (specialties ? `Popular specialties in ${input.area} include ${specialties}. ` : "") +
    `This page exists to capture direct local intent and to route ${input.area} searches into a trusted verification-first directory rather than lower-quality generic listings.` +
    priceLine +
    profileLine
  );
}

// ─── FAQ builder ──────────────────────────────────────────────────────────────

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
          ? `There are currently ${input.activeProfiles} profiles matched to ${input.area}. Use the nearby pages for ${nearbyText} to expand your options if needed.`
          : `Inventory for ${input.area} is actively growing. Use nearby pages for ${nearbyText} to find immediate coverage while this area page is being expanded.`,
    },
    {
      question: `What session types are available in ${input.area}, ${input.city}?`,
      answer:
        input.serviceModes.length
          ? `Session options in this area currently include ${input.serviceModes.join(", ")}. Contact providers directly to confirm format, location, and availability.`
          : `Session format details are on individual profile pages. Contact providers directly to confirm incall, outcall, or mobile options.`,
    },
    {
      question: `What is a typical starting price for massage in ${input.area}?`,
      answer: input.avgStartingPrice
        ? `Average starting rates in ${input.area} begin near $${input.avgStartingPrice}. Pricing varies by modality, session length, and format — always confirm directly with the provider.`
        : `Rates vary by provider and session type. Check individual profiles for accurate pricing before contacting any therapist.`,
    },
    {
      question: `How do I reach providers in ${input.area}?`,
      answer:
        `Profiles include direct call, SMS, and WhatsApp links where the provider has shared them. MasseurMatch is a discovery directory — no booking payment is processed on-site. Confirm all session details directly with the therapist before arriving.`,
    },
  ];
}

// ─── Data derivation helpers ──────────────────────────────────────────────────

/** Static nearby-area lookup for neighborhood and suburb support pages. */
export const AREA_NEARBY_MAP: Record<string, string[]> = {
  "oak-lawn": ["Uptown", "Turtle Creek", "Medical District"],
  uptown: ["Oak Lawn", "Design District", "Turtle Creek"],
  "turtle-creek": ["Oak Lawn", "Highland Park", "Uptown"],
  "medical-district": ["Uptown", "Love Field", "Downtown"],
  "highland-park": ["University Park", "Oak Lawn", "Uptown"],
  "university-park": ["Highland Park", "Uptown", "Turtle Creek"],
  downtown: ["Uptown", "Design District", "Medical District"],
  "design-district": ["Uptown", "Downtown", "Oak Lawn"],
  "love-field": ["Medical District", "Uptown", "DFW Airport"],
  "dfw-airport": ["Love Field", "Irving", "Uptown"],
  // DFW suburbs
  plano: ["Richardson", "Dallas", "Frisco"],
  irving: ["Dallas", "Highland Park", "Grand Prairie"],
  richardson: ["Plano", "Dallas", "Garland"],
  "fort-worth": ["Arlington", "Grand Prairie", "Dallas"],
  frisco: ["Plano", "Dallas", "McKinney"],
  addison: ["Dallas", "Carrollton", "Farmers Branch"],
  carrollton: ["Addison", "Dallas", "Grand Prairie"],
  arlington: ["Fort Worth", "Grand Prairie", "Irving"],
  "grand-prairie": ["Arlington", "Irving", "Dallas"],
  // Houston
  montrose: ["Downtown Houston", "Midtown", "Museum District"],
  "downtown-houston": ["Montrose", "Midtown", "EaDo"],
  // Austin
  "south-congress": ["Downtown Austin", "Zilker", "East Austin"],
  // Chicago
  "river-north": ["Streeterville", "Gold Coast", "West Loop"],
  // Miami
  brickell: ["Downtown Miami", "Edgewater", "Miami Beach"],
};

/** Derive available session modes from real therapist data. */
export function deriveServiceModes(
  therapists: Pick<PublicTherapist, "incall_price" | "outcall_price" | "modality">[],
): string[] {
  const modes: string[] = [];
  if (therapists.some((t) => t.incall_price != null)) modes.push("incall");
  if (therapists.some((t) => t.outcall_price != null)) modes.push("outcall");
  if (therapists.some((t) => t.modality?.toLowerCase().includes("hotel")))
    modes.push("hotel sessions");
  if (therapists.some((t) => t.modality?.toLowerCase().includes("mobile")))
    modes.push("mobile");
  return modes.length ? modes : ["incall", "outcall"];
}

/** Derive top specialties by frequency from real therapist data. */
export function deriveSpecialties(
  therapists: Pick<PublicTherapist, "specialties" | "modality">[],
): string[] {
  const counts: Record<string, number> = {};
  for (const t of therapists) {
    for (const s of t.specialties ?? []) {
      counts[s] = (counts[s] ?? 0) + 1;
    }
    if (t.modality) {
      counts[t.modality] = (counts[t.modality] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k)
    .slice(0, 6);
}

/** Compute average starting price across incall and outcall from real data. */
export function deriveAvgStartingPrice(
  therapists: Pick<PublicTherapist, "incall_price" | "outcall_price">[],
): number | null {
  const prices = therapists
    .flatMap((t) => [t.incall_price, t.outcall_price])
    .filter((p): p is number => p != null);
  if (!prices.length) return null;
  return Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
}

/** Compute average years of experience from real data. */
export function deriveAvgYearsExperience(
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

/** Build AreaCopyInput from real therapist data. */
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
