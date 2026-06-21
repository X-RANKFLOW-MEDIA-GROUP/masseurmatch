// City-service combination pages for hyper-local SEO
// Highest-intent query pattern: "deep tissue massage Dallas"

export type CityServiceCombination = {
  city: string;
  citySlug: string;
  state: string;
  stateCode: string;
  service: string;
  serviceSlug: string;
  path: string;
};

// Example combinations for high-intent cities
export const CITY_SERVICE_COMBINATIONS: CityServiceCombination[] = [
  // Dallas
  { city: "Dallas", citySlug: "dallas-tx", state: "Texas", stateCode: "TX", service: "Deep Tissue", serviceSlug: "deep-tissue", path: "/dallas-tx/deep-tissue-massage" },
  { city: "Dallas", citySlug: "dallas-tx", state: "Texas", stateCode: "TX", service: "Swedish", serviceSlug: "swedish", path: "/dallas-tx/swedish-massage" },
  { city: "Dallas", citySlug: "dallas-tx", state: "Texas", stateCode: "TX", service: "Sports", serviceSlug: "sports", path: "/dallas-tx/sports-massage" },
  { city: "Dallas", citySlug: "dallas-tx", state: "Texas", stateCode: "TX", service: "Thai", serviceSlug: "thai", path: "/dallas-tx/thai-massage" },

  // Miami
  { city: "Miami", citySlug: "miami-fl", state: "Florida", stateCode: "FL", service: "Deep Tissue", serviceSlug: "deep-tissue", path: "/miami-fl/deep-tissue-massage" },
  { city: "Miami", citySlug: "miami-fl", state: "Florida", stateCode: "FL", service: "Swedish", serviceSlug: "swedish", path: "/miami-fl/swedish-massage" },
  { city: "Miami", citySlug: "miami-fl", state: "Florida", stateCode: "FL", service: "Sports", serviceSlug: "sports", path: "/miami-fl/sports-massage" },
  { city: "Miami", citySlug: "miami-fl", state: "Florida", stateCode: "FL", service: "Mobile", serviceSlug: "mobile", path: "/miami-fl/mobile-massage" },

  // New York
  { city: "New York", citySlug: "new-york-ny", state: "New York", stateCode: "NY", service: "Deep Tissue", serviceSlug: "deep-tissue", path: "/new-york-ny/deep-tissue-massage" },
  { city: "New York", citySlug: "new-york-ny", state: "New York", stateCode: "NY", service: "Swedish", serviceSlug: "swedish", path: "/new-york-ny/swedish-massage" },
  { city: "New York", citySlug: "new-york-ny", state: "New York", stateCode: "NY", service: "Sports", serviceSlug: "sports", path: "/new-york-ny/sports-massage" },
  { city: "New York", citySlug: "new-york-ny", state: "New York", stateCode: "NY", service: "Mobile", serviceSlug: "mobile", path: "/new-york-ny/mobile-massage" },

  // Los Angeles
  { city: "Los Angeles", citySlug: "los-angeles-ca", state: "California", stateCode: "CA", service: "Deep Tissue", serviceSlug: "deep-tissue", path: "/los-angeles-ca/deep-tissue-massage" },
  { city: "Los Angeles", citySlug: "los-angeles-ca", state: "California", stateCode: "CA", service: "Swedish", serviceSlug: "swedish", path: "/los-angeles-ca/swedish-massage" },
  { city: "Los Angeles", citySlug: "los-angeles-ca", state: "California", stateCode: "CA", service: "Sports", serviceSlug: "sports", path: "/los-angeles-ca/sports-massage" },
  { city: "Los Angeles", citySlug: "los-angeles-ca", state: "California", stateCode: "CA", service: "Mobile", serviceSlug: "mobile", path: "/los-angeles-ca/mobile-massage" },

  // Chicago
  { city: "Chicago", citySlug: "chicago-il", state: "Illinois", stateCode: "IL", service: "Deep Tissue", serviceSlug: "deep-tissue", path: "/chicago-il/deep-tissue-massage" },
  { city: "Chicago", citySlug: "chicago-il", state: "Illinois", stateCode: "IL", service: "Swedish", serviceSlug: "swedish", path: "/chicago-il/swedish-massage" },
  { city: "Chicago", citySlug: "chicago-il", state: "Illinois", stateCode: "IL", service: "Sports", serviceSlug: "sports", path: "/chicago-il/sports-massage" },

  // Houston
  { city: "Houston", citySlug: "houston-tx", state: "Texas", stateCode: "TX", service: "Deep Tissue", serviceSlug: "deep-tissue", path: "/houston-tx/deep-tissue-massage" },
  { city: "Houston", citySlug: "houston-tx", state: "Texas", stateCode: "TX", service: "Swedish", serviceSlug: "swedish", path: "/houston-tx/swedish-massage" },
  { city: "Houston", citySlug: "houston-tx", state: "Texas", stateCode: "TX", service: "Mobile", serviceSlug: "mobile", path: "/houston-tx/mobile-massage" },

  // Atlanta
  { city: "Atlanta", citySlug: "atlanta-ga", state: "Georgia", stateCode: "GA", service: "Deep Tissue", serviceSlug: "deep-tissue", path: "/atlanta-ga/deep-tissue-massage" },
  { city: "Atlanta", citySlug: "atlanta-ga", state: "Georgia", stateCode: "GA", service: "Swedish", serviceSlug: "swedish", path: "/atlanta-ga/swedish-massage" },
  { city: "Atlanta", citySlug: "atlanta-ga", state: "Georgia", stateCode: "GA", service: "Sports", serviceSlug: "sports", path: "/atlanta-ga/sports-massage" },

  // San Francisco
  { city: "San Francisco", citySlug: "san-francisco-ca", state: "California", stateCode: "CA", service: "Deep Tissue", serviceSlug: "deep-tissue", path: "/san-francisco-ca/deep-tissue-massage" },
  { city: "San Francisco", citySlug: "san-francisco-ca", state: "California", stateCode: "CA", service: "Swedish", serviceSlug: "swedish", path: "/san-francisco-ca/swedish-massage" },
  { city: "San Francisco", citySlug: "san-francisco-ca", state: "California", stateCode: "CA", service: "Mobile", serviceSlug: "mobile", path: "/san-francisco-ca/mobile-massage" },

  // Seattle
  { city: "Seattle", citySlug: "seattle-wa", state: "Washington", stateCode: "WA", service: "Deep Tissue", serviceSlug: "deep-tissue", path: "/seattle-wa/deep-tissue-massage" },
  { city: "Seattle", citySlug: "seattle-wa", state: "Washington", stateCode: "WA", service: "Swedish", serviceSlug: "swedish", path: "/seattle-wa/swedish-massage" },
  { city: "Seattle", citySlug: "seattle-wa", state: "Washington", stateCode: "WA", service: "Sports", serviceSlug: "sports", path: "/seattle-wa/sports-massage" },
];

export function getCityServiceCombination(city: string, service: string): CityServiceCombination | null {
  return CITY_SERVICE_COMBINATIONS.find(
    (combo) => combo.citySlug === city && combo.serviceSlug === service
  ) || null;
}

export function getCityServiceCombinationsByCity(city: string): CityServiceCombination[] {
  return CITY_SERVICE_COMBINATIONS.filter((combo) => combo.citySlug === city);
}

export function getCityServiceCombinationsByService(service: string): CityServiceCombination[] {
  return CITY_SERVICE_COMBINATIONS.filter((combo) => combo.serviceSlug === service);
}
