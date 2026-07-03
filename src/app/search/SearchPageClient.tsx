"use client";

import { useEffect } from "react";
import { SearchDirectory } from "@/app/_components/search-directory";
import type { PublicTherapist, TherapistTier } from "@/app/_lib/directory";
import type { DirectorySession } from "@/components/sections/AdvancedDirectoryFilter";
import type { CityData } from "@/data/cities";
import { trackSearch } from "@/app/_lib/analytics-events";

type SearchPageClientProps = {
  cities: CityData[];
  items: PublicTherapist[];
  total: number;
  filters: {
    city: string;
    modality: string;
    keyword: string;
    session: DirectorySession;
    goal: string;
    verified: boolean;
    availableToday: boolean;
    masterOnly: boolean;
    tier: TherapistTier | "";
    lgbtqAffirming: boolean;
  };
};

export default function SearchPageClient({
  cities,
  items,
  total,
  filters,
}: SearchPageClientProps) {
  useEffect(() => {
    // Track search query
    const searchQuery = filters.keyword || filters.modality || "directory browse";

    trackSearch({
      query: searchQuery,
      city: filters.city || undefined,
      filters: {
        modality: filters.modality,
        session: filters.session,
        tier: filters.tier,
        verified: filters.verified,
        lgbtq: filters.lgbtqAffirming,
      },
    });
  }, [filters]);

  return <SearchDirectory cities={cities} items={items} total={total} filters={filters} />;
}
