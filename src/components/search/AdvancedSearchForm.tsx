"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { SearchFilters, type AdvancedSearchState } from "./SearchFilters";

type AdvancedSearchFormProps = {
  onSubmit?: (filters: AdvancedSearchState) => void;
};

const DEFAULT_FILTERS: AdvancedSearchState = {
  query: "",
  minPrice: 30,
  maxPrice: 200,
  minRating: 4,
  radiusMiles: 25,
  verifiedOnly: false,
  specialties: [],
  languages: [],
};

export function AdvancedSearchForm({ onSubmit }: AdvancedSearchFormProps) {
  const [filters, setFilters] = useState<AdvancedSearchState>(DEFAULT_FILTERS);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(filters);
      }}
    >
      <SearchFilters value={filters} onChange={setFilters} />

      <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        Map integration placeholder: wire this section to a map provider to update radius/coordinates in real-time.
      </div>

      <div className="flex gap-3">
        <Button type="submit">Apply filters</Button>
        <Button type="button" variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
          Reset
        </Button>
      </div>
    </form>
  );
}
