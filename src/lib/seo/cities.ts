export type SeoCity = {
  slug: string;
  name: string;
  stateCode: string;
  stateSlug: string;
  nearby: string[];
  neighborhoods?: string[];
};

export const SEO_CITIES: SeoCity[] = [
  { slug: "new-york-ny", name: "New York", stateCode: "NY", stateSlug: "new-york-ny", nearby: ["jersey-city-nj", "newark-nj"], neighborhoods: ["Chelsea", "Hell's Kitchen", "Upper West Side"] },
  { slug: "los-angeles-ca", name: "Los Angeles", stateCode: "CA", stateSlug: "california-ca", nearby: ["west-hollywood-ca", "long-beach-ca"], neighborhoods: ["West Hollywood", "Downtown LA", "Silver Lake"] },
  { slug: "chicago-il", name: "Chicago", stateCode: "IL", stateSlug: "illinois-il", nearby: ["evanston-il", "oak-park-il"], neighborhoods: ["River North", "Lakeview", "West Loop"] },
  { slug: "miami-fl", name: "Miami", stateCode: "FL", stateSlug: "florida-fl", nearby: ["fort-lauderdale-fl", "miami-beach-fl"], neighborhoods: ["Brickell", "Wynwood", "Downtown Miami"] },
  { slug: "dallas-tx", name: "Dallas", stateCode: "TX", stateSlug: "texas-tx", nearby: ["plano-tx", "irving-tx"], neighborhoods: ["Oak Lawn", "Uptown", "Deep Ellum"] },
  { slug: "houston-tx", name: "Houston", stateCode: "TX", stateSlug: "texas-tx", nearby: ["sugar-land-tx", "the-woodlands-tx"], neighborhoods: ["Montrose", "Midtown", "The Heights"] },
  { slug: "austin-tx", name: "Austin", stateCode: "TX", stateSlug: "texas-tx", nearby: ["round-rock-tx", "cedar-park-tx"], neighborhoods: ["Downtown", "South Congress", "East Austin"] },
  { slug: "atlanta-ga", name: "Atlanta", stateCode: "GA", stateSlug: "georgia-ga", nearby: ["sandy-springs-ga", "decatur-ga"], neighborhoods: ["Midtown", "Buckhead", "Old Fourth Ward"] },
  { slug: "seattle-wa", name: "Seattle", stateCode: "WA", stateSlug: "washington-wa", nearby: ["bellevue-wa", "tacoma-wa"], neighborhoods: ["Capitol Hill", "Belltown", "Ballard"] },
  { slug: "phoenix-az", name: "Phoenix", stateCode: "AZ", stateSlug: "arizona-az", nearby: ["scottsdale-az", "tempe-az"], neighborhoods: ["Downtown", "Arcadia", "Roosevelt Row"] },
  { slug: "denver-co", name: "Denver", stateCode: "CO", stateSlug: "colorado-co", nearby: ["aurora-co", "lakewood-co"], neighborhoods: ["LoDo", "Capitol Hill", "RiNo"] },
  { slug: "san-diego-ca", name: "San Diego", stateCode: "CA", stateSlug: "california-ca", nearby: ["la-jolla-ca", "chula-vista-ca"], neighborhoods: ["Gaslamp", "Hillcrest", "North Park"] },
];

export const CITY_BY_SLUG = new Map(SEO_CITIES.map((city) => [city.slug, city]));
