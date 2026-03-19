"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { PublicTherapist, TherapistTier } from "@/app/_lib/directory";
import { withSearchParams } from "@/app/_lib/request";
import { EmptyState, Surface } from "@/app/_components/primitives";
import { TherapistCard } from "@/app/_components/therapist-card";
import type { CityData } from "@/data/cities";

const MATCHMAKER_TAGS = [
  { id: "deep-tissue", label: "Deep Tissue" },
  { id: "home-visit", label: "Home Visit" },
  { id: "verified", label: "Verified" },
] as const;

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
    keyword: string;
    session: string;
    goal: string;
    verified: boolean;
    tier: TherapistTier | "";
  };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [city, setCity] = useState(filters.city);
  const [modality, setModality] = useState(filters.modality);
  const [keyword, setKeyword] = useState(filters.keyword);
  const [session, setSession] = useState(filters.session);
  const [goal, setGoal] = useState(filters.goal);
  const [verified, setVerified] = useState(filters.verified);
  const [tier, setTier] = useState<TherapistTier | "">(filters.tier);

  useEffect(() => {
    setCity(filters.city);
    setModality(filters.modality);
    setKeyword(filters.keyword);
    setSession(filters.session);
    setGoal(filters.goal);
    setVerified(filters.verified);
    setTier(filters.tier);
  }, [filters.city, filters.goal, filters.keyword, filters.modality, filters.session, filters.tier, filters.verified]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextUrl = withSearchParams(pathname || "/search", {
        city,
        modality,
        keyword,
        session,
        goal,
        verified: verified ? "1" : "",
        tier,
      });
      startTransition(() => {
        router.replace(nextUrl);
      });
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [city, goal, keyword, modality, pathname, router, session, tier, verified]);

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const searchable = [
        item.display_name,
        item.full_name,
        item.bio,
        item.modality,
        ...(item.specialties || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesModality = modality ? searchable.includes(modality.toLowerCase()) : true;
      const matchesKeyword = keyword ? searchable.includes(keyword.toLowerCase()) : true;
      const matchesSession =
        session === "home-visit"
          ? Boolean(item.outcall_price)
          : session === "incall"
            ? Boolean(item.incall_price)
            : true;
      const matchesVerified =
        verified
          ? item._tier === "standard" || item._tier === "pro" || item._tier === "elite" || Boolean(item.is_verified_identity) || Boolean(item.is_verified_profile)
          : true;

      return matchesModality && matchesKeyword && matchesSession && matchesVerified;
    });
  }, [items, keyword, modality, session, verified]);

  const toggleTag = (tagId: (typeof MATCHMAKER_TAGS)[number]["id"]) => {
    if (tagId === "deep-tissue") {
      const nextKeyword = keyword.toLowerCase().includes("deep") ? "" : "deep tissue";
      const nextModality = modality.toLowerCase().includes("deep") ? "" : modality || "deep tissue";
      setKeyword(nextKeyword);
      setModality(nextModality);
      return;
    }

    if (tagId === "home-visit") {
      setSession((prev) => (prev === "home-visit" ? "" : "home-visit"));
      return;
    }

    setVerified((prev) => !prev);
  };

  return (
    <section className="mt-8">
      {(session || goal || verified || keyword) ? (
        <div className="mb-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {session ? (
            <span className="rounded-full border border-border bg-secondary/60 px-3 py-2 text-foreground">
              Session: {session.replace(/-/g, " ")}
            </span>
          ) : null}
          {verified ? (
            <span className="rounded-full border border-border bg-secondary/60 px-3 py-2 text-foreground">
              Verified only
            </span>
          ) : null}
          {keyword ? (
            <span className="rounded-full border border-border bg-secondary/60 px-3 py-2 text-foreground">
              Keyword: {keyword}
            </span>
          ) : null}
          {goal ? (
            <span className="rounded-full border border-border bg-secondary/60 px-3 py-2 text-foreground">
              Goal: {goal.replace(/-/g, " ")}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {MATCHMAKER_TAGS.map((tag) => {
          const active =
            tag.id === "deep-tissue"
              ? keyword.toLowerCase().includes("deep") || modality.toLowerCase().includes("deep")
              : tag.id === "home-visit"
                ? session === "home-visit"
                : verified;

          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              aria-pressed={active}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary"
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

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

        <input
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="Keyword (deep tissue, thai, recovery)"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
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
      </Surface>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {visibleItems.length} therapist {visibleItems.length === 1 ? "listing" : "listings"} matching now
          {total !== visibleItems.length ? ` · ${total} indexed` : ""}
          {isPending ? " · updating" : ""}
        </p>
        <button
          className="text-sm font-semibold text-primary hover:underline"
          onClick={() => {
            setCity("");
            setModality("");
            setKeyword("");
            setSession("");
            setGoal("");
            setVerified(false);
            setTier("");
            router.push(pathname || "/search");
          }}
        >
          Reset search
        </button>
      </div>

      {visibleItems.length > 0 ? (
        <div className="stagger-grid mt-6 grid gap-4 lg:grid-cols-2">
          {visibleItems.map((item) => (
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
