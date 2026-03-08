// Top 200 US Metro areas with realistic geographic data
export interface USCity {
  id: string;
  city: string;
  state: string;
  stateCode: string;
  county: string;
  lat: number;
  lng: number;
  population: number;
  metroArea: string;
  isTourism: boolean;
  isLgbtFriendly: boolean;
}

export const US_METROS: USCity[] = [
  { id: "nyc", city: "New York", state: "New York", stateCode: "NY", county: "New York", lat: 40.7128, lng: -74.006, population: 8336817, metroArea: "New York-Newark-Jersey City", isTourism: true, isLgbtFriendly: true },
  { id: "lax", city: "Los Angeles", state: "California", stateCode: "CA", county: "Los Angeles", lat: 34.0522, lng: -118.2437, population: 3979576, metroArea: "Los Angeles-Long Beach-Anaheim", isTourism: true, isLgbtFriendly: true },
  { id: "chi", city: "Chicago", state: "Illinois", stateCode: "IL", county: "Cook", lat: 41.8781, lng: -87.6298, population: 2693976, metroArea: "Chicago-Naperville-Elgin", isTourism: true, isLgbtFriendly: true },
  { id: "hou", city: "Houston", state: "Texas", stateCode: "TX", county: "Harris", lat: 29.7604, lng: -95.3698, population: 2320268, metroArea: "Houston-The Woodlands-Sugar Land", isTourism: false, isLgbtFriendly: true },
  { id: "phx", city: "Phoenix", state: "Arizona", stateCode: "AZ", county: "Maricopa", lat: 33.4484, lng: -112.074, population: 1680992, metroArea: "Phoenix-Mesa-Chandler", isTourism: true, isLgbtFriendly: false },
  { id: "phi", city: "Philadelphia", state: "Pennsylvania", stateCode: "PA", county: "Philadelphia", lat: 39.9526, lng: -75.1652, population: 1603797, metroArea: "Philadelphia-Camden-Wilmington", isTourism: true, isLgbtFriendly: true },
  { id: "sat", city: "San Antonio", state: "Texas", stateCode: "TX", county: "Bexar", lat: 29.4241, lng: -98.4936, population: 1547253, metroArea: "San Antonio-New Braunfels", isTourism: true, isLgbtFriendly: false },
  { id: "sd", city: "San Diego", state: "California", stateCode: "CA", county: "San Diego", lat: 32.7157, lng: -117.1611, population: 1423851, metroArea: "San Diego-Chula Vista-Carlsbad", isTourism: true, isLgbtFriendly: true },
  { id: "dal", city: "Dallas", state: "Texas", stateCode: "TX", county: "Dallas", lat: 32.7767, lng: -96.797, population: 1343573, metroArea: "Dallas-Fort Worth-Arlington", isTourism: false, isLgbtFriendly: true },
  { id: "sj", city: "San Jose", state: "California", stateCode: "CA", county: "Santa Clara", lat: 37.3382, lng: -121.8863, population: 1021795, metroArea: "San Jose-Sunnyvale-Santa Clara", isTourism: false, isLgbtFriendly: true },
  { id: "aus", city: "Austin", state: "Texas", stateCode: "TX", county: "Travis", lat: 30.2672, lng: -97.7431, population: 978908, metroArea: "Austin-Round Rock-Georgetown", isTourism: true, isLgbtFriendly: true },
  { id: "jax", city: "Jacksonville", state: "Florida", stateCode: "FL", county: "Duval", lat: 30.3322, lng: -81.6557, population: 949611, metroArea: "Jacksonville", isTourism: false, isLgbtFriendly: false },
  { id: "ftw", city: "Fort Worth", state: "Texas", stateCode: "TX", county: "Tarrant", lat: 32.7555, lng: -97.3308, population: 918915, metroArea: "Dallas-Fort Worth-Arlington", isTourism: false, isLgbtFriendly: false },
  { id: "col", city: "Columbus", state: "Ohio", stateCode: "OH", county: "Franklin", lat: 39.9612, lng: -82.9988, population: 905748, metroArea: "Columbus", isTourism: false, isLgbtFriendly: true },
  { id: "ind", city: "Indianapolis", state: "Indiana", stateCode: "IN", county: "Marion", lat: 39.7684, lng: -86.1581, population: 887642, metroArea: "Indianapolis-Carmel-Anderson", isTourism: false, isLgbtFriendly: false },
  { id: "cha", city: "Charlotte", state: "North Carolina", stateCode: "NC", county: "Mecklenburg", lat: 35.2271, lng: -80.8431, population: 874579, metroArea: "Charlotte-Concord-Gastonia", isTourism: false, isLgbtFriendly: false },
  { id: "sf", city: "San Francisco", state: "California", stateCode: "CA", county: "San Francisco", lat: 37.7749, lng: -122.4194, population: 873965, metroArea: "San Francisco-Oakland-Berkeley", isTourism: true, isLgbtFriendly: true },
  { id: "sea", city: "Seattle", state: "Washington", stateCode: "WA", county: "King", lat: 47.6062, lng: -122.3321, population: 737015, metroArea: "Seattle-Tacoma-Bellevue", isTourism: true, isLgbtFriendly: true },
  { id: "den", city: "Denver", state: "Colorado", stateCode: "CO", county: "Denver", lat: 39.7392, lng: -104.9903, population: 715522, metroArea: "Denver-Aurora-Lakewood", isTourism: true, isLgbtFriendly: true },
  { id: "dc", city: "Washington", state: "District of Columbia", stateCode: "DC", county: "District of Columbia", lat: 38.9072, lng: -77.0369, population: 689545, metroArea: "Washington-Arlington-Alexandria", isTourism: true, isLgbtFriendly: true },
  { id: "nsh", city: "Nashville", state: "Tennessee", stateCode: "TN", county: "Davidson", lat: 36.1627, lng: -86.7816, population: 689447, metroArea: "Nashville-Davidson-Murfreesboro", isTourism: true, isLgbtFriendly: false },
  { id: "okc", city: "Oklahoma City", state: "Oklahoma", stateCode: "OK", county: "Oklahoma", lat: 35.4676, lng: -97.5164, population: 681054, metroArea: "Oklahoma City", isTourism: false, isLgbtFriendly: false },
  { id: "elp", city: "El Paso", state: "Texas", stateCode: "TX", county: "El Paso", lat: 31.7619, lng: -106.485, population: 678815, metroArea: "El Paso", isTourism: false, isLgbtFriendly: false },
  { id: "bos", city: "Boston", state: "Massachusetts", stateCode: "MA", county: "Suffolk", lat: 42.3601, lng: -71.0589, population: 675647, metroArea: "Boston-Cambridge-Newton", isTourism: true, isLgbtFriendly: true },
  { id: "por", city: "Portland", state: "Oregon", stateCode: "OR", county: "Multnomah", lat: 45.5051, lng: -122.675, population: 652503, metroArea: "Portland-Vancouver-Hillsboro", isTourism: true, isLgbtFriendly: true },
  { id: "lv", city: "Las Vegas", state: "Nevada", stateCode: "NV", county: "Clark", lat: 36.1699, lng: -115.1398, population: 641903, metroArea: "Las Vegas-Henderson-Paradise", isTourism: true, isLgbtFriendly: true },
  { id: "mem", city: "Memphis", state: "Tennessee", stateCode: "TN", county: "Shelby", lat: 35.1495, lng: -90.049, population: 633104, metroArea: "Memphis", isTourism: false, isLgbtFriendly: false },
  { id: "lou", city: "Louisville", state: "Kentucky", stateCode: "KY", county: "Jefferson", lat: 38.2527, lng: -85.7585, population: 633045, metroArea: "Louisville/Jefferson County", isTourism: false, isLgbtFriendly: false },
  { id: "bal", city: "Baltimore", state: "Maryland", stateCode: "MD", county: "Baltimore City", lat: 39.2904, lng: -76.6122, population: 585708, metroArea: "Baltimore-Columbia-Towson", isTourism: true, isLgbtFriendly: true },
  { id: "mil", city: "Milwaukee", state: "Wisconsin", stateCode: "WI", county: "Milwaukee", lat: 43.0389, lng: -87.9065, population: 577222, metroArea: "Milwaukee-Waukesha", isTourism: false, isLgbtFriendly: true },
  { id: "abq", city: "Albuquerque", state: "New Mexico", stateCode: "NM", county: "Bernalillo", lat: 35.0844, lng: -106.6504, population: 564559, metroArea: "Albuquerque", isTourism: true, isLgbtFriendly: false },
  { id: "tuc", city: "Tucson", state: "Arizona", stateCode: "AZ", county: "Pima", lat: 32.2226, lng: -110.9747, population: 542629, metroArea: "Tucson", isTourism: true, isLgbtFriendly: false },
  { id: "fre", city: "Fresno", state: "California", stateCode: "CA", county: "Fresno", lat: 36.7378, lng: -119.7871, population: 542107, metroArea: "Fresno", isTourism: false, isLgbtFriendly: false },
  { id: "sac", city: "Sacramento", state: "California", stateCode: "CA", county: "Sacramento", lat: 38.5816, lng: -121.4944, population: 524943, metroArea: "Sacramento-Roseville-Folsom", isTourism: false, isLgbtFriendly: true },
  { id: "msa", city: "Mesa", state: "Arizona", stateCode: "AZ", county: "Maricopa", lat: 33.4152, lng: -111.8315, population: 504258, metroArea: "Phoenix-Mesa-Chandler", isTourism: false, isLgbtFriendly: false },
  { id: "kc", city: "Kansas City", state: "Missouri", stateCode: "MO", county: "Jackson", lat: 39.0997, lng: -94.5786, population: 508090, metroArea: "Kansas City", isTourism: false, isLgbtFriendly: false },
  { id: "atl", city: "Atlanta", state: "Georgia", stateCode: "GA", county: "Fulton", lat: 33.749, lng: -84.388, population: 498715, metroArea: "Atlanta-Sandy Springs-Alpharetta", isTourism: true, isLgbtFriendly: true },
  { id: "orl", city: "Orlando", state: "Florida", stateCode: "FL", county: "Orange", lat: 28.5383, lng: -81.3792, population: 307573, metroArea: "Orlando-Kissimmee-Sanford", isTourism: true, isLgbtFriendly: true },
  { id: "mia", city: "Miami", state: "Florida", stateCode: "FL", county: "Miami-Dade", lat: 25.7617, lng: -80.1918, population: 442241, metroArea: "Miami-Fort Lauderdale-Pompano Beach", isTourism: true, isLgbtFriendly: true },
  { id: "mpl", city: "Minneapolis", state: "Minnesota", stateCode: "MN", county: "Hennepin", lat: 44.9778, lng: -93.265, population: 429954, metroArea: "Minneapolis-St. Paul-Bloomington", isTourism: false, isLgbtFriendly: true },
  { id: "tpa", city: "Tampa", state: "Florida", stateCode: "FL", county: "Hillsborough", lat: 27.9506, lng: -82.4572, population: 384959, metroArea: "Tampa-St. Petersburg-Clearwater", isTourism: true, isLgbtFriendly: true },
  { id: "nol", city: "New Orleans", state: "Louisiana", stateCode: "LA", county: "Orleans", lat: 29.9511, lng: -90.0715, population: 383997, metroArea: "New Orleans-Metairie", isTourism: true, isLgbtFriendly: true },
  { id: "cle", city: "Cleveland", state: "Ohio", stateCode: "OH", county: "Cuyahoga", lat: 41.4993, lng: -81.6944, population: 372624, metroArea: "Cleveland-Elyria", isTourism: false, isLgbtFriendly: false },
  { id: "stl", city: "St. Louis", state: "Missouri", stateCode: "MO", county: "St. Louis City", lat: 38.627, lng: -90.1994, population: 301578, metroArea: "St. Louis", isTourism: false, isLgbtFriendly: false },
  { id: "pit", city: "Pittsburgh", state: "Pennsylvania", stateCode: "PA", county: "Allegheny", lat: 40.4406, lng: -79.9959, population: 302971, metroArea: "Pittsburgh", isTourism: false, isLgbtFriendly: true },
  { id: "ral", city: "Raleigh", state: "North Carolina", stateCode: "NC", county: "Wake", lat: 35.7796, lng: -78.6382, population: 467665, metroArea: "Raleigh-Cary", isTourism: false, isLgbtFriendly: true },
  { id: "slc", city: "Salt Lake City", state: "Utah", stateCode: "UT", county: "Salt Lake", lat: 40.7608, lng: -111.891, population: 199723, metroArea: "Salt Lake City", isTourism: true, isLgbtFriendly: false },
  { id: "hon", city: "Honolulu", state: "Hawaii", stateCode: "HI", county: "Honolulu", lat: 21.3069, lng: -157.8583, population: 350964, metroArea: "Urban Honolulu", isTourism: true, isLgbtFriendly: true },
  { id: "pspr", city: "Palm Springs", state: "California", stateCode: "CA", county: "Riverside", lat: 33.8303, lng: -116.5453, population: 48518, metroArea: "Riverside-San Bernardino-Ontario", isTourism: true, isLgbtFriendly: true },
  { id: "ptown", city: "Provincetown", state: "Massachusetts", stateCode: "MA", county: "Barnstable", lat: 42.0584, lng: -70.1867, population: 2942, metroArea: "Barnstable Town", isTourism: true, isLgbtFriendly: true },
  { id: "fll", city: "Fort Lauderdale", state: "Florida", stateCode: "FL", county: "Broward", lat: 26.1224, lng: -80.1373, population: 182760, metroArea: "Miami-Fort Lauderdale-Pompano Beach", isTourism: true, isLgbtFriendly: true },
  { id: "sav", city: "Savannah", state: "Georgia", stateCode: "GA", county: "Chatham", lat: 32.0809, lng: -81.0912, population: 147780, metroArea: "Savannah", isTourism: true, isLgbtFriendly: false },
  { id: "ash", city: "Asheville", state: "North Carolina", stateCode: "NC", county: "Buncombe", lat: 35.5951, lng: -82.5515, population: 94589, metroArea: "Asheville", isTourism: true, isLgbtFriendly: true },
  { id: "arl", city: "Arlington", state: "Texas", stateCode: "TX", county: "Tarrant", lat: 32.7357, lng: -97.1081, population: 394266, metroArea: "Dallas-Fort Worth-Arlington", isTourism: false, isLgbtFriendly: false },
  { id: "ana", city: "Anaheim", state: "California", stateCode: "CA", county: "Orange", lat: 33.8366, lng: -117.9143, population: 350365, metroArea: "Los Angeles-Long Beach-Anaheim", isTourism: true, isLgbtFriendly: false },
  { id: "lb", city: "Long Beach", state: "California", stateCode: "CA", county: "Los Angeles", lat: 33.767, lng: -118.1892, population: 466742, metroArea: "Los Angeles-Long Beach-Anaheim", isTourism: true, isLgbtFriendly: true },
  { id: "cin", city: "Cincinnati", state: "Ohio", stateCode: "OH", county: "Hamilton", lat: 39.1031, lng: -84.512, population: 309317, metroArea: "Cincinnati", isTourism: false, isLgbtFriendly: false },
  { id: "det", city: "Detroit", state: "Michigan", stateCode: "MI", county: "Wayne", lat: 42.3314, lng: -83.0458, population: 639111, metroArea: "Detroit-Warren-Dearborn", isTourism: false, isLgbtFriendly: false },
  { id: "buf", city: "Buffalo", state: "New York", stateCode: "NY", county: "Erie", lat: 42.8864, lng: -78.8784, population: 278349, metroArea: "Buffalo-Cheektowaga", isTourism: false, isLgbtFriendly: false },
  { id: "ric", city: "Richmond", state: "Virginia", stateCode: "VA", county: "Richmond City", lat: 37.5407, lng: -77.436, population: 226610, metroArea: "Richmond", isTourism: true, isLgbtFriendly: false },
  { id: "stp", city: "St. Petersburg", state: "Florida", stateCode: "FL", county: "Pinellas", lat: 27.7676, lng: -82.6403, population: 258308, metroArea: "Tampa-St. Petersburg-Clearwater", isTourism: true, isLgbtFriendly: true },
  { id: "boi", city: "Boise", state: "Idaho", stateCode: "ID", county: "Ada", lat: 43.615, lng: -116.2023, population: 235684, metroArea: "Boise City", isTourism: false, isLgbtFriendly: false },
  { id: "ren", city: "Reno", state: "Nevada", stateCode: "NV", county: "Washoe", lat: 39.5296, lng: -119.8138, population: 264165, metroArea: "Reno-Sparks", isTourism: true, isLgbtFriendly: false },
  { id: "scotts", city: "Scottsdale", state: "Arizona", stateCode: "AZ", county: "Maricopa", lat: 33.4942, lng: -111.9261, population: 241361, metroArea: "Phoenix-Mesa-Chandler", isTourism: true, isLgbtFriendly: false },
  { id: "wbeach", city: "West Palm Beach", state: "Florida", stateCode: "FL", county: "Palm Beach", lat: 26.7153, lng: -80.0534, population: 117415, metroArea: "Miami-Fort Lauderdale-Pompano Beach", isTourism: true, isLgbtFriendly: true },
  { id: "char", city: "Charleston", state: "South Carolina", stateCode: "SC", county: "Charleston", lat: 32.7765, lng: -79.9311, population: 150227, metroArea: "Charleston-North Charleston", isTourism: true, isLgbtFriendly: false },
  { id: "whia", city: "West Hollywood", state: "California", stateCode: "CA", county: "Los Angeles", lat: 34.0901, lng: -118.3617, population: 35757, metroArea: "Los Angeles-Long Beach-Anaheim", isTourism: true, isLgbtFriendly: true },
  { id: "keywest", city: "Key West", state: "Florida", stateCode: "FL", county: "Monroe", lat: 24.5551, lng: -81.782, population: 25478, metroArea: "Key West", isTourism: true, isLgbtFriendly: true },
  { id: "myrtle", city: "Myrtle Beach", state: "South Carolina", stateCode: "SC", county: "Horry", lat: 33.6891, lng: -78.8867, population: 34695, metroArea: "Myrtle Beach-Conway-North Myrtle Beach", isTourism: true, isLgbtFriendly: false },
];

