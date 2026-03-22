"use client";

import { SearchDirectory } from "@/app/_components/search-directory";
import type { PublicTherapist, TherapistTier } from "@/app/_lib/directory";
import type { DirectorySession } from "@/components/sections/AdvancedDirectoryFilter";
import type { CityData } from "@/data/cities";

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
  return <SearchDirectory cities={cities} items={items} total={total} filters={filters} />;
}
