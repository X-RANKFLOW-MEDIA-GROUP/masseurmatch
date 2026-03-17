"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { City, Therapist, TherapistTier } from "@/mm/types";
import { Select } from "@/mm/components/primitives";
import { TherapistCard } from "@/mm/components/therapist-card";

export function SearchDirectory({ cities, therapists }: { cities: City[]; therapists: Therapist[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [modality, setModality] = useState(searchParams.get("modality") || "");
  const [tier, setTier] = useState(searchParams.get("tier") || "");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const params = new URLSearchParams();

    if (query) params.set("q", query);
    if (city) params.set("city", city);
    if (modality) params.set("modality", modality);
    if (tier) params.set("tier", tier);

    startTransition(() => {
      router.replace(`/search${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
    });
  }, [city, modality, query, router, tier]);

  const results = useMemo(() => {
    return therapists.filter((therapist) => {
      const matchesQuery = deferredQuery
        ? [therapist.displayName, therapist.bio, therapist.modalities.join(" "), therapist.keywordSlugs.join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(deferredQuery.toLowerCase())
        : true;
      const matchesCity = city ? therapist.citySlug === city : true;
      const matchesModality = modality ? therapist.modalities.includes(modality) : true;
      const matchesTier = tier ? therapist.tier === (tier as TherapistTier) : true;

      return matchesQuery && matchesCity && matchesModality && matchesTier;
    });
  }, [city, deferredQuery, modality, therapists, tier]);

  const modalities = Array.from(new Set(therapists.flatMap((therapist) => therapist.modalities))).sort();

  return (
    <div className="space-y-8">
      <div className="grid gap-4 rounded-[28px] border border-border bg-card p-5 shadow-soft md:grid-cols-[1.5fr,1fr,1fr,1fr]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, modality, or profile detail"
          className="w-full rounded-2xl border border-input bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <Select value={city} onChange={(event) => setCity(event.target.value)}>
          <option value="">All cities</option>
          {cities.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select value={modality} onChange={(event) => setModality(event.target.value)}>
          <option value="">All modalities</option>
          {modalities.map((item) => (
            <option key={item} value={item}>
              {item.replace(/-/g, " ")}
            </option>
          ))}
        </Select>
        <Select value={tier} onChange={(event) => setTier(event.target.value)}>
          <option value="">All tiers</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="featured">Featured</option>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {results.map((therapist) => {
          const cityRecord = cities.find((item) => item.slug === therapist.citySlug);
          return <TherapistCard key={therapist.id} therapist={therapist} city={cityRecord} />;
        })}
      </div>
    </div>
  );
}