// ── Keywords ──
export const DEMAND_KEYWORDS = [
  "gay massage",
  "gay massage near me",
  "male massage therapist",
  "male to male massage",
  "gay massage service",
  "private male massage",
  "mobile male massage",
  "male massage therapist near me",
  "male massage outcall",
  "male massage incall",
  "male massage therapy",
  "male body massage",
  "deep tissue male massage",
  "male relaxation massage",
  "male therapeutic massage",
  "gay friendly massage therapist",
  "licensed male massage therapist",
  "professional male massage therapist",
  "male spa massage",
  "male massage home service",
];

// ── Demand data types ──
export interface CityDemandData {
  cityId: string;
  demandScore: number;      // 0-100
  spikeScore: number;       // 0-100
  growthVelocity: number;   // -100 to +100
  populationWeight: number; // 0-100
  tourismWeight: number;    // 0-100
  competitionScore: number; // 0-100 (lower = less competition = better)
  seasonalityScore: number; // 0-100
  travelScore: number;      // 0-100 final
  topKeyword: string;
  keywordCount: number;     // how many keywords spiking
  confidence: number;       // 0-100
  label: "go_now" | "watch" | "low_priority" | "ignore";
  trend7d: number;          // % change
  trend14d: number;
  trend30d: number;
  baseline30d: number;
  currentVolume: number;
  lastUpdated: string;
}

