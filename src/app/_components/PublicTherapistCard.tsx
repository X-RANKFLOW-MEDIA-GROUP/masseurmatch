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
      className={`profile-card-glass group flex h-full flex-col ${isFeatured ? "ring-1 ring-[rgb(var(--color-brand-soft-accent-rgb)/0.28)]" : ""}`}
      onMouseMove={handleProfileCardTilt}
      onMouseLeave={(event) => resetProfileCardTilt(event.currentTarget)}
    >
      <div className="profile-card-media">
        <div className="relative aspect-[5/6] overflow-hidden rounded-[1.45rem] sm:aspect-[4/5]">
          <Image
            src={profileImage}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="profile-card-image h-full w-full object-cover"
            style={{ objectPosition: FACE_FOCUS_OBJECT_POSITION }}
            priority={false}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.24),transparent_28%),linear-gradient(180deg,rgba(11,31,58,0.04)_0%,rgba(11,31,58,0.2)_48%,rgba(11,31,58,0.82)_100%)]" />

          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3 profile-card-plane-soft">
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] backdrop-blur-xl sm:px-3 ${
                  isPremium
                    ? "border-white/18 bg-[rgb(var(--color-brand-secondary-rgb)/0.38)] text-white"
                    : "border-white/18 bg-white/14 text-white"
                }`}
              >
                {tierLabel}
              </span>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/18 bg-white/14 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-xl sm:px-3">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="sm:hidden">{compactVerificationLabel}</span>
                  <span className="hidden sm:inline">{verificationLabel}</span>
                </span>
              ) : null}
            </div>

            {therapist.review_count ? (
              <span className="shrink-0 rounded-full border border-white/18 bg-white/14 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-xl sm:px-3">
                {therapist.review_count} reviews
              </span>
            ) : null}
          </div>

          <div className="absolute inset-x-4 bottom-4 profile-card-plane-strong">
            <div className="rounded-[1.5rem] border border-white/16 bg-[linear-gradient(135deg,rgba(9,24,45,0.88),rgba(20,59,108,0.68))] p-3.5 text-white shadow-[0_20px_48px_rgba(11,31,58,0.26)] backdrop-blur-2xl sm:p-4">
              <div className="flex flex-wrap items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/88 sm:text-[10px]">
                <span className={therapist.available_now ? "live-dot" : "h-2.5 w-2.5 rounded-full bg-white/45"} />
                <span>{availabilityLabel}</span>
                <span className="h-1 w-1 rounded-full bg-white/45" />
                <span>{locationLabel}</span>
              </div>

              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/72 sm:text-[10px]">
                    Starting from
                  </p>
                  <p className="mt-1 font-display text-[2rem] leading-none tracking-[-0.05em] text-white sm:text-[2.1rem]">
                    {startingValue || "Request"}
                  </p>
                </div>

                <div className="rounded-full border border-white/16 bg-white/10 px-3 py-2 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/72 sm:text-[10px]">
                    Session
                  </p>
                  <p className="mt-1 flex items-center justify-end gap-1.5 text-sm font-semibold text-white">
                    <Clock3 className="h-3.5 w-3.5" />
                    {sessionDuration} min
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-card-plane relative mx-2 -mt-8 rounded-[1.6rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,246,250,0.92))] p-5 shadow-[0_24px_48px_rgb(var(--color-brand-primary-rgb)/0.1)] backdrop-blur-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-secondary">
          {specialtyLabel}
        </p>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-display text-[2rem] leading-[0.95] tracking-[-0.05em] text-text-primary">
              <Link href={profilePath} onClick={beginRouteTransition} className="transition hover:text-brand-secondary">
                {name}
              </Link>
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand-secondary" />
                {locationLabel}
              </span>
              {yearsExperience ? (
                <span className="rounded-full border border-border-subtle bg-white/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  {yearsExperience} years experience
                </span>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 rounded-[1.15rem] border border-border-subtle bg-white/78 px-3 py-2 text-right shadow-[inset_0_1px_0_rgb(255_255_255/_0.9)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">Trust</p>
            <p className="mt-1 text-xs font-semibold text-brand-secondary">
              {isVerified ? compactVerificationLabel : "Profile live"}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {serviceModes.map((mode) => (
            <span
              key={`${therapist.id}-${mode}`}
              className="rounded-full border border-border-subtle bg-white/82 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary shadow-[inset_0_1px_0_rgb(255_255_255/_0.9)]"
            >
              {mode}
            </span>
          ))}
        </div>

        {supportingTags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {supportingTags.map((tag) => (
              <span
                key={`${therapist.id}-${tag}`}
                className="rounded-full border border-border-subtle bg-[rgb(var(--color-brand-secondary-rgb)/0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <p className="mt-4 line-clamp-3 text-[15px] leading-6 text-text-secondary">
          {therapist.bio || "Profile details are still being completed. Visit the full listing for contact preferences and specialties."}
        </p>
      </div>

      <div className="profile-card-plane mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.35rem] border border-white/60 bg-white/68 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/_0.84)] backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">City</p>
          <p className="mt-2 text-sm font-semibold text-text-primary">{therapist.city || "United States"}</p>
        </div>
        <div className="rounded-[1.35rem] border border-white/60 bg-white/68 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/_0.84)] backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Contact</p>
          <p className="mt-2 text-sm font-semibold text-text-primary">
            {callHref || whatsappHref ? "Direct" : "Profile"}
          </p>
        </div>
        <div className="rounded-[1.35rem] border border-white/60 bg-white/68 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/_0.84)] backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">{tertiaryStat.label}</p>
          <p className="mt-2 text-sm font-semibold text-text-primary">{tertiaryStat.value}</p>
        </div>
      </div>

      <div className="profile-card-plane mt-5 rounded-[1.35rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.62))] p-4 shadow-[inset_0_1px_0_rgb(255_255_255/_0.84)] backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          Why it stands out
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {displayTrustHighlights.map((highlight) => (
            <span
              key={highlight}
              className="rounded-full border border-border-subtle bg-[rgb(var(--color-brand-secondary-rgb)/0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-secondary"
            >
              {highlight}
            </span>
          ))}
          {displayTrustHighlights.length === 0 ? (
            <span className="rounded-full border border-border-subtle bg-[rgb(var(--color-brand-secondary-rgb)/0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-secondary">
              Full profile published
            </span>
          ) : null}
        </div>
      </div>

      <div className="profile-card-plane-strong mt-5 flex flex-wrap gap-2">
        {callHref ? (
          <a
            href={callHref}
            className="profile-card-secondary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-text-primary"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
        ) : null}
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="profile-card-secondary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-text-primary"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        ) : null}
        <Link
          href={profilePath}
          onClick={beginRouteTransition}
          onMouseEnter={() => setCtaScrambleKey((value) => value + 1)}
          onFocus={() => setCtaScrambleKey((value) => value + 1)}
          className="profile-card-cta blur-nav-link flex-1 gap-2 px-5 text-sm uppercase tracking-[0.12em]"
        >
          <ScrambleText text="View Profile" playKey={ctaScrambleKey} />
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
