"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, LocateFixed, MapPin, MapPinned } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { formatCityLabel, type CityData } from "@/data/cities";
import { cn } from "@/lib/utils";

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function matchCityInput(input: string, cities: CityData[]): CityData | null {
  const normalized = normalize(input);
  if (!normalized) return null;

  // Accept "Austin", "Austin, TX", "Austin TX", or the slug form.
  const [namePart, statePart] = normalized.split(",").map((part) => part.trim());
  const stateCode = (statePart || "").toUpperCase();

  return (
    cities.find(
      (city) =>
        normalize(city.name) === namePart &&
        (!statePart || city.stateCode.toLowerCase() === statePart),
    ) ||
    cities.find((city) => normalize(formatCityLabel(city.name, city.stateCode)) === normalized) ||
    cities.find((city) => city.slug === normalized.replace(/\s+/g, "-")) ||
    (stateCode ? null : cities.find((city) => normalize(city.name) === normalized)) ||
    null
  );
}

export function ExploreLocationFinder({ cities }: { cities: CityData[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const { city: detectedCity, status, error, requestLocation } = useGeolocation({
    autoLocate: true,
    storageKey: "mm:explore:location-city",
  });

  const suggestions = useMemo(
    () => cities.map((city) => formatCityLabel(city.name, city.stateCode)),
    [cities],
  );

  const goToCity = (city: CityData) => {
    router.push(`/${city.slug}`);
  };

  const handleUseMyLocation = async () => {
    setInputError(null);
    setLocating(true);
    try {
      const resolved = await requestLocation(true);
      if (resolved) {
        goToCity(resolved);
      }
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const matched = matchCityInput(query, cities);
    if (!matched) {
      setInputError("We couldn't find that city yet — try picking one from the list below.");
      return;
    }
    setInputError(null);
    goToCity(matched);
  };

  return (
    <div className="rounded-2xl border border-[#E8E8E8] bg-white p-4 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_12px_32px_rgba(17,17,17,0.05)] sm:p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8E8E8E]">
        Find therapists near you
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-[#D9D9D9] bg-[#FAFAFA] px-3.5 py-3 transition-colors focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/[0.18]">
          <MapPin className="h-4 w-4 shrink-0 text-[#8E8E8E]" strokeWidth={2.25} />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setInputError(null);
            }}
            list="explore-finder-cities"
            placeholder="Enter your city"
            aria-label="Search for your city"
            className="w-full bg-transparent text-sm font-medium text-[#111111] outline-none placeholder:text-[#8E8E8E]"
          />
          <datalist id="explore-finder-cities">
            {suggestions.map((label) => (
              <option key={label} value={label} />
            ))}
          </datalist>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6E1521] sm:flex-none"
          >
            Browse
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => void handleUseMyLocation()}
            disabled={locating}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 text-sm font-semibold text-[#111111] transition-colors hover:border-accent hover:text-accent sm:flex-none",
              locating && "cursor-wait opacity-70",
            )}
          >
            {locating ? (
              <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2.25} />
            ) : (
              <LocateFixed className="h-4 w-4" strokeWidth={2.25} />
            )}
            <span className="whitespace-nowrap">Use my location</span>
          </button>
        </div>
      </form>

      {inputError ? (
        <p className="mt-2.5 text-xs font-medium text-accent">{inputError}</p>
      ) : null}
      {!inputError && (status === "denied" || status === "error" || status === "unsupported") && error ? (
        <p className="mt-2.5 text-xs font-medium text-[#6F6F6F]">{error}</p>
      ) : null}

      {detectedCity ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-xs text-[#6F6F6F]">
            Near you:{" "}
            <span className="font-semibold text-[#111111]">
              {formatCityLabel(detectedCity.name, detectedCity.stateCode)}
            </span>
          </p>
          <button
            type="button"
            onClick={() => goToCity(detectedCity)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition-colors hover:text-[#6E1521]"
          >
            Browse therapists
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => router.push(`/explore/usa/${detectedCity.slug}`)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#6F6F6F] transition-colors hover:text-[#111111]"
          >
            <MapPinned className="h-3.5 w-3.5" strokeWidth={2.25} />
            Map view
          </button>
        </div>
      ) : null}
    </div>
  );
}
