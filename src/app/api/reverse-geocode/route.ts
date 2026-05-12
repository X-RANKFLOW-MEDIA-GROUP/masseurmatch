import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { US_CITIES } from "@/data/cities";

type ReverseGeocodePayload = {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    [key: string]: string | undefined;
  };
};

type CityPoint = {
  slug: string;
  latitude: number;
  longitude: number;
};

const CITY_POINTS: CityPoint[] = [
  { slug: "addison", latitude: 32.9618, longitude: -96.8292 },
  { slug: "arlington", latitude: 32.7357, longitude: -97.1081 },
  { slug: "austin", latitude: 30.2672, longitude: -97.7431 },
  { slug: "carrollton", latitude: 32.9756, longitude: -96.8899 },
  { slug: "dallas", latitude: 32.7767, longitude: -96.7970 },
  { slug: "farmers-branch", latitude: 32.9265, longitude: -96.8961 },
  { slug: "fort-worth", latitude: 32.7555, longitude: -97.3308 },
  { slug: "frisco", latitude: 33.1507, longitude: -96.8236 },
  { slug: "grand-prairie", latitude: 32.7459, longitude: -96.9978 },
  { slug: "highland-park", latitude: 32.8335, longitude: -96.8058 },
  { slug: "houston", latitude: 29.7604, longitude: -95.3698 },
  { slug: "irving", latitude: 32.8140, longitude: -96.9489 },
  { slug: "plano", latitude: 33.0198, longitude: -96.6989 },
  { slug: "richardson", latitude: 32.9483, longitude: -96.7299 },
  { slug: "san-antonio", latitude: 29.4252, longitude: -98.4946 },
  { slug: "los-angeles", latitude: 34.0522, longitude: -118.2437 },
  { slug: "san-diego", latitude: 32.7157, longitude: -117.1611 },
  { slug: "san-francisco", latitude: 37.7749, longitude: -122.4194 },
  { slug: "west-hollywood", latitude: 34.0900, longitude: -118.3617 },
  { slug: "miami", latitude: 25.7617, longitude: -80.1918 },
  { slug: "fort-lauderdale", latitude: 26.1224, longitude: -80.1373 },
  { slug: "wilton-manors", latitude: 26.1604, longitude: -80.1389 },
  { slug: "orlando", latitude: 28.5383, longitude: -81.3792 },
  { slug: "tampa", latitude: 27.9506, longitude: -82.4572 },
  { slug: "new-york", latitude: 40.7128, longitude: -74.0060 },
  { slug: "brooklyn", latitude: 40.6782, longitude: -73.9442 },
  { slug: "chicago", latitude: 41.8781, longitude: -87.6298 },
  { slug: "atlanta", latitude: 33.7490, longitude: -84.3880 },
  { slug: "seattle", latitude: 47.6062, longitude: -122.3321 },
  { slug: "denver", latitude: 39.7392, longitude: -104.9903 },
  { slug: "phoenix", latitude: 33.4484, longitude: -112.0740 },
  { slug: "las-vegas", latitude: 36.1699, longitude: -115.1398 },
  { slug: "portland", latitude: 45.5152, longitude: -122.6784 },
  { slug: "minneapolis", latitude: 44.9778, longitude: -93.2650 },
  { slug: "washington-dc", latitude: 38.9072, longitude: -77.0369 },
  { slug: "boston", latitude: 42.3601, longitude: -71.0589 },
  { slug: "philadelphia", latitude: 39.9526, longitude: -75.1652 },
  { slug: "columbus", latitude: 39.9612, longitude: -82.9988 },
  { slug: "nashville", latitude: 36.1627, longitude: -86.7816 },
  { slug: "charlotte", latitude: 35.2271, longitude: -80.8431 },
  { slug: "new-orleans", latitude: 29.9511, longitude: -90.0715 },
];

function normalize(value: string | null | undefined) {
  return (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function distanceMiles(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const radius = 3958.8;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findExactSupportedCity(cityName: string | null, stateCode: string | null) {
  const normalizedCity = normalize(cityName);
  const normalizedState = normalize(stateCode);

  if (!normalizedCity) return null;

  return US_CITIES.find((city) => {
    const nameMatches = normalize(city.name) === normalizedCity;
    const stateMatches = !normalizedState || normalize(city.stateCode) === normalizedState;
    return nameMatches && stateMatches;
  }) ?? null;
}

function findNearestSupportedCity(lat: number, lng: number, stateCode: string | null) {
  const normalizedState = normalize(stateCode);
  const candidates = CITY_POINTS
    .map((point) => {
      const city = US_CITIES.find((entry) => entry.slug === point.slug);
      if (!city) return null;
      if (normalizedState && normalize(city.stateCode) !== normalizedState) return null;
      return {
        city,
        distance: distanceMiles({ latitude: lat, longitude: lng }, point),
      };
    })
    .filter((entry): entry is { city: (typeof US_CITIES)[number]; distance: number } => Boolean(entry));

  const allCandidates = candidates.length > 0
    ? candidates
    : CITY_POINTS
        .map((point) => {
          const city = US_CITIES.find((entry) => entry.slug === point.slug);
          if (!city) return null;
          return {
            city,
            distance: distanceMiles({ latitude: lat, longitude: lng }, point),
          };
        })
        .filter((entry): entry is { city: (typeof US_CITIES)[number]; distance: number } => Boolean(entry));

  return allCandidates.sort((a, b) => a.distance - b.distance)[0] ?? null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const lat = Number(url.searchParams.get("lat"));
    const lng = Number(url.searchParams.get("lng"));

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new RouteError(400, "lat and lng are required.");
    }

    let detectedCity: string | null = null;
    let detectedStateCode: string | null = null;
    let detectedState: string | null = null;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            accept: "application/json",
            "user-agent": "MasseurMatch/1.0 (reverse geocode)",
          },
          cache: "no-store",
        },
      );

      if (response.ok) {
        const payload = (await response.json()) as ReverseGeocodePayload;
        const address = payload.address || {};
        const isoState = address["ISO3166-2-lvl4"];
        detectedStateCode = typeof isoState === "string" ? isoState.split("-").pop() || null : null;
        detectedCity = address.city || address.town || address.village || address.municipality || address.county || null;
        detectedState = address.state || null;
      }
    } catch {
      // Keep going. The nearest-city fallback below is deterministic and does not require the upstream service.
    }

    const exact = findExactSupportedCity(detectedCity, detectedStateCode);
    const nearest = exact ? null : findNearestSupportedCity(lat, lng, detectedStateCode);
    const resolved = exact ?? nearest?.city ?? null;

    if (!resolved) {
      return json({
        ok: true,
        city: detectedCity,
        stateCode: detectedStateCode,
        state: detectedState,
        supported: false,
      });
    }

    return json({
      ok: true,
      city: resolved.name,
      stateCode: resolved.stateCode,
      state: resolved.stateName,
      slug: resolved.slug,
      supported: true,
      detectedCity,
      detectedStateCode,
      distanceMiles: nearest ? Number(nearest.distance.toFixed(1)) : 0,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
