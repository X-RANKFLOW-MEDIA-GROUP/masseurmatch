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
  { name: "Atlanta", slug: "atlanta", stateCode: "GA", stateName: "Georgia", countryCode: "US" },
  { name: "Austin", slug: "austin", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Brooklyn", slug: "brooklyn", stateCode: "NY", stateName: "New York", countryCode: "US" },
  { name: "Chicago", slug: "chicago", stateCode: "IL", stateName: "Illinois", countryCode: "US" },
  { name: "Dallas", slug: "dallas", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Denver", slug: "denver", stateCode: "CO", stateName: "Colorado", countryCode: "US" },
  { name: "Fort Lauderdale", slug: "fort-lauderdale", stateCode: "FL", stateName: "Florida", countryCode: "US" },
  { name: "Houston", slug: "houston", stateCode: "TX", stateName: "Texas", countryCode: "US" },
  { name: "Las Vegas", slug: "las-vegas", stateCode: "NV", stateName: "Nevada", countryCode: "US" },
  { name: "Los Angeles", slug: "los-angeles", stateCode: "CA", stateName: "California", countryCode: "US" },
  { name: "Miami", slug: "miami", stateCode: "FL", stateName: "Florida", countryCode: "US" },
  { name: "Minneapolis", slug: "minneapolis", stateCode: "MN", stateName: "Minnesota", countryCode: "US" },
  { name: "New York", slug: "new-york", stateCode: "NY", stateName: "New York", countryCode: "US" },
  { name: "Orlando", slug: "orlando", stateCode: "FL", stateName: "Florida", countryCode: "US" },
  { name: "Palm Springs", slug: "palm-springs", stateCode: "CA", stateName: "California", countryCode: "US" },
  { name: "Phoenix", slug: "phoenix", stateCode: "AZ", stateName: "Arizona", countryCode: "US" },
  { name: "Portland", slug: "portland", stateCode: "OR", stateName: "Oregon", countryCode: "US" },
  { name: "San Diego", slug: "san-diego", stateCode: "CA", stateName: "California", countryCode: "US" },
  { name: "San Francisco", slug: "san-francisco", stateCode: "CA", stateName: "California", countryCode: "US" },
  { name: "Seattle", slug: "seattle", stateCode: "WA", stateName: "Washington", countryCode: "US" },
  { name: "Washington DC", slug: "washington-dc", stateCode: "DC", stateName: "District of Columbia", countryCode: "US" },
  { name: "West Hollywood", slug: "west-hollywood", stateCode: "CA", stateName: "California", countryCode: "US" },
  { name: "Wilton Manors", slug: "wilton-manors", stateCode: "FL", stateName: "Florida", countryCode: "US" },
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
