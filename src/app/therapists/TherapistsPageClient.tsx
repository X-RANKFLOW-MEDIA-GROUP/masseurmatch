"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PublicTherapistCard } from "@/app/_components/PublicTherapistCard";
import type { PublicTherapist } from "@/app/_lib/directory";

type TherapistsPageClientProps = {
  items: PublicTherapist[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    city: string;
    modality: string;
    tier: string;
  };
};

export default function TherapistsPageClient({
  items,
  total,
  page,
  totalPages,
  filters,
}: TherapistsPageClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [city, setCity] = useState(filters.city);
  const [modality, setModality] = useState(filters.modality);
  const [tier, setTier] = useState(filters.tier);

  useEffect(() => {
    setCity(filters.city);
    setModality(filters.modality);
    setTier(filters.tier);
  }, [filters.city, filters.modality, filters.tier]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams();

    if (key === "city" ? value : city) {
      next.set("city", key === "city" ? value : city);
    }

    if (key === "modality" ? value : modality) {
      next.set("modality", key === "modality" ? value : modality);
    }

    if (key === "tier" ? value : tier) {
      next.set("tier", key === "tier" ? value : tier);
    }

    const nextPage = key === "page" ? value : "1";
    if (nextPage && nextPage !== "1") {
      next.set("page", nextPage);
    }

    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname || "/therapists");
  };

  return (
    <section className="mt-8">
      <div className="grid gap-3 rounded-2xl border border-border bg-background p-4 shadow-sm md:grid-cols-2">
        <div>
          <label htmlFor="therapists-filter-city" className="sr-only">Filter by city</label>
          <input
            id="therapists-filter-city"
            value={city}
            onChange={(event) => {
              const value = event.target.value;
              setCity(value);
              setParam("city", value);
            }}
            placeholder="Filter by city"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="therapists-filter-specialty" className="sr-only">Filter by specialty</label>
          <input
            id="therapists-filter-specialty"
            value={modality}
            onChange={(event) => {
              const value = event.target.value;
              setModality(value);
              setParam("modality", value);
            }}
            placeholder="Filter by specialty"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {total} public therapist {total === 1 ? "listing" : "listings"}
        </p>
        <button
          type="button"
          className="text-sm font-semibold text-primary hover:underline"
          onClick={() => {
            setCity("");
            setModality("");
            setTier("");
            router.push(pathname || "/therapists");
          }}
        >
          Reset filters
        </button>
      </div>

      {items.length > 0 ? (
        <div className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {items.map((item) => (
            <PublicTherapistCard key={item.id} therapist={item} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-border px-6 py-10 text-center">
          <h2 className="text-xl font-semibold text-foreground">No therapist listings matched this view.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Clear the filters to return to the full directory or try a broader city or specialty keyword.
          </p>
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          disabled={page <= 1}
          aria-label="Go to previous directory page"
          onClick={() => setParam("page", String(Math.max(1, page - 1)))}
          className="rounded border border-border px-3 py-1.5 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          aria-label="Go to next directory page"
          onClick={() => setParam("page", String(Math.min(totalPages, page + 1)))}
          className="rounded border border-border px-3 py-1.5 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  );
}
