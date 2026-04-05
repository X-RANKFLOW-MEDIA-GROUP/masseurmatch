"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { PublicTherapist, TherapistTier } from "@/app/_lib/directory";
import { GeoAreaCallout } from "@/app/_components/geo-area-callout";
import { PublicTherapistCard } from "@/app/_components/PublicTherapistCard";
import { withSearchParams } from "@/app/_lib/request";
import {
  AdvancedDirectoryFilter,
  getDirectoryObjectiveSearchValue,
  type AdvancedDirectoryFilterState,
  type DirectorySession,
} from "@/components/sections/AdvancedDirectoryFilter";
import type { CityData } from "@/data/cities";
import {
  buildPhysicalSearchTerms,
  matchBodyTypeKeyword,
  normalizeBodyTypeValue,
} from "@/lib/physical-profile";

const normalizeText = (value: string | null | undefined) =>
  (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getYearsExperience = (therapist: PublicTherapist) => {
  if (typeof therapist.years_experience === "number" && therapist.years_experience > 0) {
    return therapist.years_experience;
  }

  if (typeof therapist.start_year === "number" && therapist.start_year > 0) {
    return new Date().getFullYear() - therapist.start_year;
  }

  return null;
};

export function SearchDirectory({
  cities,
  items,
  total,
  filters,
}: {
  cities: CityData[];
  items: PublicTherapist[];
  total: number;
  filters: AdvancedDirectoryFilterState;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [city, setCity] = useState(filters.city);
  const [modality, setModality] = useState(filters.modality);
  const [keyword, setKeyword] = useState(filters.keyword);
  const [session, setSession] = useState<DirectorySession>(filters.session);
  const [goal, setGoal] = useState(filters.goal);
  const [verified, setVerified] = useState(filters.verified);
  const [availableToday, setAvailableToday] = useState(filters.availableToday);
  const [masterOnly, setMasterOnly] = useState(filters.masterOnly);
  const [tier, setTier] = useState<TherapistTier | "">(filters.tier);
  const [lgbtqAffirming, setLgbtqAffirming] = useState(filters.lgbtqAffirming);

  useEffect(() => {
    setCity(filters.city);
    setModality(filters.modality);
    setKeyword(filters.keyword);
    setSession(filters.session);
    setGoal(filters.goal);
    setVerified(filters.verified);
    setAvailableToday(filters.availableToday);
    setMasterOnly(filters.masterOnly);
    setTier(filters.tier);
    setLgbtqAffirming(filters.lgbtqAffirming);
  }, [
    filters.availableToday,
    filters.city,
    filters.goal,
    filters.keyword,
    filters.lgbtqAffirming,
    filters.masterOnly,
    filters.modality,
    filters.session,
    filters.tier,
    filters.verified,
  ]);

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
        available: availableToday ? "1" : "",
        master: masterOnly ? "1" : "",
        lgbtq: lgbtqAffirming ? "1" : "",
      });

      startTransition(() => {
        router.replace(nextUrl);
      });
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [
    availableToday,
    city,
    goal,
    keyword,
    lgbtqAffirming,
    masterOnly,
    modality,
    pathname,
    router,
    session,
    tier,
    verified,
  ]);

  const visibleItems = useMemo(() => {
    const objectiveSearchValue = normalizeText(getDirectoryObjectiveSearchValue(goal, modality));

    return items.filter((item) => {
      const searchable = [
        item.display_name,
        item.full_name,
        item.bio,
        item.modality,
        ...(item.specialties || []),
        item.neighborhood_name,
        item.primary_area,
        ...buildPhysicalSearchTerms({
          heightInches: item.height_inches,
          weightLb: item.weight_lb,
          bodyType: item.body_type,
        }),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const yearsExperience = getYearsExperience(item);
      const bodyTypeKeyword = matchBodyTypeKeyword(keyword);
      const matchesCity = city ? normalizeText(item.city) === normalizeText(city) : true;
      const matchesModality = modality ? searchable.includes(normalizeText(modality)) : true;
      const matchesGoal = objectiveSearchValue ? searchable.includes(objectiveSearchValue) : true;
      const matchesKeyword = keyword
        ? searchable.includes(normalizeText(keyword)) ||
          (bodyTypeKeyword ? normalizeBodyTypeValue(item.body_type) === bodyTypeKeyword : false)
        : true;
      const matchesSession =
        session === "home-visit"
          ? Boolean(item.outcall_price)
          : session === "incall"
            ? Boolean(item.incall_price)
            : true;
      const matchesVerified =
        verified
          ? item._tier === "standard" ||
            item._tier === "pro" ||
            item._tier === "elite" ||
            Boolean(item.is_verified_identity) ||
            Boolean(item.is_verified_profile)
          : true;
      const matchesTier = tier ? item._tier === tier : true;
      const matchesAvailable = availableToday ? Boolean(item.available_now) : true;
      const matchesMaster = masterOnly ? Boolean(yearsExperience && yearsExperience >= 10) : true;
      const matchesLgbtq = lgbtqAffirming ? Boolean(item.lgbtq_affirming) : true;

      return (
        matchesCity &&
        matchesModality &&
        matchesGoal &&
        matchesKeyword &&
        matchesSession &&
        matchesVerified &&
        matchesTier &&
        matchesAvailable &&
        matchesMaster &&
        matchesLgbtq
      );
    });
  }, [availableToday, city, goal, items, keyword, lgbtqAffirming, masterOnly, modality, session, tier, verified]);

  const handleFilterChange = (updates: Partial<AdvancedDirectoryFilterState>) => {
    if (updates.city !== undefined) {
      setCity(updates.city);
    }
    if (updates.modality !== undefined) {
      setModality(updates.modality);
    }
    if (updates.keyword !== undefined) {
      setKeyword(updates.keyword);
    }
    if (updates.session !== undefined) {
      setSession(updates.session);
    }
    if (updates.goal !== undefined) {
      setGoal(updates.goal);
    }
    if (updates.verified !== undefined) {
      setVerified(updates.verified);
    }
    if (updates.availableToday !== undefined) {
      setAvailableToday(updates.availableToday);
    }
    if (updates.masterOnly !== undefined) {
      setMasterOnly(updates.masterOnly);
    }
    if (updates.tier !== undefined) {
      setTier(updates.tier);
    }
    if (updates.lgbtqAffirming !== undefined) {
      setLgbtqAffirming(updates.lgbtqAffirming);
    }
  };

  const resetSearch = () => {
    setCity("");
    setModality("");
    setKeyword("");
    setSession("");
    setGoal("");
    setVerified(false);
    setAvailableToday(false);
    setMasterOnly(false);
    setTier("");
    setLgbtqAffirming(false);
    router.push(pathname || "/search");
  };

  return (
    <section className="mt-8">
      <AdvancedDirectoryFilter
        cities={cities}
        filters={{
          city,
          keyword,
          modality,
          goal,
          session,
          verified,
          availableToday,
          masterOnly,
          tier,
          lgbtqAffirming,
        }}
        resultCount={visibleItems.length}
        totalCount={total}
        isPending={isPending}
        onChange={handleFilterChange}
        onReset={resetSearch}
      />

      <GeoAreaCallout
        className="mt-5"
        compact
        source="search-directory-geolocation"
        onResolved={(resolvedCity) => setCity(resolvedCity.name)}
      />

      {visibleItems.length > 0 ? (
        <div className="stagger-grid mt-6 grid gap-5 lg:grid-cols-2">
          {visibleItems.map((item) => (
            <PublicTherapistCard key={item.id} therapist={item} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-border bg-background p-6 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">No therapist listings matched this search.</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Try a nearby city, a broader specialty term, or clear the current trust filters. You can also jump to the compare hub or safety page while inventory grows.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/search"
              className="rounded-full border border-border bg-secondary/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition hover:bg-secondary"
            >
              Reset to all listings
            </Link>
            <Link
              href="/compare"
              className="rounded-full border border-border bg-secondary/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition hover:bg-secondary"
            >
              Compare competitors
            </Link>
            <Link
              href="/safety"
              className="rounded-full border border-border bg-secondary/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition hover:bg-secondary"
            >
              Read safety guidance
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
