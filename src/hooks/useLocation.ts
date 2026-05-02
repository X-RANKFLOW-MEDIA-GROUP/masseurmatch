"use client";

import { useCallback, useEffect, useState } from "react";

import { type GeoLocation, readGeoCache, reverseGeocode, writeGeoCache } from "@/lib/geo";
import { trackEvent } from "@/lib/tracking";
import { US_CITIES, type CityData } from "@/data/cities";

type LocationSource = "gps" | "ip" | "manual";

export type LocationState = {
  city: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  source: LocationSource | null;
  loading: boolean;
  error: string | null;
  prompted: boolean;
};

const FIRST_VISIT_KEY = "mm:location-prompted";

function matchCityData(cityName: string | null): CityData | null {
  if (!cityName) return null;
  const normalized = cityName.trim().toLowerCase();
  return US_CITIES.find((c) => c.name.toLowerCase() === normalized || c.slug === normalized) ?? null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    city: null,
    neighborhood: null,
    lat: null,
    lng: null,
    source: null,
    loading: true,
    error: null,
    prompted: false,
  });

  // On mount: check cache first
  useEffect(() => {
    const cached = readGeoCache();
    if (cached) {
      setState({
        city: cached.city,
        neighborhood: cached.neighborhood,
        lat: cached.lat,
        lng: cached.lng,
        source: cached.source,
        loading: false,
        error: null,
        prompted: true,
      });
    } else {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const requestGPS = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by your browser.",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null, prompted: true }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 300_000,
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;
      const geo = await reverseGeocode(lat, lng);

      const location: GeoLocation = {
        city: geo.city ?? "Unknown",
        neighborhood: geo.neighborhood,
        lat,
        lng,
        source: "gps",
      };

      writeGeoCache(location);
      trackEvent("location_allowed", { source: "gps", city: location.city });

      setState({
        ...location,
        loading: false,
        error: null,
        prompted: true,
      });
    } catch (err) {
      const message =
        err instanceof GeolocationPositionError && err.code === err.PERMISSION_DENIED
          ? "Location permission was denied."
          : "Could not determine your location.";
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, []);

  const requestIP = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch("/api/geolocate-ip", { cache: "no-store" });
      if (!res.ok) throw new Error("IP geolocation failed");
      const data = await res.json();

      const location: GeoLocation = {
        city: data.city ?? "Unknown",
        neighborhood: data.neighborhood ?? null,
        lat: data.lat ?? 0,
        lng: data.lng ?? 0,
        source: "ip",
      };

      writeGeoCache(location);

      setState({
        ...location,
        loading: false,
        error: null,
        prompted: true,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Could not determine location from IP.",
      }));
    }
  }, []);

  const setManualCity = useCallback((cityName: string) => {
    const matched = matchCityData(cityName);
    if (!matched) {
      setState((prev) => ({
        ...prev,
        error: `"${cityName}" is not a supported city yet.`,
      }));
      return;
    }

    const location: GeoLocation = {
      city: matched.name,
      neighborhood: null,
      lat: 0,
      lng: 0,
      source: "manual",
    };

    writeGeoCache(location);

    setState({
      ...location,
      loading: false,
      error: null,
      prompted: true,
    });
  }, []);

  const isFirstVisit =
    typeof window !== "undefined"
      ? !window.localStorage.getItem(FIRST_VISIT_KEY)
      : true;

  const markPrompted = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(FIRST_VISIT_KEY, "1");
    }
    setState((prev) => ({ ...prev, prompted: true }));
  }, []);

  return {
    ...state,
    isFirstVisit,
    requestGPS,
    requestIP,
    setManualCity,
    markPrompted,
  };
}
