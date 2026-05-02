"use client";

import { useCallback, useMemo, useRef } from "react";

import { useLocation } from "@/hooks/useLocation";
import { useResults } from "@/hooks/useResults";
import { Hero } from "@/components/homepage/Hero";
import { LocationPermission } from "@/components/homepage/LocationPermission";
import { ResultsGrid } from "@/components/homepage/ResultsGrid";
import { FeaturedRow } from "@/components/homepage/FeaturedRow";
import { TrustStrip } from "@/components/homepage/TrustStrip";
import { AvailableNowStrip } from "@/components/homepage/AvailableNowStrip";
import { ServicesBlock } from "@/components/homepage/ServicesBlock";
import { AreasBlock } from "@/components/homepage/AreasBlock";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { FinalCTA } from "@/components/homepage/FinalCTA";

type HomepageShellProps = {
  /** Fallback city from SSR (first city in inventory). */
  fallbackCity: string | null;
  /** Neighborhoods extracted from SSR therapist data for AreasBlock. */
  ssrNeighborhoods: string[];
};

export function HomepageShell({ fallbackCity, ssrNeighborhoods }: HomepageShellProps) {
  const searchInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const location = useLocation();
  const activeCity = location.city ?? fallbackCity;

  const { results, featured, loading, emptyState, refetch } = useResults({
    lat: location.lat,
    lng: location.lng,
    city: activeCity,
  });

  // Collect unique neighborhoods from results for AreasBlock
  const neighborhoods = useMemo(() => {
    const fromResults = results
      .map((r) => r.neighborhood)
      .filter((n): n is string => Boolean(n));
    const unique = Array.from(new Set([...fromResults, ...ssrNeighborhoods]));
    return unique.slice(0, 12);
  }, [results, ssrNeighborhoods]);

  const handleAllowLocation = useCallback(() => {
    location.requestGPS();
    location.markPrompted();
  }, [location]);

  const handleSearchManually = useCallback(() => {
    location.markPrompted();
    searchInputRef.current?.focus();
  }, [location]);

  // Combine results + featured for Available Now pool
  const allTherapists = useMemo(
    () => [...results, ...featured],
    [results, featured],
  );

  return (
    <div className="bg-bg-body text-text-primary">
      <Hero
        neighborhood={location.neighborhood}
        city={activeCity}
        searchInputRef={searchInputRef}
      />

      <LocationPermission
        visible={location.isFirstVisit && !location.prompted && !location.city}
        onAllowLocation={handleAllowLocation}
        onSearchManually={handleSearchManually}
      />

      <TrustStrip />

      <AvailableNowStrip items={allTherapists} city={activeCity} />

      <ResultsGrid
        results={results}
        loading={loading}
        emptyState={emptyState}
        onExpandRadius={refetch}
      />

      <FeaturedRow items={featured} />

      <ServicesBlock city={activeCity} />

      <AreasBlock city={activeCity} neighborhoods={neighborhoods} />

      <HowItWorks />

      <FinalCTA searchInputRef={searchInputRef} />
    </div>
  );
}
