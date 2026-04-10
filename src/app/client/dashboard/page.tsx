"use client";

import { useMemo, useState } from "react";

import { AdvancedSearchForm } from "@/components/search/AdvancedSearchForm";

import { FavoriteTherapists, type FavoriteTherapist } from "./_components/FavoriteTherapists";
import { InquirySummary } from "./_components/InquirySummary";
import { SearchHistory, type SearchHistoryItem } from "./_components/SearchHistory";

const MOCK_FAVORITES: FavoriteTherapist[] = [
  { id: "1", name: "Bruno", city: "Dallas, TX", specialties: ["Deep Tissue", "Sports"] },
  { id: "2", name: "Alex", city: "Austin, TX", specialties: ["Swedish", "Relaxation"] },
];

const MOCK_HISTORY: SearchHistoryItem[] = [
  { id: "h1", query: "deep tissue dallas", createdAt: "2026-04-09T19:22:00.000Z", filters: ["Verified", "$80-$140"] },
  { id: "h2", query: "mobile massage", createdAt: "2026-04-08T13:05:00.000Z", filters: ["Spanish", "4★+"] },
];

export default function ClientDashboardPage() {
  const [searchCount, setSearchCount] = useState(MOCK_HISTORY.length);

  const summary = useMemo(
    () => ({
      totalSent: 12,
      awaitingResponse: 3,
      responded: 9,
    }),
    [],
  );

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Client dashboard</h1>
        <p className="text-sm text-muted-foreground">Track inquiries, favorites, and search activity in one place.</p>
      </header>

      <InquirySummary {...summary} />

      <section className="grid gap-6 lg:grid-cols-2">
        <FavoriteTherapists therapists={MOCK_FAVORITES} />
        <SearchHistory items={MOCK_HISTORY.slice(0, searchCount)} />
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Advanced search</h2>
        <p className="mb-4 text-sm text-muted-foreground">Use filters to quickly find the right therapist match.</p>
        <AdvancedSearchForm
          onSubmit={() => {
            setSearchCount((current) => Math.max(current, 2));
          }}
        />
      </section>
    </main>
  );
}
