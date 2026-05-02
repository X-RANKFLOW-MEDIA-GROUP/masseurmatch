export type CityData = {
  name: string;
  slug: string;
  state: string;
  stateCode: string;
  stateName: string;
  countryCode: "US";
  intro?: string;
};

const RAW_CITIES: Array<Omit<CityData, "state" | "intro">> = [
  // ── Texas (DFW + major metros) ──────────────────────────────────────────
  { name: "Addison", slug: "addison", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Arlington", slug: "arlington", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Austin", slug: "austin", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Carrollton", slug: "carrollton", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Dallas", slug: "dallas", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Farmers Branch", slug: "farmers-branch", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Fort Worth", slug: "fort-worth", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Frisco", slug: "frisco", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Grand Prairie", slug: "grand-prairie", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Highland Park", slug: "highland-park", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Houston", slug: "houston", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Irving", slug: "irving", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Plano", slug: "plano", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Richardson", slug: "richardson", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "San Antonio", slug: "san-antonio", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "El Paso", slug: "el-paso", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  // ── California ──────────────────────────────────────────────────────────
  { name: "Los Angeles", slug: "los-angeles", stateCode: "CA", stateName: "California", countryCode: "US" },
  { name: "San Diego", slug: "san-diego", stateCode: "CA", stateName: "California", countryCode: "US" },
  { name: "San Francisco", slug: "san-francisco", stateCode: "CA", stateName: "California", countryCode: "US" },
  { name: "Palm Springs", slug: "palm-springs", stateCode: "CA", stateName: "California", countryCode: "US" },
  { name: "West Hollywood", slug: "west-hollywood", stateCode: "CA", stateName: "California", countryCode: "US" },
  { name: "San Jose", slug: "san-jose", stateCode: "CA", stateName: "California", countryCode: "US" },
  { name: "Sacramento", slug: "sacramento", stateCode: "CA", stateName: "California", countryCode: "US" },
  { name: "Long Beach", slug: "long-beach", stateCode: "CA", stateName: "California", countryCode: "US" },
  { name: "Oakland", slug: "oakland", stateCode: "CA", stateName: "California", countryCode: "US" },
  { name: "Santa Monica", slug: "santa-monica", stateCode: "CA", stateName: "California", countryCode: "US" },
  // ── Florida ─────────────────────────────────────────────────────────────
  { name: "Miami", slug: "miami", stateCode: "FL", stateName: "Florida", countryCode: "US" },
  { name: "Fort Lauderdale", slug: "fort-lauderdale", stateCode: "FL", stateName: "Florida", countryCode: "US" },
  { name: "Wilton Manors", slug: "wilton-manors", stateCode: "FL", stateName: "Florida", countryCode: "US" },
  { name: "Orlando", slug: "orlando", stateCode: "FL", stateName: "Florida", countryCode: "US" },
  { name: "Tampa", slug: "tampa", stateCode: "FL", stateName: "Florida", countryCode: "US" },
  { name: "St. Petersburg", slug: "st-petersburg", stateCode: "FL", stateName: "Florida", countryCode: "US" },
  { name: "Jacksonville", slug: "jacksonville", stateCode: "FL", stateName: "Florida", countryCode: "US" },
  { name: "Miami Beach", slug: "miami-beach", stateCode: "FL", stateName: "Florida", countryCode: "US" },
  // ── New York ────────────────────────────────────────────────────────────
  { name: "New York", slug: "new-york", stateCode: "NY", stateName: "New York", countryCode: "US" },
  { name: "Brooklyn", slug: "brooklyn", stateCode: "NY", stateName: "New York", countryCode: "US" },
  { name: "Manhattan", slug: "manhattan", stateCode: "NY", stateName: "New York", countryCode: "US" },
  { name: "Queens", slug: "queens", stateCode: "NY", stateName: "New York", countryCode: "US" },
  // ── Illinois ────────────────────────────────────────────────────────────
  { name: "Chicago", slug: "chicago", stateCode: "IL", stateName: "Illinois", countryCode: "US" },
  // ── Georgia ─────────────────────────────────────────────────────────────
  { name: "Atlanta", slug: "atlanta", stateCode: "GA", stateName: "Georgia", countryCode: "US" },
  { name: "Savannah", slug: "savannah", stateCode: "GA", stateName: "Georgia", countryCode: "US" },
  // ── Washington ──────────────────────────────────────────────────────────
  { name: "Seattle", slug: "seattle", stateCode: "WA", stateName: "Washington", countryCode: "US" },
  // ── Colorado ────────────────────────────────────────────────────────────
  { name: "Denver", slug: "denver", stateCode: "CO", stateName: "Colorado", countryCode: "US" },
  { name: "Colorado Springs", slug: "colorado-springs", stateCode: "CO", stateName: "Colorado", countryCode: "US" },
  // ── Arizona ─────────────────────────────────────────────────────────────
  { name: "Phoenix", slug: "phoenix", stateCode: "AZ", stateName: "Arizona", countryCode: "US" },
  { name: "Scottsdale", slug: "scottsdale", stateCode: "AZ", stateName: "Arizona", countryCode: "US" },
  { name: "Tucson", slug: "tucson", stateCode: "AZ", stateName: "Arizona", countryCode: "US" },
  // ── Nevada ──────────────────────────────────────────────────────────────
  { name: "Las Vegas", slug: "las-vegas", stateCode: "NV", stateName: "Nevada", countryCode: "US" },
  // ── Oregon ──────────────────────────────────────────────────────────────
  { name: "Portland", slug: "portland", stateCode: "OR", stateName: "Oregon", countryCode: "US" },
  // ── Minnesota ───────────────────────────────────────────────────────────
  { name: "Minneapolis", slug: "minneapolis", stateCode: "MN", stateName: "Minnesota", countryCode: "US" },
  { name: "St. Paul", slug: "st-paul", stateCode: "MN", stateName: "Minnesota", countryCode: "US" },
  // ── DC ──────────────────────────────────────────────────────────────────
  { name: "Washington DC", slug: "washington-dc", stateCode: "DC", stateName: "District of Columbia", countryCode: "US" },
  // ── Massachusetts ───────────────────────────────────────────────────────
  { name: "Boston", slug: "boston", stateCode: "MA", stateName: "Massachusetts", countryCode: "US" },
  { name: "Provincetown", slug: "provincetown", stateCode: "MA", stateName: "Massachusetts", countryCode: "US" },
  { name: "Cambridge", slug: "cambridge", stateCode: "MA", stateName: "Massachusetts", countryCode: "US" },
  // ── Pennsylvania ────────────────────────────────────────────────────────
  { name: "Philadelphia", slug: "philadelphia", stateCode: "PA", stateName: "Pennsylvania", countryCode: "US" },
  { name: "Pittsburgh", slug: "pittsburgh", stateCode: "PA", stateName: "Pennsylvania", countryCode: "US" },
  // ── Ohio ────────────────────────────────────────────────────────────────
  { name: "Columbus", slug: "columbus", stateCode: "OH", stateName: "Ohio", countryCode: "US" },
  { name: "Cleveland", slug: "cleveland", stateCode: "OH", stateName: "Ohio", countryCode: "US" },
  { name: "Cincinnati", slug: "cincinnati", stateCode: "OH", stateName: "Ohio", countryCode: "US" },
  // ── Michigan ────────────────────────────────────────────────────────────
  { name: "Detroit", slug: "detroit", stateCode: "MI", stateName: "Michigan", countryCode: "US" },
  // ── Tennessee ───────────────────────────────────────────────────────────
  { name: "Nashville", slug: "nashville", stateCode: "TN", stateName: "Tennessee", countryCode: "US" },
  { name: "Memphis", slug: "memphis", stateCode: "TN", stateName: "Tennessee", countryCode: "US" },
  // ── North Carolina ──────────────────────────────────────────────────────
  { name: "Charlotte", slug: "charlotte", stateCode: "NC", stateName: "North Carolina", countryCode: "US" },
  { name: "Raleigh", slug: "raleigh", stateCode: "NC", stateName: "North Carolina", countryCode: "US" },
  { name: "Asheville", slug: "asheville", stateCode: "NC", stateName: "North Carolina", countryCode: "US" },
  // ── South Carolina ──────────────────────────────────────────────────────
  { name: "Charleston", slug: "charleston", stateCode: "SC", stateName: "South Carolina", countryCode: "US" },
  // ── Missouri ────────────────────────────────────────────────────────────
  { name: "Kansas City", slug: "kansas-city", stateCode: "MO", stateName: "Missouri", countryCode: "US" },
  { name: "St. Louis", slug: "st-louis", stateCode: "MO", stateName: "Missouri", countryCode: "US" },
  // ── Indiana ─────────────────────────────────────────────────────────────
  { name: "Indianapolis", slug: "indianapolis", stateCode: "IN", stateName: "Indiana", countryCode: "US" },
  // ── Wisconsin ───────────────────────────────────────────────────────────
  { name: "Milwaukee", slug: "milwaukee", stateCode: "WI", stateName: "Wisconsin", countryCode: "US" },
  { name: "Madison", slug: "madison", stateCode: "WI", stateName: "Wisconsin", countryCode: "US" },
  // ── Maryland ────────────────────────────────────────────────────────────
  { name: "Baltimore", slug: "baltimore", stateCode: "MD", stateName: "Maryland", countryCode: "US" },
  // ── Virginia ────────────────────────────────────────────────────────────
  { name: "Richmond", slug: "richmond", stateCode: "VA", stateName: "Virginia", countryCode: "US" },
  { name: "Virginia Beach", slug: "virginia-beach", stateCode: "VA", stateName: "Virginia", countryCode: "US" },
  // ── Louisiana ───────────────────────────────────────────────────────────
  { name: "New Orleans", slug: "new-orleans", stateCode: "LA", stateName: "Louisiana", countryCode: "US" },
  // ── Kentucky ────────────────────────────────────────────────────────────
  { name: "Louisville", slug: "louisville", stateCode: "KY", stateName: "Kentucky", countryCode: "US" },
  // ── Oklahoma ────────────────────────────────────────────────────────────
  { name: "Oklahoma City", slug: "oklahoma-city", stateCode: "OK", stateName: "Oklahoma", countryCode: "US" },
  // ── Connecticut ─────────────────────────────────────────────────────────
  { name: "Hartford", slug: "hartford", stateCode: "CT", stateName: "Connecticut", countryCode: "US" },
  { name: "New Haven", slug: "new-haven", stateCode: "CT", stateName: "Connecticut", countryCode: "US" },
  // ── New Jersey ──────────────────────────────────────────────────────────
  { name: "Jersey City", slug: "jersey-city", stateCode: "NJ", stateName: "New Jersey", countryCode: "US" },
  { name: "Newark", slug: "newark", stateCode: "NJ", stateName: "New Jersey", countryCode: "US" },
  { name: "Asbury Park", slug: "asbury-park", stateCode: "NJ", stateName: "New Jersey", countryCode: "US" },
  // ── New Mexico ──────────────────────────────────────────────────────────
  { name: "Albuquerque", slug: "albuquerque", stateCode: "NM", stateName: "New Mexico", countryCode: "US" },
  { name: "Santa Fe", slug: "santa-fe", stateCode: "NM", stateName: "New Mexico", countryCode: "US" },
  // ── Utah ────────────────────────────────────────────────────────────────
  { name: "Salt Lake City", slug: "salt-lake-city", stateCode: "UT", stateName: "Utah", countryCode: "US" },
  // ── Hawaii ──────────────────────────────────────────────────────────────
  { name: "Honolulu", slug: "honolulu", stateCode: "HI", stateName: "Hawaii", countryCode: "US" },
  // ── Alabama ─────────────────────────────────────────────────────────────
  { name: "Birmingham", slug: "birmingham", stateCode: "AL", stateName: "Alabama", countryCode: "US" },
  // ── Nebraska ────────────────────────────────────────────────────────────
  { name: "Omaha", slug: "omaha", stateCode: "NE", stateName: "Nebraska", countryCode: "US" },
  // ── Iowa ────────────────────────────────────────────────────────────────
  { name: "Des Moines", slug: "des-moines", stateCode: "IA", stateName: "Iowa", countryCode: "US" },
  // ── Rhode Island ────────────────────────────────────────────────────────
  { name: "Providence", slug: "providence", stateCode: "RI", stateName: "Rhode Island", countryCode: "US" },
  // ── Idaho ───────────────────────────────────────────────────────────────
  { name: "Boise", slug: "boise", stateCode: "ID", stateName: "Idaho", countryCode: "US" },
  // ── Puerto Rico ─────────────────────────────────────────────────────────
  { name: "San Juan", slug: "san-juan", stateCode: "PR", stateName: "Puerto Rico", countryCode: "US" },
  // ── Alaska ──────────────────────────────────────────────────────────────
  { name: "Anchorage", slug: "anchorage", stateCode: "AK", stateName: "Alaska", countryCode: "US" },
  // ── Key LGBTQ+ destination cities ───────────────────────────────────────
  { name: "Fire Island", slug: "fire-island", stateCode: "NY", stateName: "New York", countryCode: "US" },
  { name: "Key West", slug: "key-west", stateCode: "FL", stateName: "Florida", countryCode: "US" },
  { name: "Rehoboth Beach", slug: "rehoboth-beach", stateCode: "DE", stateName: "Delaware", countryCode: "US" },
  { name: "Saugatuck", slug: "saugatuck", stateCode: "MI", stateName: "Michigan", countryCode: "US" },
  { name: "Guerneville", slug: "guerneville", stateCode: "CA", stateName: "California", countryCode: "US" },
  { name: "Ogunquit", slug: "ogunquit", stateCode: "ME", stateName: "Maine", countryCode: "US" },
  { name: "New Hope", slug: "new-hope", stateCode: "PA", stateName: "Pennsylvania", countryCode: "US" },
  { name: "Cathedral City", slug: "cathedral-city", stateCode: "CA", stateName: "California", countryCode: "US" },
];

export const US_CITIES: CityData[] = RAW_CITIES.map((city) => ({
  ...city,
  state: city.stateName,
  intro: `Browse verified massage therapists in ${city.name}.`,
}));

export function getCityBySlug(slug: string): CityData | undefined {
  const normalized = slug.trim().toLowerCase();
  return US_CITIES.find((city) => city.slug === normalized);
}

export function isValidCitySlug(slug: string): boolean {
  return Boolean(getCityBySlug(slug));
}
