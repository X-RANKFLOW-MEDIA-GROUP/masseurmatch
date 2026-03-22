import {
  getCities,
  getPublicTherapists,
  type PricingSessionItem,
  type PublicTherapist,
} from "@/app/_lib/directory";
import { isVerifiedDirectoryProfile } from "@/app/_lib/public-profile";

export const EXPLORE_DEFAULT_CITY = "Dallas";
export const EXPLORE_DEFAULT_RADIUS = 25;
export const EXPLORE_DEFAULT_PRICE_MAX = 300;
export const EXPLORE_PAGE_SIZE = 24;

export type ExploreView = "grid" | "map" | "swipe";
export type ExploreSort = "distance" | "featured" | "price" | "reviews";

export type ExploreFilters = {
  city: string;
  zip: string;
  radius: number;
  available: boolean;
  verified: boolean;
  featured: boolean;
  offers: boolean;
  incall: boolean;
  outcall: boolean;
  priceMin: number;
  priceMax: number;
  sort: ExploreSort;
  view: ExploreView;
};

export type ExploreProvider = {
  id: string;
  slug: string;
  name: string;
  city: string;
  neighborhood: string;
  yearsExperience: number | null;
  specialty: string;
  photoUrl: string;
  verifiedStatus: "elite" | "verified" | "directory";
  priceFrom: number | null;
  priceLabel: string;
  sessionDurationMinutes: number;
  distance: number | null;
  availableNow: boolean;
  availabilityUpdatedAt: string | null;
  incall: boolean;
  outcall: boolean;
  featured: boolean;
  offers: boolean;
  offerText: string | null;
  reviewCount: number;
  profileViews: number;
  latitude: number;
  longitude: number;
  bio: string;
  phone: string | null;
  modality: string | null;
  tier: string;
  trustSignals: string[];
  missingFields: string[];
  overlaySummary: string;
  profilePath: string;
};

export type ExploreApiProvider = ExploreProvider & {
  photo_url: string;
  verified_status: ExploreProvider["verifiedStatus"];
  years_experience: number | null;
  price_from: number | null;
  price_label: string;
  session_duration_minutes: number;
  distance_label: string | null;
  available_now: boolean;
  availability_updated_at: string | null;
  review_count: number;
  profile_views: number;
  offer_text: string | null;
  overlay_summary: string;
  profile_path: string;
  trust_signals: string[];
  missing_fields: string[];
};

export type ExplorePoint = {
  latitude: number;
  longitude: number;
};

type SearchParamShape = Record<string, string | string[] | undefined>;

const CITY_COORDINATES: Record<string, ExplorePoint> = {
  addison: { latitude: 32.9618, longitude: -96.8292 },
  atlanta: { latitude: 33.749, longitude: -84.388 },
  arlington: { latitude: 32.7357, longitude: -97.1081 },
  austin: { latitude: 30.2672, longitude: -97.7431 },
  brooklyn: { latitude: 40.6782, longitude: -73.9442 },
  carrollton: { latitude: 32.9756, longitude: -96.8899 },
  chicago: { latitude: 41.8781, longitude: -87.6298 },
  dallas: { latitude: 32.7767, longitude: -96.797 },
  denver: { latitude: 39.7392, longitude: -104.9903 },
  "farmers-branch": { latitude: 32.9265, longitude: -96.8961 },
  "fort-lauderdale": { latitude: 26.1224, longitude: -80.1373 },
  "fort-worth": { latitude: 32.7555, longitude: -97.3308 },
  frisco: { latitude: 33.1507, longitude: -96.8236 },
  "grand-prairie": { latitude: 32.7459, longitude: -96.9978 },
  "highland-park": { latitude: 32.8335, longitude: -96.8058 },
  houston: { latitude: 29.7604, longitude: -95.3698 },
  irving: { latitude: 32.814, longitude: -96.9489 },
  "las-vegas": { latitude: 36.1699, longitude: -115.1398 },
  "los-angeles": { latitude: 34.0522, longitude: -118.2437 },
  miami: { latitude: 25.7617, longitude: -80.1918 },
  minneapolis: { latitude: 44.9778, longitude: -93.265 },
  "new-york": { latitude: 40.7128, longitude: -74.006 },
  orlando: { latitude: 28.5383, longitude: -81.3792 },
  "palm-springs": { latitude: 33.8303, longitude: -116.5453 },
  phoenix: { latitude: 33.4484, longitude: -112.074 },
  plano: { latitude: 33.0198, longitude: -96.6989 },
  portland: { latitude: 45.5152, longitude: -122.6784 },
  richardson: { latitude: 32.9483, longitude: -96.7299 },
  "san-diego": { latitude: 32.7157, longitude: -117.1611 },
  "san-francisco": { latitude: 37.7749, longitude: -122.4194 },
  seattle: { latitude: 47.6062, longitude: -122.3321 },
  "washington-dc": { latitude: 38.9072, longitude: -77.0369 },
  "west-hollywood": { latitude: 34.09, longitude: -118.3617 },
  "wilton-manors": { latitude: 26.1604, longitude: -80.1389 },
};

