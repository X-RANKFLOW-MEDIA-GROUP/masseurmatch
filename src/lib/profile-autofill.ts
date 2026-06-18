export type ZipAreaMatch = {
  zip: string;
  city: string;
  state: string;
  primaryNeighborhood: string;
  neighborhoods: string[];
  serviceAreaCities: string[];
  landmarks: string[];
};

export const ZIP_AREA_LOOKUP: ZipAreaMatch[] = [
  {
    zip: "10001",
    city: "New York",
    state: "NY",
    primaryNeighborhood: "Chelsea",
    neighborhoods: ["Chelsea", "Hudson Yards", "Flatiron District"],
    serviceAreaCities: ["New York", "Brooklyn", "Queens", "Jersey City", "Hoboken"],
    landmarks: ["Hudson Yards", "Madison Square Garden", "Flatiron District"],
  },
  {
    zip: "10011",
    city: "New York",
    state: "NY",
    primaryNeighborhood: "West Village",
    neighborhoods: ["West Village", "Chelsea", "Greenwich Village"],
    serviceAreaCities: ["New York", "Brooklyn", "Queens", "Jersey City", "Hoboken"],
    landmarks: ["West Village", "Meatpacking District", "Union Square"],
  },
  {
    zip: "90046",
    city: "Los Angeles",
    state: "CA",
    primaryNeighborhood: "West Hollywood",
    neighborhoods: ["West Hollywood", "Hollywood Hills", "Melrose"],
    serviceAreaCities: ["Los Angeles", "West Hollywood", "Beverly Hills", "Santa Monica", "Glendale"],
    landmarks: ["Sunset Strip", "Melrose Avenue", "Hollywood Hills"],
  },
  {
    zip: "90069",
    city: "West Hollywood",
    state: "CA",
    primaryNeighborhood: "Sunset Plaza",
    neighborhoods: ["Sunset Plaza", "West Hollywood", "Hollywood Hills West"],
    serviceAreaCities: ["West Hollywood", "Los Angeles", "Beverly Hills", "Santa Monica", "Studio City"],
    landmarks: ["Sunset Plaza", "Santa Monica Boulevard", "Melrose Avenue"],
  },
  {
    zip: "94102",
    city: "San Francisco",
    state: "CA",
    primaryNeighborhood: "Hayes Valley",
    neighborhoods: ["Hayes Valley", "Civic Center", "SoMa"],
    serviceAreaCities: ["San Francisco", "Oakland", "Daly City", "Berkeley", "Sausalito"],
    landmarks: ["Hayes Valley", "Civic Center", "Union Square"],
  },
  {
    zip: "60611",
    city: "Chicago",
    state: "IL",
    primaryNeighborhood: "Streeterville",
    neighborhoods: ["Streeterville", "River North", "Gold Coast"],
    serviceAreaCities: ["Chicago", "Evanston", "Oak Park", "Skokie", "Cicero"],
    landmarks: ["Magnificent Mile", "Navy Pier", "River North"],
  },
  {
    zip: "33139",
    city: "Miami Beach",
    state: "FL",
    primaryNeighborhood: "South Beach",
    neighborhoods: ["South Beach", "Flamingo Lummus", "West Avenue"],
    serviceAreaCities: ["Miami Beach", "Miami", "Brickell", "Coral Gables", "Aventura"],
    landmarks: ["Ocean Drive", "Lincoln Road", "South Pointe"],
  },
  {
    zip: "33131",
    city: "Miami",
    state: "FL",
    primaryNeighborhood: "Brickell",
    neighborhoods: ["Brickell", "Downtown Miami", "Edgewater"],
    serviceAreaCities: ["Miami", "Miami Beach", "Coral Gables", "Coconut Grove", "Aventura"],
    landmarks: ["Brickell City Centre", "Downtown Miami", "Bayfront Park"],
  },
  {
    zip: "30309",
    city: "Atlanta",
    state: "GA",
    primaryNeighborhood: "Midtown",
    neighborhoods: ["Midtown", "Ansley Park", "Atlantic Station"],
    serviceAreaCities: ["Atlanta", "Decatur", "Sandy Springs", "Brookhaven", "Marietta"],
    landmarks: ["Piedmont Park", "High Museum", "Atlantic Station"],
  },
  {
    zip: "77006",
    city: "Houston",
    state: "TX",
    primaryNeighborhood: "Montrose",
    neighborhoods: ["Montrose", "Midtown", "Museum District"],
    serviceAreaCities: ["Houston", "Bellaire", "West University Place", "The Heights", "River Oaks"],
    landmarks: ["Montrose", "Museum District", "Buffalo Bayou"],
  },
  {
    zip: "89109",
    city: "Las Vegas",
    state: "NV",
    primaryNeighborhood: "The Strip",
    neighborhoods: ["The Strip", "Paradise", "Winchester"],
    serviceAreaCities: ["Las Vegas", "Henderson", "Paradise", "North Las Vegas", "Summerlin"],
    landmarks: ["The Strip", "Convention Center", "Sahara Avenue"],
  },
  {
    zip: "98101",
    city: "Seattle",
    state: "WA",
    primaryNeighborhood: "Downtown Seattle",
    neighborhoods: ["Downtown Seattle", "Belltown", "Pike Place"],
    serviceAreaCities: ["Seattle", "Bellevue", "Kirkland", "Redmond", "Mercer Island"],
    landmarks: ["Pike Place Market", "Belltown", "South Lake Union"],
  },
  {
    zip: "80202",
    city: "Denver",
    state: "CO",
    primaryNeighborhood: "LoDo",
    neighborhoods: ["LoDo", "Union Station", "Downtown Denver"],
    serviceAreaCities: ["Denver", "Aurora", "Lakewood", "Englewood", "Boulder"],
    landmarks: ["Union Station", "LoDo", "Ball Arena"],
  },
  {
    zip: "85004",
    city: "Phoenix",
    state: "AZ",
    primaryNeighborhood: "Downtown Phoenix",
    neighborhoods: ["Downtown Phoenix", "Roosevelt Row", "Central City"],
    serviceAreaCities: ["Phoenix", "Scottsdale", "Tempe", "Glendale", "Mesa"],
    landmarks: ["Roosevelt Row", "Footprint Center", "Downtown Phoenix"],
  },
  {
    zip: "20005",
    city: "Washington",
    state: "DC",
    primaryNeighborhood: "Logan Circle",
    neighborhoods: ["Logan Circle", "Downtown", "Dupont Circle"],
    serviceAreaCities: ["Washington", "Arlington", "Alexandria", "Bethesda", "Silver Spring"],
    landmarks: ["Logan Circle", "14th Street", "Downtown DC"],
  },
  {
    zip: "32801",
    city: "Orlando",
    state: "FL",
    primaryNeighborhood: "Downtown Orlando",
    neighborhoods: ["Downtown Orlando", "Thornton Park", "Lake Eola"],
    serviceAreaCities: ["Orlando", "Winter Park", "Maitland", "Kissimmee", "Altamonte Springs"],
    landmarks: ["Lake Eola", "Thornton Park", "Creative Village"],
  },
  {
    zip: "75219",
    city: "Dallas",
    state: "TX",
    primaryNeighborhood: "Oak Lawn",
    neighborhoods: ["Oak Lawn", "Uptown", "Turtle Creek"],
    serviceAreaCities: ["Dallas", "Highland Park", "University Park", "Irving", "Plano"],
    landmarks: ["Oak Lawn", "Turtle Creek", "Katy Trail"],
  },
];

