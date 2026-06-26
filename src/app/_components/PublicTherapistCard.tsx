"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Navigation, ShieldCheck, Sparkles, Star, Zap } from "lucide-react";
import { useMemo } from "react";
import type { PublicTherapist } from "@/app/_lib/directory";
import {
  getPublicProfileName,
  isVerifiedDirectoryProfile,
  isIdentityVerified,
} from "@/app/_lib/public-profile";

const formatCurrency = (value: number | null) => {
  if (typeof value !== "number" || value <= 0) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const getStartingPrice = (therapist: PublicTherapist) => {
  const sessionPrices = (therapist.pricing_sessions || []).flatMap((session) =>
    [session.incall, session.outcall].filter(
      (v): v is number => typeof v === "number" && v > 0,
    ),
  );
  const prices = [
    therapist.incall_price,
    therapist.outcall_price,
    ...sessionPrices,
  ].filter((v): v is number => typeof v === "number" && v > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
};

const beginRouteTransition = () => {
  if (typeof document === "undefined") return;
  document.body.classList.add("route-dissolve-out");
  window.setTimeout(() => document.body.classList.remove("route-dissolve-out"), 420);
};

export function PublicTherapistCard({ therapist, priority = false }: { therapist: PublicTherapist; priority?: boolean }) {
  const name = getPublicProfileName(therapist);
  const profilePath = `/therapists/${therapist.slug || therapist.id}`;
  const isDirectoryListed = isVerifiedDirectoryProfile(therapist);
  const hasIdentityVerification = isIdentityVerified(therapist);
  const isElite = therapist._tier === "elite";
  const availableNow = therapist.available_now === true;

  const isNewProfile = useMemo(() => {
    if (!therapist.created_at) return false;
    const ageMs = Date.now() - new Date(therapist.created_at).getTime();
    return ageMs < 30 * 24 * 60 * 60 * 1000;
  }, [therapist.created_at]);

  const travelBadge = useMemo(() => {
    const schedule = therapist.travel_schedule;
    if (!Array.isArray(schedule) || schedule.length === 0) return null;
    const now = Date.now();
    for (const entry of schedule) {
      const start = new Date(entry.start_date).getTime();
      const end = new Date(entry.end_date).getTime();
      if (now >= start && now <= end) return { label: "Traveling", city: entry.city };
      const daysUntil = (start - now) / (1000 * 60 * 60 * 24);
      if (daysUntil > 0 && daysUntil <= 14) return { label: "Arriving soon", city: entry.city };
    }
    return null;
  }, [therapist.travel_schedule]);

  const startingPrice = getStartingPrice(therapist);
  const priceLabel = formatCurrency(startingPrice);
  const specialty = therapist.specialties?.[0] || therapist.modality || null;
  const city = therapist.city || null;
  const state = therapist.state || null;
  const locationLabel = [city, state].filter(Boolean).join(", ");

  const profileImage = therapist.profile_photo || therapist.avatar_url || null;
  const initials = (
    (therapist.display_name || therapist.full_name || "")
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase() || "MM"
  );

  return (
    <article
      className="group relative isolate flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.06] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgba(15,23,42,0.28)] hover:ring-black/10"
      itemScope
      itemType="https://schema.org/Person"
    >
      <Link
        href={profilePath}
        onClick={beginRouteTransition}
        className="flex flex-1 flex-col"
        aria-label={`${name} – massage therapist${locationLabel ? ` in ${locationLabel}` : ""}${priceLabel ? `, from ${priceLabel}` : ""}`}
      >
        {/* Photo */}
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          {profileImage ? (
            <Image
              src={profileImage}
              alt={`${name} – massage therapist in ${city || "your area"}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-top transition-transform duration-600 ease-out group-hover:scale-[1.04]"
              priority={priority}
              itemProp="image"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200"
              aria-label={`${name} – no photo`}
            >
              <span className="font-display text-4xl font-extrabold text-neutral-300">
                {initials}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

          {/* Top badges */}
          <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
            <div className="flex flex-col items-start gap-1">
              {isDirectoryListed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/92 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-sm backdrop-blur-sm">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" strokeWidth={2.5} />
                  {isElite ? "Elite" : hasIdentityVerification ? "Verified" : "Listed"}
                </span>
              )}
              {isNewProfile && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" strokeWidth={2.5} />
                  New
                </span>
              )}
              {travelBadge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-600/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm">
                  <Navigation className="h-3 w-3" strokeWidth={2.5} />
                  {travelBadge.label}
                </span>
              )}
              {therapist.is_featured && !isElite && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm">
                  <Zap className="h-3 w-3" strokeWidth={2.5} />
                  Featured
                </span>
              )}
            </div>
            {therapist.review_count ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                <Star className="h-3 w-3 fill-primary text-primary" strokeWidth={2.5} />
                {therapist.review_count}
              </span>
            ) : null}
          </div>

          {/* Hover affordance */}
          <span className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 translate-x-3 items-center justify-center rounded-full bg-white/95 text-neutral-900 opacity-0 shadow-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
          </span>

          {/* Name + specialty overlay */}
          <div className="absolute inset-x-3 bottom-2.5">
            <h3
              className="font-['Georgia',serif] text-[15px] font-normal leading-tight text-white drop-shadow-sm"
              itemProp="name"
            >
              {name}
            </h3>
            {specialty && (
              <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.12em] text-white/70">
                {specialty}
              </p>
            )}
          </div>
        </div>

        {/* Info row */}
        <div className="flex items-center justify-between gap-2 px-2.5 py-2">
          <div className="min-w-0">
            {locationLabel ? (
              <p className="flex items-center gap-1 truncate text-[11px] font-medium text-neutral-500">
                <MapPin className="h-3 w-3 shrink-0 text-neutral-400" strokeWidth={2.25} />
                <span className="truncate">{locationLabel}</span>
              </p>
            ) : (
              <p className="text-[11px] font-medium text-neutral-400">Massage therapist</p>
            )}
            {availableNow && (
              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Available now
              </p>
            )}
            {!availableNow && travelBadge && (
              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-sky-600">
                <Navigation className="h-2.5 w-2.5" strokeWidth={2.5} />
                {travelBadge.label} · {travelBadge.city}
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            {priceLabel ? (
              <>
                <p className="text-[9px] uppercase tracking-widest text-neutral-400">From</p>
                <p className="text-sm font-semibold text-neutral-900" itemProp="priceRange">
                  {priceLabel}
                </p>
              </>
            ) : (
              <p className="text-xs font-medium text-neutral-500" itemProp="priceRange">
                Contact for rates
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* SEO microdata (visually hidden) */}
      <meta itemProp="jobTitle" content="Massage Therapist" />
      <meta itemProp="url" content={profilePath} />
      {(city || state) && (
        <div className="sr-only" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
          {city && <span itemProp="addressLocality">{city}</span>}
          {state && <span itemProp="addressRegion">{state}</span>}
          <span itemProp="addressCountry">US</span>
        </div>
      )}
    </article>
  );
}
