"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCities } from "@/app/_lib/directory";
import { requestJson } from "@/app/_lib/request";

type ReverseGeocodeResponse = {
  ok: boolean;
  city: string | null;
  stateCode: string | null;
  state: string | null;
};

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function resolveFallbackPath() {
  const fallbackCity = getCities()[0];
  return fallbackCity ? `/${fallbackCity.slug}` : "/search";
}

function matchCity(cityName: string | null, stateCode: string | null) {
  const normalizedCity = normalize(cityName);
  const normalizedStateCode = normalize(stateCode);

  return getCities().find((city) => {
    const sameName = normalize(city.name) === normalizedCity;
    const sameState = !normalizedStateCode || normalize(city.stateCode) === normalizedStateCode;
    return sameName && sameState;
  });
}

export function NearMeRedirect() {
  const router = useRouter();

  useEffect(() => {
    const fallbackPath = resolveFallbackPath();

    if (!navigator.geolocation) {
      router.replace(fallbackPath);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await requestJson<ReverseGeocodeResponse>(
            `/api/reverse-geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`,
          );
          const matchedCity = matchCity(response.city, response.stateCode);
          router.replace(matchedCity ? `/${matchedCity.slug}` : fallbackPath);
        } catch {
          router.replace("/search");
        }
      },
      () => router.replace(fallbackPath),
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300_000,
      },
    );
  }, [router]);

  return <p className="text-muted-foreground">Finding nearby therapists...</p>;
}
