"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { getCities } from "@/app/_lib/directory";
import { requestJson } from "@/app/_lib/request";
import { PRIORITY_CITY_SLUGS } from "@/lib/marketing/home-data";

type ReverseGeocodeResponse = {
  ok: boolean;
  city: string | null;
  stateCode: string | null;
  state: string | null;
};

const CHECKING_MESSAGE = "Checking your location…";
const FALLBACK_MESSAGE = "Pick a city below to browse the directory.";

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
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

// Top markets first, falling back to the first cities in the directory so the
// page always has clickable links to offer.
function browseCities() {
  const all = getCities();
  const priority = PRIORITY_CITY_SLUGS.flatMap((slug) => {
    const city = all.find((c) => c.slug === slug);
    return city ? [city] : [];
  });
  return priority.length > 0 ? priority : all.slice(0, 12);
}

export function NearMeRedirect() {
  const router = useRouter();
  const cities = useMemo(() => browseCities(), []);
  const [message, setMessage] = useState(CHECKING_MESSAGE);

  useEffect(() => {
    // Guard against SSR, browsers without geolocation, and an empty directory —
    // in every case we just present the clickable city list below.
    if (typeof navigator === "undefined" || !navigator.geolocation || cities.length === 0) {
      setMessage(FALLBACK_MESSAGE);
      return;
    }

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await requestJson<ReverseGeocodeResponse>(
            `/api/reverse-geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`,
          );
          const matchedCity = matchCity(response.city, response.stateCode);
          if (cancelled) return;
          if (matchedCity) {
            router.replace(`/${matchedCity.slug}`);
          } else {
            setMessage(FALLBACK_MESSAGE);
          }
        } catch {
          if (!cancelled) setMessage(FALLBACK_MESSAGE);
        }
      },
      () => {
        // Permission denied, dismissed, or timed out — never leave the user stuck.
        if (!cancelled) setMessage(FALLBACK_MESSAGE);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );

    return () => {
      cancelled = true;
    };
  }, [router, cities]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <MapPin className="h-4 w-4 text-primary" strokeWidth={2.25} aria-hidden />
        {message}
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cities.map((city) => (
          <li key={city.slug}>
            <Link
              href={`/${city.slug}`}
              className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-accent"
            >
              <span>
                {city.name}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {city.stateCode}
                </span>
              </span>
              <ArrowUpRight
                className="h-4 w-4 text-muted-foreground transition group-hover:text-primary"
                strokeWidth={2.25}
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
