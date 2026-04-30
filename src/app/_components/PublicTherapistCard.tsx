"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, MapPin } from "lucide-react";
import { useMemo } from "react";
import type { PublicTherapist } from "@/app/_lib/directory";
import {
  getPublicProfileName,
  isVerifiedDirectoryProfile,
} from "@/app/_lib/public-profile";

const FACE_FOCUS_OBJECT_POSITION = "50% 50%";

const formatCurrency = (value: number | null) => {
  if (typeof value !== "number" || value <= 0) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const getStartingPrice = (therapist: PublicTherapist) => {
  const sessionPrices = (therapist.pricing_sessions || []).flatMap((session) =>
    [session.incall, session.outcall].filter((value): value is number => typeof value === "number" && value > 0),
  );
  const prices = [therapist.incall_price, therapist.outcall_price, ...sessionPrices].filter(
    (value): value is number => typeof value === "number" && value > 0,
  );

  return prices.length > 0 ? Math.min(...prices) : null;
};

const getStartingSessionDuration = (therapist: PublicTherapist, startingPrice: number | null) => {
  const sessions = (therapist.pricing_sessions || []).filter(
    (session) =>
      typeof session.duration === "number" &&
      ((typeof session.incall === "number" && session.incall > 0) ||
        (typeof session.outcall === "number" && session.outcall > 0)),
  );

  if (typeof startingPrice === "number") {
    const matched = sessions.find(
      (session) => session.incall === startingPrice || session.outcall === startingPrice,
    );
    if (matched?.duration) {
      return matched.duration;
    }
  }

  return sessions[0]?.duration || 60;
};

const getVerificationLabel = (therapist: PublicTherapist, isVerified: boolean) => {
  if (therapist._tier === "elite") {
    return "Verified Elite";
  }

  if (isVerified) {
    return "Verified";
  }

  return "Directory";
};

const getCompactVerificationLabel = (label: string) => {
  if (label === "Verified Elite") {
    return "Elite";
  }

  return label;
};

const getServiceModes = (therapist: PublicTherapist) => {
  const hasIncall =
    Boolean(therapist.incall_price) ||
    (therapist.pricing_sessions || []).some((session) => typeof session.incall === "number" && session.incall > 0);
  const hasOutcall =
    Boolean(therapist.outcall_price) ||
    (therapist.pricing_sessions || []).some((session) => typeof session.outcall === "number" && session.outcall > 0);

  return [hasIncall ? "Incall" : null, hasOutcall ? "Outcall" : null].filter(
    (value): value is string => Boolean(value),
  );
};

const getDisplayTrustHighlights = (highlights: string[]) =>
  highlights.filter((highlight) => !/^available now$/i.test(highlight) && !/\bpublic reviews\b/i.test(highlight));

const beginRouteTransition = () => {
  if (typeof document === "undefined") {
    return;
  }

  document.body.classList.add("route-dissolve-out");
  window.setTimeout(() => document.body.classList.remove("route-dissolve-out"), 420);
};

export function PublicTherapistCard({ therapist }: { therapist: PublicTherapist }) {
  const name = getPublicProfileName(therapist);
  const profilePath = `/therapists/${therapist.slug || therapist.id}`;
  const isVerified = isVerifiedDirectoryProfile(therapist);
  
  // Adicionado o fallback triplo (neighborhood_name -> neighborhood -> primary_area)
  const neighborhood = therapist.neighborhood_name ?? therapist.neighborhood ?? therapist.primary_area ?? null;
  const startingPrice = getStartingPrice(therapist);
  const startingValue = formatCurrency(startingPrice);
  const locationLabel = neighborhood || therapist.city || "Local area";
  const serviceModes = getServiceModes(therapist);
  const specialtyLabel = therapist.specialties?.[0] || therapist.modality || "Massage Therapy";

  const profileImage = useMemo(
    () =>
      therapist.avatar_url ||
      therapist.profile_photo ||
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&h=700&fit=crop",
    [therapist.avatar_url, therapist.profile_photo],
  );

  const imageAlt = `${name} - ${therapist.city || "US"} Massage Therapist`;

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300"
    >
      {/* Compact Photo */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
        <Image
          src={profileImage}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ objectPosition: FACE_FOCUS_OBJECT_POSITION }}
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute left-2 right-2 top-2 flex items-start justify-between gap-1">
          {isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 text-white px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </span>
          )}
          {therapist.review_count ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-yellow-500/90 text-white px-2 py-0.5 text-[10px] font-semibold ml-auto">
              ★ {therapist.review_count}
            </span>
          ) : null}
        </div>

        {/* Name overlay at bottom */}
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="text-sm font-semibold text-white line-clamp-1 drop-shadow-sm">
            {name}
          </h3>
          <p className="text-[11px] text-white/80 line-clamp-1">{specialtyLabel}</p>
        </div>
      </div>

      {/* Compact Content */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
          <span className="line-clamp-1">{locationLabel}</span>
        </div>

        {/* Service Tags */}
        {serviceModes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {serviceModes.map((mode) => (
              <span key={mode} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {mode}
              </span>
            ))}
          </div>
        )}

        <div className="flex-1" />

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <p className="text-[10px] text-slate-400">From</p>
            <p className="text-sm font-bold text-slate-900">{startingValue || "Contact"}</p>
          </div>
          <Link
            href={profilePath}
            onClick={beginRouteTransition}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            View <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
