"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import type { PublicTherapist } from "@/app/_lib/directory";
import {
  getDirectoryTierLabel,
  getPublicContactLinks,
  getPublicProfileName,
  getPublicTrustHighlights,
  isVerifiedDirectoryProfile,
} from "@/app/_lib/public-profile";
import { handleProfileCardTilt, resetProfileCardTilt } from "@/app/_components/profile-card-tilt";

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
  const incall = formatCurrency(therapist.incall_price);
  const outcall = formatCurrency(therapist.outcall_price);
  const isPremium = therapist._tier === "pro" || therapist._tier === "elite";
  const isFeatured = therapist._tier === "elite";
  const isVerified = isVerifiedDirectoryProfile(therapist);
  const { callHref, whatsappHref } = getPublicContactLinks(therapist.phone);
  const tierLabel = getDirectoryTierLabel(therapist);
  const trustHighlights = getPublicTrustHighlights(therapist);
  const neighborhood = therapist.neighborhood_name ?? therapist.primary_area ?? null;
  const yearsExperience =
    therapist.years_experience ??
    (therapist.start_year ? new Date().getFullYear() - therapist.start_year : null);
  const startingPrice = getStartingPrice(therapist);
  const startingValue = formatCurrency(startingPrice);
  const startingLabel = startingValue ? `Starting at ${startingValue}` : "Price on request";
  const availabilityLabel = therapist.available_now ? "Available Now" : "Book Today";
  const locationLabel = neighborhood || therapist.city || "Local area";
  const tertiaryStat = outcall
    ? { label: "Outcall", value: outcall }
    : therapist.profile_views
      ? { label: "Views", value: `${therapist.profile_views}` }
      : { label: "Trust", value: isVerified ? "Verified" : "Review profile" };

  const profileImage = useMemo(
    () =>
      therapist.avatar_url ||
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&h=700&fit=crop",
    [therapist.avatar_url],
  );

  const imageAlt = `${name} - ${therapist.city || "US"} Massage Therapist`;

  return (
    <article
      className={`profile-card-glass group ${isFeatured ? "ring-1 ring-[rgb(var(--color-brand-soft-accent-rgb)/0.28)]" : ""}`}
      onMouseMove={handleProfileCardTilt}
      onMouseLeave={(event) => resetProfileCardTilt(event.currentTarget)}
    >
      <div className="profile-card-media">
        <Image
          src={profileImage}
          alt={imageAlt}
          width={900}
          height={700}
          className="profile-card-image h-56 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,31,58,0.56)] via-transparent to-[rgba(255,255,255,0.14)]" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2 profile-card-plane-soft">
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur-xl ${
              isPremium
                ? "border-white/18 bg-[rgb(var(--color-brand-secondary-rgb)/0.38)] text-white"
                : "border-white/18 bg-white/14 text-white"
            }`}
          >
            {tierLabel}
          </span>
          {isVerified ? (
            <span className="rounded-full border border-white/18 bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-xl">
              Verified
            </span>
          ) : null}
        </div>

        <div className="profile-card-overlay">
          <div className="profile-card-summary">
            <span className={therapist.available_now ? "live-dot" : "h-2.5 w-2.5 rounded-full bg-white/45"} />
            <strong>{availabilityLabel}</strong>
            <span className="profile-card-dot" />
            <span>{locationLabel}</span>
            <span className="profile-card-dot" />
            <span>{startingLabel}</span>
          </div>
        </div>
      </div>

      <div className="profile-card-plane mt-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[1.55rem] font-semibold leading-tight text-text-primary">
            <Link href={profilePath} onClick={beginRouteTransition} className="transition hover:text-brand-secondary">
              {name}
            </Link>
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
            <span>{therapist.city || "United States"}</span>
            {neighborhood && neighborhood !== therapist.city ? (
              <>
                <span aria-hidden="true" className="text-border-strong">&middot;</span>
                <span>{neighborhood}</span>
              </>
            ) : null}
            {yearsExperience ? (
              <>
                <span aria-hidden="true" className="text-border-strong">&middot;</span>
                <span>{yearsExperience}+ yrs exp</span>
              </>
            ) : null}
          </div>
        </div>

        {therapist.review_count ? (
          <span className="shrink-0 rounded-full border border-border-subtle bg-white/78 px-3 py-1.5 text-xs font-semibold text-brand-secondary shadow-[0_10px_24px_rgb(var(--color-brand-primary-rgb)/0.06)]">
            {therapist.review_count} reviews
          </span>
        ) : null}
      </div>

      <p className="profile-card-plane mt-4 text-sm leading-7 text-text-secondary">
        {therapist.bio || "Profile details are still being completed. Visit the full listing for contact preferences and specialties."}
      </p>

      <div className="profile-card-plane mt-4 flex flex-wrap gap-2">
        {(therapist.specialties || []).slice(0, 4).map((specialty) => (
          <span
            key={specialty}
            className="rounded-full border border-border-subtle bg-white/76 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-secondary shadow-[inset_0_1px_0_rgb(255_255_255/_0.9)]"
          >
            {specialty}
          </span>
        ))}
        {therapist.modality ? (
          <span className="rounded-full border border-border-subtle bg-[rgb(var(--color-brand-secondary-rgb)/0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-secondary">
            {therapist.modality}
          </span>
        ) : null}
      </div>

      <div className="profile-card-plane mt-5 grid gap-3 rounded-[1.35rem] border border-white/55 bg-white/58 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/_0.84)] backdrop-blur-xl sm:grid-cols-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Starting</p>
          <p className="mt-2 text-sm font-semibold text-text-primary">{startingValue || "Request"}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Incall</p>
          <p className="mt-2 text-sm font-semibold text-text-primary">{incall || "Ask"}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">{tertiaryStat.label}</p>
          <p className="mt-2 text-sm font-semibold text-text-primary">{tertiaryStat.value}</p>
        </div>
      </div>

      <div className="profile-card-plane mt-5 rounded-[1.35rem] border border-white/55 bg-white/58 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/_0.84)] backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          Why this profile feels safer
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {trustHighlights.map((highlight) => (
            <span
              key={highlight}
              className="rounded-full border border-border-subtle bg-[rgb(var(--color-brand-secondary-rgb)/0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-secondary"
            >
              {highlight}
            </span>
          ))}
        </div>
      </div>

      <div className="profile-card-plane-strong mt-5 flex flex-wrap gap-2">
        {callHref ? (
          <a
            href={callHref}
            className="profile-card-secondary-action inline-flex min-h-12 items-center justify-center rounded-2xl px-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-primary"
          >
            Call now
          </a>
        ) : null}
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="profile-card-secondary-action inline-flex min-h-12 items-center justify-center rounded-2xl px-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-primary"
          >
            WhatsApp
          </a>
        ) : null}
        <Link
          href={profilePath}
          onClick={beginRouteTransition}
          className="profile-card-cta blur-nav-link flex-1 px-5 text-sm uppercase tracking-[0.12em]"
        >
          View Profile
        </Link>
      </div>

      <div className="profile-card-plane mt-4 flex items-center justify-between gap-3 text-xs text-text-muted">
        <Link href="/safety" className="font-semibold text-brand-secondary hover:underline">
          Safety guide
        </Link>
        <span>{isVerified ? "Verification visible" : "Review the full profile before contact"}</span>
      </div>
    </article>
  );
}
