/**
 * Geo utilities: reverse geocoding, city name normalization, and localStorage caching.
 */

const GEO_CACHE_KEY = "mm:geo-cache";
const GEO_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export type GeoLocation = {
  city: string;
  neighborhood: string | null;
  lat: number;
  lng: number;
  source: "gps" | "ip" | "manual";
};

type GeoCacheEntry = GeoLocation & { ts: number };

/** Normalize a city name for comparison: lowercase, trim, strip accents. */
export function normalizeCity(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

/** Read a cached geo result from localStorage (returns null if stale or absent). */
export function readGeoCache(): GeoLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const entry: GeoCacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > GEO_CACHE_TTL_MS) {
      window.localStorage.removeItem(GEO_CACHE_KEY);
      return null;
    }
    const { ts: _, ...location } = entry;
    return location;
  } catch {
    return null;
  }
}

/** Persist a geo result to localStorage. */
export function writeGeoCache(location: GeoLocation): void {
  if (typeof window === "undefined") return;
  try {
    const entry: GeoCacheEntry = { ...location, ts: Date.now() };
    window.localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Storage full or disabled — ignore.
  }
}

/** Call the /api/reverse-geocode endpoint to resolve lat/lng → city + neighborhood. */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{ city: string | null; neighborhood: string | null; stateCode: string | null }> {
  const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`, {
    cache: "no-store",
  });
  if (!res.ok) return { city: null, neighborhood: null, stateCode: null };
  const data = await res.json();
  return {
    city: data.city ?? null,
    neighborhood: data.neighborhood ?? data.district ?? null,
    stateCode: data.stateCode ?? null,
  };
}
