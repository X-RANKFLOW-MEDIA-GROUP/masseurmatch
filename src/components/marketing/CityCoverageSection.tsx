"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { US_CITIES } from "@/data/cities";

const INITIAL_COUNT = 60;
const sorted = [...US_CITIES].sort((a, b) => a.name.localeCompare(b.name));

export function CityCoverageSection() {
  const [showAll, setShowAll] = useState(false);
  const cities = showAll ? sorted : sorted.slice(0, INITIAL_COUNT);

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">All cities A–Z</p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">
            Browse all {sorted.length} covered cities
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="group rounded-2xl border border-border bg-card px-3 py-2.5 text-center transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <p className="text-sm font-semibold group-hover:text-primary">{city.name}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{city.stateCode}</p>
            </Link>
          ))}
        </div>

        {!showAll && sorted.length > INITIAL_COUNT && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 text-sm font-semibold transition hover:text-primary"
            >
              View all {sorted.length} cities
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {showAll && (
          <div className="mt-6 text-center">
            <Link
              href="/cities"
              className="inline-flex items-center gap-2 text-sm font-semibold transition hover:text-primary"
            >
              View all cities &amp; service pages
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
