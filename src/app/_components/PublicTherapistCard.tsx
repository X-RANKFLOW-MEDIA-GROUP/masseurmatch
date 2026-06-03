"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, ShieldCheck, Star } from "lucide-react";
import { useMemo } from "react";
import type { PublicTherapist } from "@/app/_lib/directory";
import {
  getPublicProfileName,
  isVerifiedDirectoryProfile,
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

export function PublicTherapistCard({ therapist }: { therapist: PublicTherapist }) {
  const name = getPublicProfileName(therapist);
  const profilePath = `/therapists/${therapist.slug || therapist.id}`;
  const isVerified = isVerifiedDirectoryProfile(therapist);
  const isElite = therapist._tier === "elite";
  const availableNow = therapist.available_now === true;

  const startingPrice = getStartingPrice(therapist);
  const priceLabel = formatCurrency(startingPrice);
  const specialty = therapist.specialties?.[0] || therapist.modality || null;
  const city = therapist.city || null;
  const state = therapist.state || null;
  const locationLabel = [city, state].filter(Boolean).join(", ");

  const profileImage = useMemo(
    () =>
      therapist.avatar_url ||
      therapist.profile_photo ||
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&h=700&fit=crop",
    [therapist.avatar_url, therapist.profile_photo],
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
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          <Image
            src={profileImage}
            alt={`${name} – massage therapist in ${city || "your area"}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
            priority={false}
            itemProp="image"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

          {/* Top badges */}
          <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
            {isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/92 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-sm backdrop-blur-sm">
                <ShieldCheck className="h-3 w-3 text-emerald-500" strokeWidth={2.5} />
                {isElite ? "Elite" : "Verified"}
              </span>
            ) : (
              <span />
            )}
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
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
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
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Available now
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[9px] uppercase tracking-widest text-neutral-400">From</p>
            <p className="text-sm font-semibold text-neutral-900" itemProp="priceRange">
              {priceLabel ?? "Contact"}
            </p>
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