const ZIP_PREFIX_FALLBACKS: Record<string, ZipAreaMatch> = {
  "100": ZIP_AREA_LOOKUP[0],
  "900": ZIP_AREA_LOOKUP[2],
  "941": ZIP_AREA_LOOKUP[4],
  "606": ZIP_AREA_LOOKUP[5],
  "331": ZIP_AREA_LOOKUP[6],
  "303": ZIP_AREA_LOOKUP[8],
  "770": ZIP_AREA_LOOKUP[9],
  "891": ZIP_AREA_LOOKUP[10],
  "981": ZIP_AREA_LOOKUP[11],
  "802": ZIP_AREA_LOOKUP[12],
  "850": ZIP_AREA_LOOKUP[13],
  "200": ZIP_AREA_LOOKUP[14],
  "328": ZIP_AREA_LOOKUP[15],
  "752": ZIP_AREA_LOOKUP[16],
};

export const PROFILE_RULES = [
  "Keep the profile professional, client safe, and focused on massage services.",
  "Describe technique, experience, pressure style, location, and availability clearly.",
  "Do not include adult content, misleading services, discriminatory language, or medical claims.",
  "Do not write fake guarantees, fake credentials, fake reviews, or misleading location information.",
  "Contact details are allowed only in the fields created for phone, email, WhatsApp, and website.",
];

export const PHOTO_RULES = [
  "Use clear, recent, high quality photos with good lighting.",
  "Do not upload adult content, unsafe content, screenshots, heavy filters, memes, or text overlays.",
  "Avoid low resolution images, watermarks, bad crops, cluttered backgrounds, or client information.",
  "Your main photo should make the profile feel trustworthy, clean, and premium.",
];

export const SERVICE_OPTIONS = [
  "Deep Tissue",
  "Swedish",
  "Sports Massage",
  "Trigger Point",
  "Myofascial Release",
  "Reflexology",
  "Lymphatic Drainage",
  "Thai Massage",
  "Hot Stone",
  "Aromatherapy",
  "Prenatal",
  "Relaxation Massage",
];

