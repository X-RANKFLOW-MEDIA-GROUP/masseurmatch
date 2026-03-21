"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { PublicTherapist } from "@/app/_lib/directory";
import {
  getDirectoryTierLabel,
  getPublicContactLinks,
  getPublicProfileName,
  getPublicTrustHighlights,
  isVerifiedDirectoryProfile,
} from "@/app/_lib/public-profile";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (value: number | null) => {
  if (!value) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
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
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const profileImage = useMemo(
    () =>
      therapist.avatar_url ||
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&h=700&fit=crop",
    [therapist.avatar_url],
  );

  const imageAlt = `${name} - ${therapist.city || "US"} Massage Therapist`;

  return (
    <article
      className={`brand-surface card-hover rounded-2xl p-5 ${isFeatured ? "featured-listing-shimmer" : ""}`}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
        setParallax({ x, y });
      }}
      onMouseLeave={() => setParallax({ x: 0, y: 0 })}
    >
      <div className="relative mb-5 overflow-hidden rounded-2xl border border-border/70">
        <Image
          src={profileImage}
          alt={imageAlt}
          width={900}
          height={700}
          className="h-44 w-full object-cover transition-transform duration-500"
          style={{ transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0) scale(1.04)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          <span className={therapist.available_now ? "live-dot" : "h-2.5 w-2.5 rounded-full bg-white/50"} />
          {therapist.available_now ? "Available Today" : "Offline"}
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {tierLabel} listing
          </p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">
            <Link href={profilePath} className="hover:underline">
              {name}
            </Link>
          </h3>
          {(() => {
            const neighborhood = therapist.neighborhood_name ?? therapist.primary_area ?? null;
            const yearsExperience =
              therapist.years_experience ??
              (therapist.start_year ? new Date().getFullYear() - therapist.start_year : null);
            return (
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
                <span>{therapist.city || "United States"}</span>
                {neighborhood ? (
                  <>
                    <span aria-hidden="true" className="text-border">·</span>
                    <span>{neighborhood}</span>
                  </>
                ) : null}
                {yearsExperience ? (
                  <>
                    <span aria-hidden="true" className="text-border">·</span>
                    <span>{yearsExperience}+ yrs exp</span>
                  </>
                ) : null}
              </div>
            );
          })()}
        </div>
        {therapist.review_count ? (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            {therapist.review_count} reviews
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant={isPremium ? "premium" : therapist._tier === "standard" ? "default" : "secondary"}>
          {tierLabel}
        </Badge>
        {isVerified ? <Badge variant="outline">Verified</Badge> : null}
        {therapist.available_now ? <Badge variant="outline">Available now</Badge> : null}
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {therapist.bio || "Profile details are still being completed. Visit the full listing for contact preferences and specialties."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(therapist.specialties || []).slice(0, 4).map((specialty) => (
          <span
            key={specialty}
            className="rounded-full border border-border bg-secondary/80 px-3 py-1.5 text-xs font-medium text-foreground"
          >
            {specialty}
          </span>
        ))}
        {therapist.modality ? (
          <span className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {therapist.modality}
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {incall ? <span>Incall {incall}</span> : null}
        {outcall ? <span>Outcall {outcall}</span> : null}
        {therapist.profile_views ? <span>{therapist.profile_views} profile views</span> : null}
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-secondary/30 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Why this profile feels safer
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {trustHighlights.map((highlight) => (
            <span
              key={highlight}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground"
            >
              {highlight}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {callHref ? (
          <a href={callHref} className="rounded-full bg-action-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
            Call now
          </a>
        ) : null}
        {whatsappHref ? (
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
            WhatsApp
          </a>
        ) : null}
        <Link
          href={profilePath}
          onClick={() => {
            if (typeof document !== "undefined") {
              document.body.classList.add("route-dissolve-out");
              window.setTimeout(() => document.body.classList.remove("route-dissolve-out"), 420);
            }
          }}
          className="blur-nav-link rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary hover:bg-secondary"
        >
          View Profile
        </Link>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <Link href="/safety" className="font-semibold text-primary hover:underline">
          Safety guide
        </Link>
        <span>{isVerified ? "Verification visible" : "Review the full profile before contact"}</span>
      </div>
    </article>
  );
}
