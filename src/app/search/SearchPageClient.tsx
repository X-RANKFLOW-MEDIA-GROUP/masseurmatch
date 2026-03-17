"use client";

import { SearchDirectory } from "@/app/_components/search-directory";
import type { PublicTherapist, TherapistTier } from "@/app/_lib/directory";
import type { CityData } from "@/data/cities";

type SearchPageClientProps = {
  cities: CityData[];
  items: PublicTherapist[];
  total: number;
  filters: {
    city: string;
    modality: string;
    session: string;
    goal: string;
    tier: TherapistTier | "";
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