const ZIP_TO_CITY: Record<string, string> = {
  "75201": "Dallas",
  "75204": "Dallas",
  "75219": "Dallas",
  "77002": "Houston",
  "77006": "Houston",
  "78701": "Austin",
  "78704": "Austin",
  "60601": "Chicago",
  "60654": "Chicago",
  "33131": "Miami",
  "90069": "West Hollywood",
};

const SORT_OPTIONS = new Set<ExploreSort>(["distance", "featured", "price", "reviews"]);
const VIEW_OPTIONS = new Set<ExploreView>(["grid", "map", "swipe"]);

export function getExploreDefaults(): ExploreFilters {
  return {
    city: EXPLORE_DEFAULT_CITY,
    zip: "",
    radius: EXPLORE_DEFAULT_RADIUS,
    available: false,
    verified: false,
    featured: false,
    offers: false,
    incall: false,
    outcall: false,
    priceMin: 0,
    priceMax: EXPLORE_DEFAULT_PRICE_MAX,
    sort: "distance",
    view: "grid",
  };
}

function normalize(value: string | null | undefined) {
  return (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function toSlug(value: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function resolveExploreCity(inputCity: string, inputZip = "") {
  const zip = inputZip.trim();
  if (zip && ZIP_TO_CITY[zip]) {
    return ZIP_TO_CITY[zip];
  }

  const raw = inputCity.trim();
  if (!raw) {
    return EXPLORE_DEFAULT_CITY;
  }

  const matched = getCities().find((city) => {
    const normalizedInput = normalize(raw);
    return normalize(city.name) === normalizedInput || city.slug === toSlug(raw);
  });

  return matched?.name || raw;
}

export function getCityCoordinates(cityName: string) {
  const city = getCities().find((entry) => normalize(entry.name) === normalize(cityName));
  const slug = city?.slug || toSlug(cityName);
  return CITY_COORDINATES[slug] || CITY_COORDINATES[toSlug(EXPLORE_DEFAULT_CITY)];
}

function getProfileCoordinates(profile: PublicTherapist) {
  const latitude = typeof profile.latitude === "number" ? profile.latitude : null;
  const longitude = typeof profile.longitude === "number" ? profile.longitude : null;

  if (latitude !== null && longitude !== null) {
    return { latitude, longitude };
  }

  return getCityCoordinates(profile.city || EXPLORE_DEFAULT_CITY);
}

function calculateDistanceMiles(from: ExplorePoint, to: ExplorePoint) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((earthRadiusMiles * c).toFixed(1));
}

function deriveYearsExperience(profile: PublicTherapist) {
  if (typeof profile.years_experience === "number") {
    return profile.years_experience;
  }

  if (typeof profile.start_year === "number") {
    return Math.max(0, new Date().getFullYear() - profile.start_year);
  }

  return null;
}

function validSessionPrices(session: PricingSessionItem) {
  return [session.incall, session.outcall].filter(
    (value): value is number => typeof value === "number" && value > 0,
  );
}

function deriveStartingPrice(profile: PublicTherapist) {
  const sessionPrices = (profile.pricing_sessions || []).flatMap((session) => validSessionPrices(session));
  const prices = [profile.incall_price, profile.outcall_price, ...sessionPrices].filter(
    (value): value is number => typeof value === "number" && value > 0,
  );

  return prices.length > 0 ? Math.min(...prices) : null;
}

function deriveSessionDuration(profile: PublicTherapist, priceFrom: number | null) {
  const sessions = (profile.pricing_sessions || []).filter(
    (session) =>
      typeof session.duration === "number" &&
      validSessionPrices(session).length > 0,
  );

  if (typeof priceFrom === "number") {
    const matched = sessions.find(
      (session) => session.incall === priceFrom || session.outcall === priceFrom,
    );
    if (matched?.duration) {
      return matched.duration;
    }
  }

  if (sessions[0]?.duration) {
    return sessions[0].duration;
  }

  return 60;
}

function buildPriceLabel(priceFrom: number | null, sessionDurationMinutes: number) {
  if (typeof priceFrom !== "number") {
    return "Price on request";
  }

  return `Starting at $${priceFrom} for ${sessionDurationMinutes} min`;
}

function buildOverlayPriceLabel(priceFrom: number | null) {
  if (typeof priceFrom !== "number") {
    return "Price on request";
  }

  return `Starting at $${priceFrom}`;
}

function deriveSpecialty(profile: PublicTherapist) {
  return profile.specialties?.[0] || profile.modality || "Massage Therapy";
}

function deriveNeighborhood(profile: PublicTherapist) {
  return profile.neighborhood_name || profile.primary_area || profile.city || "Local area";
}

function deriveVerifiedStatus(profile: PublicTherapist): ExploreProvider["verifiedStatus"] {
  if (profile._tier === "elite") {
    return "elite";
  }

  if (isVerifiedDirectoryProfile(profile)) {
    return "verified";
  }

  return "directory";
}

function isProviderAvailableNow(profile: PublicTherapist) {
  if (!profile.available_now) {
    return false;
  }

  if (!profile.available_now_expires) {
    return true;
  }

  return new Date(profile.available_now_expires).getTime() > Date.now();
}

function deriveTrustSignals(profile: PublicTherapist, yearsExperience: number | null) {
  const signals = [
    isVerifiedDirectoryProfile(profile) ? "Verified" : null,
    isProviderAvailableNow(profile) ? "Available now" : null,
    typeof yearsExperience === "number" ? `${yearsExperience} years` : null,
    profile.review_count ? `${profile.review_count} reviews` : null,
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(signals)).slice(0, 3);
}

function getMissingFields(profile: PublicTherapist, yearsExperience: number | null, priceFrom: number | null) {
  const missing: string[] = [];

  if (!profile.neighborhood_name && !profile.primary_area && !profile.city) {
    missing.push("neighborhood");
  }

  if (typeof yearsExperience !== "number") {
    missing.push("years_experience");
  }

  if (typeof priceFrom !== "number") {
    missing.push("price_from");
  }

  return missing;
}

function buildOverlaySummary(provider: Omit<ExploreProvider, "overlaySummary">) {
  const parts: string[] = [];
  if (provider.availableNow) {
    parts.push("Available Now");
  }

  if (typeof provider.distance === "number") {
    parts.push(`${provider.distance.toFixed(1)} mi`);
  }

  parts.push(buildOverlayPriceLabel(provider.priceFrom));

  return parts.join(" \u00B7 ");
}

function withProviderDistance(provider: ExploreProvider, origin: ExplorePoint) {
  const distance = calculateDistanceMiles(origin, {
    latitude: provider.latitude,
    longitude: provider.longitude,
  });

  return {
    ...provider,
    distance,
    overlaySummary: buildOverlaySummary({
      ...provider,
      distance,
    }),
  };
}

function normalizeProvider(profile: PublicTherapist, origin: ExplorePoint): ExploreProvider {
  const location = getProfileCoordinates(profile);
  const yearsExperience = deriveYearsExperience(profile);
  const priceFrom = deriveStartingPrice(profile);
  const sessionDurationMinutes = deriveSessionDuration(profile, priceFrom);
  const priceLabel = buildPriceLabel(priceFrom, sessionDurationMinutes);
  const availableNow = isProviderAvailableNow(profile);
  const trustSignals = deriveTrustSignals(profile, yearsExperience);
  const missingFields = getMissingFields(profile, yearsExperience, priceFrom);

  const providerBase = {
    id: profile.id,
    slug: profile.slug || profile.id,
    name: profile.display_name || profile.full_name || "Provider",
    city: profile.city || EXPLORE_DEFAULT_CITY,
    neighborhood: deriveNeighborhood(profile),
    yearsExperience,
    specialty: deriveSpecialty(profile),
    photoUrl:
      profile.avatar_url ||
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    verifiedStatus: deriveVerifiedStatus(profile),
    priceFrom,
    priceLabel,
    sessionDurationMinutes,
    distance: calculateDistanceMiles(origin, location),
    availableNow,
    availabilityUpdatedAt: profile.available_now_expires || null,
    incall: Boolean(profile.incall_price),
    outcall: Boolean(profile.outcall_price),
    featured: profile._tier === "elite" || profile._tier === "pro",
    offers: Boolean(profile.special_offer_text),
    offerText: profile.special_offer_text || null,
    reviewCount: profile.review_count || 0,
    profileViews: profile.profile_views || 0,
    latitude: location.latitude,
    longitude: location.longitude,
    bio:
      profile.bio ||
      "Profile details are still being completed. Open the listing for direct contact and more session details.",
    phone: profile.phone,
    modality: profile.modality,
    tier: profile._tier || "free",
    trustSignals,
    missingFields,
    profilePath: `/therapists/${profile.slug || profile.id}`,
  };

  return {
    ...providerBase,
    overlaySummary: buildOverlaySummary(providerBase),
  };
}

function filterProvider(provider: ExploreProvider, filters: ExploreFilters) {
  if (filters.available && !provider.availableNow) {
    return false;
  }

  if (filters.verified && provider.verifiedStatus === "directory") {
    return false;
  }

  if (filters.featured && !provider.featured) {
    return false;
  }

  if (filters.offers && !provider.offers) {
    return false;
  }

  if (filters.incall && !provider.incall) {
    return false;
  }

  if (filters.outcall && !provider.outcall) {
    return false;
  }

  if (typeof provider.distance === "number" && provider.distance > filters.radius) {
    return false;
  }

  if (
    typeof provider.priceFrom === "number" &&
    (provider.priceFrom < filters.priceMin || provider.priceFrom > filters.priceMax)
  ) {
    return false;
  }

  return true;
}

function sortProviders(providers: ExploreProvider[], sort: ExploreSort) {
  return [...providers].sort((left, right) => {
    if (sort === "price") {
      return (left.priceFrom ?? Number.MAX_SAFE_INTEGER) - (right.priceFrom ?? Number.MAX_SAFE_INTEGER);
    }

    if (sort === "reviews") {
      return right.reviewCount - left.reviewCount;
    }

    if (sort === "featured") {
      if (Number(right.featured) !== Number(left.featured)) {
        return Number(right.featured) - Number(left.featured);
      }

      if (Number(right.availableNow) !== Number(left.availableNow)) {
        return Number(right.availableNow) - Number(left.availableNow);
      }

      return right.reviewCount - left.reviewCount;
    }

    return (left.distance ?? Number.MAX_SAFE_INTEGER) - (right.distance ?? Number.MAX_SAFE_INTEGER);
  });
}

export function getBaseExploreFilters(filters: ExploreFilters): ExploreFilters {
  return {
    ...filters,
    available: false,
    verified: false,
    featured: false,
    offers: false,
    incall: false,
    outcall: false,
    priceMin: 0,
    priceMax: EXPLORE_DEFAULT_PRICE_MAX,
    sort: "distance",
  };
}

export function recalculateExploreDistances(providers: ExploreProvider[], origin: ExplorePoint) {
  return providers.map((provider) => withProviderDistance(provider, origin));
}

export function applyExploreFilters(
  providers: ExploreProvider[],
  filters: ExploreFilters,
  origin?: ExplorePoint,
) {
  const nextProviders = origin ? recalculateExploreDistances(providers, origin) : providers;
  return sortProviders(
    nextProviders.filter((provider) => provider.missingFields.length === 0 && filterProvider(provider, filters)),
    filters.sort,
  );
}

export function parseExploreSearchParams(params: SearchParamShape): ExploreFilters {
  const defaults = getExploreDefaults();
  const city = getFirstParam(params.city);
  const zip = getFirstParam(params.zip);
  const sortCandidate = getFirstParam(params.sort) as ExploreSort;
  const viewCandidate = getFirstParam(params.view) as ExploreView;
  const priceMin = Number(getFirstParam(params.price_min) || defaults.priceMin);
  const priceMax = Number(getFirstParam(params.price_max) || defaults.priceMax);
  const radius = Number(getFirstParam(params.radius) || defaults.radius);

  return {
    city: resolveExploreCity(city, zip),
    zip,
    radius: Number.isFinite(radius) ? clamp(radius, 1, 100) : defaults.radius,
    available: getFirstParam(params.available) === "1",
    verified: getFirstParam(params.verified) === "1",
    featured: getFirstParam(params.featured) === "1",
    offers: getFirstParam(params.offers) === "1",
    incall: getFirstParam(params.incall) === "1",
    outcall: getFirstParam(params.outcall) === "1",
    priceMin: Number.isFinite(priceMin) ? clamp(priceMin, 0, defaults.priceMax) : defaults.priceMin,
    priceMax: Number.isFinite(priceMax) ? clamp(priceMax, 0, defaults.priceMax) : defaults.priceMax,
    sort: SORT_OPTIONS.has(sortCandidate) ? sortCandidate : defaults.sort,
    view: VIEW_OPTIONS.has(viewCandidate) ? viewCandidate : defaults.view,
  };
}

export function exploreFiltersToUrl(filters: ExploreFilters) {
  const params = new URLSearchParams();
  params.set("city", filters.city);
  params.set("radius", String(filters.radius));
  params.set("sort", filters.sort);
  params.set("view", filters.view);

  if (filters.zip) params.set("zip", filters.zip);
  if (filters.available) params.set("available", "1");
  if (filters.verified) params.set("verified", "1");
  if (filters.featured) params.set("featured", "1");
  if (filters.offers) params.set("offers", "1");
  if (filters.incall) params.set("incall", "1");
  if (filters.outcall) params.set("outcall", "1");
  if (filters.priceMin > 0) params.set("price_min", String(filters.priceMin));
  if (filters.priceMax < EXPLORE_DEFAULT_PRICE_MAX) params.set("price_max", String(filters.priceMax));

  return params.toString();
}

export async function loadExploreProviders(filters: ExploreFilters) {
  const resolvedCity = resolveExploreCity(filters.city, filters.zip);
  const origin = getCityCoordinates(resolvedCity);
  const response = await getPublicTherapists({ page: 1, pageSize: 200 });
  const normalized = response.items.map((profile) => normalizeProvider(profile, origin));
  const sorted = applyExploreFilters(normalized, { ...filters, city: resolvedCity });
  const invalidProviderCount = normalized.filter((provider) => provider.missingFields.length > 0).length;

  return {
    filters: { ...filters, city: resolvedCity },
    origin,
    total: sorted.length,
    items: sorted,
    invalidProviderCount,
  };
}

export function serializeExploreProvider(provider: ExploreProvider): ExploreApiProvider {
  return {
    ...provider,
    photo_url: provider.photoUrl,
    verified_status: provider.verifiedStatus,
    years_experience: provider.yearsExperience,
    price_from: provider.priceFrom,
    price_label: provider.priceLabel,
    session_duration_minutes: provider.sessionDurationMinutes,
    distance_label: typeof provider.distance === "number" ? `${provider.distance.toFixed(1)} mi` : null,
    available_now: provider.availableNow,
    availability_updated_at: provider.availabilityUpdatedAt,
    review_count: provider.reviewCount,
    profile_views: provider.profileViews,
    offer_text: provider.offerText,
    overlay_summary: provider.overlaySummary,
    profile_path: provider.profilePath,
    trust_signals: provider.trustSignals,
    missing_fields: provider.missingFields,
  };
}

export function buildExploreItemListJsonLd(city: string, providers: ExploreProvider[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Explore providers in ${city}`,
    itemListElement: providers.map((provider, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: provider.profilePath,
      item: {
        "@type": "LocalBusiness",
        name: provider.name,
        image: provider.photoUrl,
        address: {
          "@type": "PostalAddress",
          addressLocality: provider.city,
        },
      },
    })),
  };
}
