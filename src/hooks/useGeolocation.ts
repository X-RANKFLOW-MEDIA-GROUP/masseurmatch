import { useState, useEffect, useCallback } from "react";
import { US_CITIES, CityData } from "@/data/cities";

interface GeoState {
  city: CityData | null;
  loading: boolean;
  denied: boolean;
  prompted: boolean;
}

const STORAGE_KEY = "mm_detected_city";

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Major US city coordinates for matching
const CITY_COORDS: Record<string, [number, number]> = {
  "new-york": [40.7128, -74.006],
  "los-angeles": [34.0522, -118.2437],
  chicago: [41.8781, -87.6298],
  houston: [29.7604, -95.3698],
  phoenix: [33.4484, -112.074],
  philadelphia: [39.9526, -75.1652],
  "san-antonio": [29.4241, -98.4936],
  "san-diego": [32.7157, -117.1611],
  dallas: [32.7767, -96.797],
  austin: [30.2672, -97.7431],
  jacksonville: [30.3322, -81.6557],
  "san-jose": [37.3382, -121.8863],
  "fort-worth": [32.7555, -97.3308],
  columbus: [39.9612, -82.9988],
  charlotte: [35.2271, -80.8431],
  indianapolis: [39.7684, -86.1581],
  "san-francisco": [37.7749, -122.4194],
  seattle: [47.6062, -122.3321],
  denver: [39.7392, -104.9903],
  "washington-dc": [38.9072, -77.0369],
  nashville: [36.1627, -86.7816],
  "oklahoma-city": [35.4676, -97.5164],
  "el-paso": [31.7619, -106.485],
  boston: [42.3601, -71.0589],
  portland: [45.5152, -122.6784],
  "las-vegas": [36.1699, -115.1398],
  memphis: [35.1495, -90.049],
  louisville: [38.2527, -85.7585],
  baltimore: [39.2904, -76.6122],
  milwaukee: [43.0389, -87.9065],
  albuquerque: [35.0844, -106.6504],
  tucson: [32.2226, -110.9747],
  fresno: [36.7378, -119.7871],
  sacramento: [38.5816, -121.4944],
  mesa: [33.4152, -111.8315],
  "kansas-city": [39.0997, -94.5786],
  atlanta: [33.749, -84.388],
  omaha: [41.2565, -95.9345],
  "colorado-springs": [38.8339, -104.8214],
  raleigh: [35.7796, -78.6382],
  "long-beach": [33.77, -118.1937],
  "virginia-beach": [36.8529, -75.978],
  miami: [25.7617, -80.1918],
  "oakland": [37.8044, -122.2712],
  minneapolis: [44.9778, -93.265],
  tampa: [27.9506, -82.4572],
  "new-orleans": [29.9511, -90.0715],
  cleveland: [41.4993, -81.6944],
  "st-louis": [38.627, -90.1994],
  pittsburgh: [40.4406, -79.9959],
  cincinnati: [39.1031, -84.512],
  orlando: [28.5383, -81.3792],
  "salt-lake-city": [40.7608, -111.891],
  detroit: [42.3314, -83.0458],
  honolulu: [21.3069, -157.8583],
};

function findNearestCity(lat: number, lon: number): CityData | null {
  let minDist = Infinity;
  let nearest: CityData | null = null;

  for (const city of US_CITIES) {
    const coords = CITY_COORDS[city.slug];
    if (!coords) continue;
    const dist = haversine(lat, lon, coords[0], coords[1]);
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }

  // Only match if within ~150km
  if (minDist > 150) return null;
  return nearest;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    city: null,
    loading: false,
    denied: false,
    prompted: false,
  });

  // Check cached city on mount
  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as CityData;
        const match = US_CITIES.find((c) => c.slug === parsed.slug);
        if (match) {
          setState({ city: match, loading: false, denied: false, prompted: true });
        }
      } catch { /* ignore */ }
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, denied: true, prompted: true }));
      return;
    }

    setState((s) => ({ ...s, loading: true, prompted: true }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearestCity(pos.coords.latitude, pos.coords.longitude);
        if (nearest) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nearest));
        }
        setState({ city: nearest, loading: false, denied: false, prompted: true });
      },
      () => {
        setState((s) => ({ ...s, loading: false, denied: true }));
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  const setCity = useCallback((city: CityData | null) => {
    if (city) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setState({ city, loading: false, denied: false, prompted: true });
  }, []);

  return { ...state, requestLocation, setCity };
}