export const BODY_TYPE_OPTIONS = [
  { value: "slim", label: "Slim" },
  { value: "athletic", label: "Athletic" },
  { value: "average", label: "Average" },
  { value: "muscular", label: "Muscular" },
  { value: "stocky", label: "Stocky" },
  { value: "large", label: "Large build" },
];

export function lookupZipArea(rawZip: string) {
  const normalized = rawZip.replace(/\D/g, "").slice(0, 5);

  if (normalized.length < 3) {
    return null;
  }

  return (
    ZIP_AREA_LOOKUP.find((item) => item.zip === normalized) ||
    ZIP_PREFIX_FALLBACKS[normalized.slice(0, 3)] ||
    null
  );
}

export type ZipLookupResult = {
  city: string;
  state: string;
  stateAbbr: string;
};

/** Fetch city/state for any US ZIP from the free zippopotam.us API (no key needed). */
export async function fetchZipByCode(zip: string): Promise<ZipLookupResult | null> {
  const cleaned = zip.replace(/\D/g, "").slice(0, 5);
  if (cleaned.length < 5) return null;

  // Check local cache first
  const cached = lookupZipArea(cleaned);
  if (cached) {
    return { city: cached.city, state: cached.state, stateAbbr: cached.state };
  }

  try {
    const res = await fetch(`https://api.zippopotam.us/us/${cleaned}`, { cache: "force-cache" });
    if (!res.ok) return null;
    const data = await res.json() as { places?: Array<{ "place name": string; "state abbreviation": string; state: string }> };
    const place = data.places?.[0];
    if (!place) return null;
    return {
      city: place["place name"],
      state: place["state"],
      stateAbbr: place["state abbreviation"],
    };
  } catch {
    return null;
  }
}

export function formatHeightLabel(totalInches: number) {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  const centimeters = Math.round(totalInches * 2.54);
  return `${feet}'${inches}" / ${centimeters} cm`;
}

export function createHeightOptions() {
  return Array.from({ length: 37 }, (_, index) => {
    const value = 54 + index;
    return { value: String(value), label: formatHeightLabel(value) };
  });
}

export function poundsToKilogramsLabel(value: string) {
  const pounds = Number(value);

  if (!Number.isFinite(pounds) || pounds <= 0) {
    return "";
  }

  return `${Math.round(pounds * 0.453592)} kg`;
}

export function createHeadlineOptions(input: {
  city?: string | null;
  neighborhood?: string | null;
  specialties?: string[] | null;
}) {
  const city = input.city?.trim() || "your city";
  const neighborhood = input.neighborhood?.trim() || city;
  const primaryService = input.specialties?.find(Boolean) || "professional massage";

  return [
    `${primaryService} specialist in ${city}`,
    `Professional massage therapist serving ${neighborhood}`,
    `Personalized ${primaryService.toLowerCase()} for stress relief in ${city}`,
    `Experienced massage therapist for relaxation and bodywork in ${city}`,
    `Premium massage sessions near ${neighborhood}`,
    `Client focused massage care with strong hands and professional technique`,
    `Sports recovery and deep tissue massage in ${city}`,
    `Calm, professional massage experience near ${neighborhood}`,
  ];
}

export function buildSeoDescription(input: {
  displayName?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  specialties?: string[] | null;
}) {
  const name = input.displayName?.trim() || "Massage therapist";
  const city = input.city?.trim() || "your area";
  const area = input.neighborhood?.trim() || city;
  const services = input.specialties?.length ? input.specialties.slice(0, 3).join(", ") : "professional massage";

  return `${name} offers ${services} in ${area}. View profile details, availability, contact options, pricing, and service areas on MasseurMatch.`;
}

export function createSeoKeywords(input: {
  city?: string | null;
  neighborhood?: string | null;
  specialties?: string[] | null;
}) {
  const city = input.city?.trim();
  const neighborhood = input.neighborhood?.trim();
  const services = input.specialties?.filter(Boolean) || [];
  const localKeywords = [city && `massage therapist ${city}`, neighborhood && `massage near ${neighborhood}`, city && `professional massage ${city}`].filter(Boolean) as string[];

  return Array.from(new Set([...services, ...localKeywords, "deep tissue massage", "sports massage", "relaxation massage"])).slice(0, 12);
}

export function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "massage-therapist";
}

export function getCompletionScore(values: Array<string | number | boolean | string[] | null | undefined>) {
  const completed = values.filter((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return Number.isFinite(value) && value > 0;
    return Boolean(String(value ?? "").trim());
  }).length;

  return Math.round((completed / Math.max(values.length, 1)) * 100);
}
