"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, MapPin, MessageCircle, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import type { PublicTherapist } from "@/app/_lib/directory";
import {
  getDirectoryTierLabel,
  getPublicContactLinks,
  getPublicProfileName,
  getPublicTrustHighlights,
  isVerifiedDirectoryProfile,
} from "@/app/_lib/public-profile";
import { handleProfileCardTilt, resetProfileCardTilt } from "@/app/_components/profile-card-tilt";
import { ScrambleText } from "@/components/animations/ScrambleText";
import { buildPhysicalProfileSummary } from "@/lib/physical-profile";

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
  const [ctaScrambleKey, setCtaScrambleKey] = useState(0);
  const name = getPublicProfileName(therapist);
  const profilePath = `/therapists/${therapist.slug || therapist.id}`;
  const isPremium = therapist._tier === "pro" || therapist._tier === "elite";
  const isFeatured = therapist._tier === "elite";
  const isVerified = isVerifiedDirectoryProfile(therapist);
  const { callHref, whatsappHref } = getPublicContactLinks(therapist.phone);
  const tierLabel = getDirectoryTierLabel(therapist);
  const trustHighlights = getPublicTrustHighlights(therapist);
  const displayTrustHighlights = getDisplayTrustHighlights(trustHighlights);
  const neighborhood = therapist.neighborhood_name ?? therapist.primary_area ?? null;
  const yearsExperience =
    therapist.years_experience ??
    (therapist.start_year ? new Date().getFullYear() - therapist.start_year : null);
  const startingPrice = getStartingPrice(therapist);
  const startingValue = formatCurrency(startingPrice);
  const sessionDuration = getStartingSessionDuration(therapist, startingPrice);
  const availabilityLabel = therapist.available_now ? "Available Now" : "Book Today";
  const locationLabel = neighborhood || therapist.city || "Local area";
  const verificationLabel = getVerificationLabel(therapist, isVerified);
  const compactVerificationLabel = getCompactVerificationLabel(verificationLabel);
  const serviceModes = getServiceModes(therapist);
  const physicalSummary = buildPhysicalProfileSummary({
    heightInches: therapist.height_inches,
    weightLb: therapist.weight_lb,
    bodyType: therapist.body_type,
  });
  const tertiaryStat = therapist.review_count
    ? { label: "Reviews", value: `${therapist.review_count}` }
    : therapist.profile_views
      ? { label: "Views", value: `${therapist.profile_views}` }
      : { label: "Trust", value: isVerified ? compactVerificationLabel : "Profile live" };
  const specialtyLabel = therapist.specialties?.[0] || therapist.modality || "Massage Therapy";
  const supportingTags = Array.from(
    new Set([...(therapist.specialties || []).slice(0, 3), therapist.modality, physicalSummary].filter(Boolean)),
  ).slice(0, 4) as string[];

  const profileImage = useMemo(
    () =>
      therapist.avatar_url ||
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&h=700&fit=crop",
    [therapist.avatar_url],
  );

  const imageAlt = `${name} - ${therapist.city || "US"} Massage Therapist`;

  return (
    <article
      className={`profile-card-glass group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/50 shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-orange-300/50 ${isFeatured ? "ring-2 ring-orange-400/30 bg-gradient-to-br from-white to-orange-50/30" : "bg-white"}`}
      onMouseMove={handleProfileCardTilt}
      onMouseLeave={(event) => resetProfileCardTilt(event.currentTarget)}
    >
      {/* PREMIUM PHOTO SECTION */}
      <div className="profile-card-media relative overflow-hidden">
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-slate-200 to-slate-100">
          <Image
            src={profileImage}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="profile-card-image h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ objectPosition: FACE_FOCUS_OBJECT_POSITION }}
            priority={false}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {/* Status Badges - Top */}
          <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2 z-10">
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-sans text-xs font-semibold backdrop-blur-md transition-colors ${
                isPremium
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border border-orange-400/50"
                  : "bg-white/90 text-slate-900 border border-slate-200/50"
              }`}>
                {tierLabel}
              </span>
              {isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 text-white px-3 py-1 font-sans text-xs font-semibold backdrop-blur-md border border-emerald-400/50">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{verificationLabel}</span>
                </span>
              )}
            </div>

            {therapist.review_count ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/90 text-white px-3 py-1 font-sans text-xs font-semibold backdrop-blur-md border border-yellow-400/50">
                ★ {therapist.review_count}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        {/* Name and Specialty */}
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-900 line-clamp-2 hover:text-orange-600 transition-colors">
            <Link href={profilePath} onClick={beginRouteTransition}>
              {name}
            </Link>
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1">{specialtyLabel}</p>
        </div>

        {/* Location and Experience */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
          <span className="line-clamp-1">{locationLabel}</span>
          {yearsExperience && <span className="text-xs text-slate-400">•</span>}
          {yearsExperience && <span className="text-xs text-slate-600">{yearsExperience}y exp</span>}
        </div>

        {/* Service Tags */}
        {serviceModes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {serviceModes.map((mode) => (
              <span key={mode} className="inline-flex text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                {mode}
              </span>
            ))}
          </div>
        )}

        {/* Specialties */}
        {supportingTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {supportingTags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price and CTA */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Starting</p>
            <p className="font-display text-xl font-bold text-slate-900">{startingValue || "Contact"}</p>
          </div>
          <Link
            href={profilePath}
            onClick={beginRouteTransition}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium text-sm hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
          >
            View <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
