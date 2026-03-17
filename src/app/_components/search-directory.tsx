"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { PublicTherapist, TherapistTier } from "@/app/_lib/directory";
import { withSearchParams } from "@/app/_lib/request";
import { EmptyState, Surface } from "@/app/_components/primitives";
import { TherapistCard } from "@/app/_components/therapist-card";
import type { CityData } from "@/data/cities";

export function SearchDirectory({
  cities,
  items,
  total,
  filters,
}: {
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
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [city, setCity] = useState(filters.city);
  const [modality, setModality] = useState(filters.modality);
  const [session, setSession] = useState(filters.session);
  const [goal, setGoal] = useState(filters.goal);
  const [tier, setTier] = useState<TherapistTier | "">(filters.tier);

  useEffect(() => {
    setCity(filters.city);
    setModality(filters.modality);
    setSession(filters.session);
    setGoal(filters.goal);
    setTier(filters.tier);
  }, [filters.city, filters.goal, filters.modality, filters.session, filters.tier]);

  const applyFilters = () => {
    router.push(
      withSearchParams(pathname || "/search", {
        city,
        modality,
        session,
        goal,
        tier,
      }),
    );
  };

  return (
    <section className="mt-8">
      {(session || goal) ? (
        <div className="mb-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {session ? (
            <span className="rounded-full border border-border bg-secondary/60 px-3 py-2 text-foreground">
              Session: {session.replace(/-/g, " ")}
            </span>
          ) : null}
          {goal ? (
            <span className="rounded-full border border-border bg-secondary/60 px-3 py-2 text-foreground">
              Goal: {goal.replace(/-/g, " ")}
            </span>
          ) : null}
        </div>
      ) : null}

      <Surface className="grid gap-3 p-5 md:grid-cols-4">
        <select
          className="rounded-md border border-border bg-background px-3 py-2"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        >
          <option value="">All cities</option>
          {cities.slice(0, 200).map((item) => (
            <option key={item.slug} value={item.name}>
              {item.name}, {item.stateCode}
            </option>
          ))}
        </select>

        <input
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="Massage specialty"
          value={modality}
          onChange={(event) => setModality(event.target.value)}
        />

        <select
          className="rounded-md border border-border bg-background px-3 py-2"
          value={tier}
          onChange={(event) => setTier((event.target.value as TherapistTier | "") || "")}
        >
          <option value="">All tiers</option>
          <option value="free">Free</option>
          <option value="standard">Standard</option>
          <option value="pro">Pro</option>
          <option value="elite">Elite</option>
        </select>

        <button
          className="rounded-md border border-border px-3 py-2 font-semibold hover:bg-accent"
          onClick={applyFilters}
        >
          Apply filters
        </button>
      </Surface>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {total} therapist {total === 1 ? "listing" : "listings"} available
        </p>
        <button
          className="text-sm font-semibold text-primary hover:underline"
          onClick={() => {
            setCity("");
            setModality("");
            setSession("");
            setGoal("");
            setTier("");
            router.push(pathname || "/search");
          }}
        >
          Reset search
        </button>
      </div>

      {items.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <TherapistCard key={item.id} therapist={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          title="No therapist listings matched this search."
          description="Try a nearby city, a broader specialty term, or clear the current filters to see the full directory."
        />
      )}
    </section>
  );
}
