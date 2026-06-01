"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Star } from "lucide-react";
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

  const startingPrice = getStartingPrice(therapist);
  const priceLabel = formatCurrency(startingPrice);
  const specialty = therapist.specialties?.[0] || therapist.modality || null;

  const profileImage = useMemo(
    () =>
      therapist.avatar_url ||
      therapist.profile_photo ||
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&h=700&fit=crop",
    [therapist.avatar_url, therapist.profile_photo],
  );

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-black/10"
      itemScope
      itemType="https://schema.org/Person"
    >
      <Link
        href={profilePath}
        onClick={beginRouteTransition}
        className="flex flex-col flex-1"
        aria-label={`${name} – massage therapist${priceLabel ? `, from ${priceLabel}` : ""}`}
      >
        {/* Photo */}
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
          <Image
            src={profileImage}
            alt={`${name} – massage therapist in ${therapist.city || "your area"}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            priority={false}
            itemProp="image"
          />

          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Verification badge — top left only if verified */}
          {isVerified && (
            <div className="absolute left-3 top-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 backdrop-blur-sm">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {isElite ? "Elite" : "Verified"}
              </span>
            </div>
          )}

          {/* Review count — top right */}
          {therapist.review_count ? (
            <div className="absolute right-3 top-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                <Star className="h-3 w-3 fill-primary text-primary" />
                {therapist.review_count}
              </span>
            </div>
          ) : null}

          {/* Name + specialty overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3
              className="font-['Georgia',serif] text-lg font-normal leading-tight text-white drop-shadow-sm"
              itemProp="name"
            >
              {name}
            </h3>
            {specialty && (
              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-white/65">
                {specialty}
              </p>
            )}
          </div>
        </div>

        {/* Rate + status row */}
        <div className="flex items-center justify-between px-3.5 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400">From</p>
            <p className="text-base font-semibold text-neutral-900" itemProp="priceRange">
              {priceLabel ?? "Contact"}
            </p>
          </div>

          {/* Availability dot */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Available
          </div>
        </div>
      </Link>
    </article>
  );
}