// ── Seeded random for consistent simulation ──
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getLabel(score: number): CityDemandData["label"] {
  if (score >= 80) return "go_now";
  if (score >= 60) return "watch";
  if (score >= 40) return "low_priority";
  return "ignore";
}

// Generate simulated but realistic demand data
export function generateDemandData(dateSeed?: number): CityDemandData[] {
  const seed = dateSeed ?? Math.floor(Date.now() / 86400000); // changes daily
  const rng = seededRandom(seed);

  return US_METROS.map((city) => {
    // Higher base demand for larger, tourism, LGBT-friendly cities
    const popFactor = Math.min(city.population / 8000000, 1);
    const tourismBoost = city.isTourism ? 0.2 : 0;
    const lgbtBoost = city.isLgbtFriendly ? 0.25 : 0;
    const baseDemand = Math.min(100, Math.round((popFactor * 40 + tourismBoost * 100 + lgbtBoost * 100 + rng() * 30) * (0.6 + rng() * 0.4)));

    // Spike: some cities randomly spike
    const hasSpike = rng() > 0.7;
    const spikeScore = hasSpike ? Math.round(50 + rng() * 50) : Math.round(rng() * 35);

    const growthVelocity = Math.round((rng() - 0.3) * 80);
    const populationWeight = Math.round(popFactor * 100);
    const tourismWeight = city.isTourism ? Math.round(50 + rng() * 50) : Math.round(rng() * 30);
    const competitionScore = Math.round(20 + rng() * 60); // lower = less competition
    const seasonalityScore = Math.round(40 + rng() * 60);

    const lowCompetitionAdv = 100 - competitionScore;

    const travelScore = Math.round(
      0.30 * baseDemand +
      0.25 * spikeScore +
      0.15 * Math.max(0, growthVelocity) +
      0.10 * populationWeight +
      0.10 * tourismWeight +
      0.10 * lowCompetitionAdv
    );

    const confidence = Math.round(40 + rng() * 55);
    const topKeyword = DEMAND_KEYWORDS[Math.floor(rng() * DEMAND_KEYWORDS.length)];
    const keywordCount = hasSpike ? Math.floor(3 + rng() * 8) : Math.floor(1 + rng() * 4);

    const baseline30d = Math.round(100 + rng() * 500);
    const currentVolume = hasSpike ? Math.round(baseline30d * (1.5 + rng() * 2)) : Math.round(baseline30d * (0.8 + rng() * 0.6));

    return {
      cityId: city.id,
      demandScore: baseDemand,
      spikeScore,
      growthVelocity,
      populationWeight,
      tourismWeight,
      competitionScore,
      seasonalityScore,
      travelScore: Math.min(100, travelScore),
      topKeyword,
      keywordCount,
      confidence,
      label: getLabel(Math.min(100, travelScore)),
      trend7d: Math.round((rng() - 0.3) * 40),
      trend14d: Math.round((rng() - 0.35) * 50),
      trend30d: Math.round((rng() - 0.4) * 60),
      baseline30d,
      currentVolume,
      lastUpdated: new Date().toISOString(),
    };
  });
}

// Get city info by ID
export function getCityById(id: string): USCity | undefined {
  return US_METROS.find((c) => c.id === id);
}

// Calculate distance between two cities in miles
export function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Find nearby cities within radius
export function findNearbyCities(cityId: string, radiusMiles: number): USCity[] {
  const origin = getCityById(cityId);
  if (!origin) return [];
  return US_METROS.filter(
    (c) => c.id !== cityId && distanceMiles(origin.lat, origin.lng, c.lat, c.lng) <= radiusMiles
  );
}

// Get unique states
export function getUniqueStates(): string[] {
  return [...new Set(US_METROS.map((c) => c.stateCode))].sort();
}

// Get unique metro areas
export function getUniqueMetros(): string[] {
  return [...new Set(US_METROS.map((c) => c.metroArea))].sort();
}
