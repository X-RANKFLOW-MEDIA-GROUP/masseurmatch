"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { requestJson } from "@/app/_lib/request";
import { US_CITIES, type CityData } from "@/data/cities";

type ReverseGeocodeResponse = {
  ok: boolean;
  city: string | null;
  stateCode: string | null;
  state: string | null;
};

type GeolocationStatus = "idle" | "checking" | "ready" | "unsupported" | "denied" | "error";

type IpCityResponse = {
  city?: string | null;
  stateCode?: string | null;
  region_code?: string | null;
  region?: string | null;
};

type UseGeolocationOptions = {
  autoLocate?: boolean;
  timeout?: number;
  maximumAge?: number;
  storageKey?: string;
};

const DEFAULT_STORAGE_KEY = "mm:geolocation-city";

function normalize(value: string | null | undefined) {
  return (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchCity(cityName: string | null, stateCode: string | null) {
  const normalizedCity = normalize(cityName);
  const normalizedStateCode = normalize(stateCode);

  if (!normalizedCity) {
    return null;
  }

  return (
    US_CITIES.find((city) => {
      const nameMatches = normalize(city.name) === normalizedCity;
      const stateMatches = !normalizedStateCode || normalize(city.stateCode) === normalizedStateCode;
      return nameMatches && stateMatches;
    }) || null
  );
}

function readStoredCity(storageKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return null;
    }

    const payload = JSON.parse(raw) as Partial<CityData>;
    const slug = payload.slug?.trim().toLowerCase();

    if (!slug) {
      return null;
    }

    return US_CITIES.find((city) => city.slug === slug) || null;
  } catch {
    return null;
  }
}

function persistCity(storageKey: string, city: CityData | null) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (!city) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(city));
  } catch {
    // Ignore storage failures so search still works without persistence.
  }
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    autoLocate = true,
    timeout = 8000,
    maximumAge = 300_000,
    storageKey = DEFAULT_STORAGE_KEY,
  } = options;

  const [city, setCityState] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompted, setPrompted] = useState(false);
  const [denied, setDenied] = useState(false);
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<Promise<CityData | null> | null>(null);

  const setCity = useCallback((nextCity: CityData | null) => {
    setCityState(nextCity);
    persistCity(storageKey, nextCity);

    if (nextCity) {
      setDenied(false);
      setError(null);
      setStatus("ready");
    }
  }, [storageKey]);

  const resolveCityFromIpFallback = useCallback(async () => {
    try {
      const response = await requestJson<IpCityResponse>("https://ipapi.co/json/", { cache: "no-store" });
      const stateCode = response.stateCode ?? response.region_code ?? null;
      const matchedCity = matchCity(response.city ?? null, stateCode);

      if (matchedCity) {
        setCity(matchedCity);
        return matchedCity;
      }
    } catch {
      // Ignore IP fallback failures and keep graceful defaults.
    }

    return null;
  }, [setCity]);

  const requestLocation = useCallback(async (userInitiated = true) => {
    if (typeof window === "undefined") {
      return null;
    }

    if (city) {
      return city;
    }

    if (!navigator.geolocation) {
      setLoading(false);
      setStatus("unsupported");
      setError("Location access is not available in this browser.");
      return null;
    }

    if (requestRef.current) {
      return requestRef.current;
    }

    setPrompted((current) => current || userInitiated);
    setLoading(true);
    setDenied(false);
    setError(null);
    setStatus("checking");

    requestRef.current = new Promise<CityData | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await requestJson<ReverseGeocodeResponse>(
              `/api/reverse-geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`,
              { cache: "no-store" },
            );

            const matchedCity = matchCity(response.city, response.stateCode);

            if (!matchedCity) {
              setStatus("error");
              setError("We found your location, but not a supported nearby city yet.");
              resolve(null);
              return;
            }

            setCity(matchedCity);
            resolve(matchedCity);
          } catch {
            setStatus("error");
            setError("We could not resolve your city right now.");
            resolve(null);
          } finally {
            requestRef.current = null;
            setLoading(false);
          }
        },
        (geoError) => {
          requestRef.current = null;
          setLoading(false);

          if (geoError.code === geoError.PERMISSION_DENIED) {
            setDenied(true);
            setStatus("denied");
            setError("Location permission was denied. We are using an approximate city instead.");
            resolveCityFromIpFallback().then(resolve);
            return;
          }

          setStatus("error");
          setError("We could not get your location right now. We are using an approximate city instead.");
          resolveCityFromIpFallback().then(resolve);
        },
        {
          enableHighAccuracy: false,
          timeout,
          maximumAge,
        },
      );
    });

    return requestRef.current;
  }, [city, maximumAge, resolveCityFromIpFallback, setCity, timeout]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedCity = readStoredCity(storageKey);

    if (storedCity) {
      setCityState(storedCity);
      setStatus("ready");
    }

    if (!navigator.geolocation) {
      setLoading(false);
      if (!storedCity) {
        setStatus("unsupported");
      }
      return;
    }

    if (!autoLocate || storedCity) {
      setLoading(false);
      if (!storedCity) {
        setStatus("idle");
      }
      return;
    }

    let cancelled = false;

    const maybeLocate = async () => {
      try {
        if (!navigator.permissions?.query) {
          if (!cancelled) {
            setLoading(false);
            setStatus("idle");
          }
          return;
        }

        const permission = await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });

        if (cancelled) {
          return;
        }

        if (permission.state === "granted") {
          await requestLocation(false);
          return;
        }

        if (permission.state === "denied") {
          setDenied(true);
          setStatus("denied");
          setError("Location permission is denied. Using an approximate city fallback.");
          await resolveCityFromIpFallback();
          setLoading(false);
          return;
        }

        setStatus("idle");
        setLoading(false);
      } catch {
        if (!cancelled) {
          setStatus("idle");
          setLoading(false);
        }
      }
    };

    void maybeLocate();

    return () => {
      cancelled = true;
    };
  }, [autoLocate, maximumAge, requestLocation, resolveCityFromIpFallback, storageKey, timeout]);

  return {
    city,
    loading,
    prompted,
    denied,
    status,
    error,
    requestLocation,
    setCity,
  };
}
