"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  MapPin,
  MessageSquare,
  Phone,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";
import {
  getDirectoryTierLabel,
  getPublicContactLinks,
  getPublicProfileName,
  getPublicTrustHighlights,
} from "@/app/_lib/public-profile";
import { buildPhysicalProfileSummary } from "@/lib/physical-profile";
import { useKnottyProfileAttribution } from "./useKnottyProfileAttribution";

function statusConfig(profile: PublicTherapist) {
  if (profile.available_now) {
    return { label: "Available now", dot: "bg-success" };
  }

  if (Array.isArray(profile.travel_schedule) && profile.travel_schedule.length > 0) {
    const now = Date.now();
    const upcoming = profile.travel_schedule.some((trip) => new Date(trip.start_date).getTime() > now);

    if (upcoming) {
      return { label: "Traveling soon", dot: "bg-brand-soft" };
    }
  }

  return { label: "Limited availability", dot: "bg-white/60" };
}

function getSessionLabel(profile: PublicTherapist) {
  if (profile.incall_price && profile.outcall_price) {
    return "Incall + outcall";
  }

  if (profile.outcall_price) {
    return "Outcall";
  }

  if (profile.incall_price) {
    return "Incall";
  }

  return "Direct contact";
}

interface Props {
  profile: PublicTherapist;
  cityPath: string;
}

export function ProfileHero({ profile, cityPath }: Props) {
  const name = getPublicProfileName(profile);
  const status = statusConfig(profile);
  const { callHref, smsHref } = getPublicContactLinks(profile.phone);
  const neighborhood = profile.neighborhood_name || profile.primary_area;
  const { trackContact } = useKnottyProfileAttribution({
    therapistId: profile.id,
    city: profile.city,
    neighborhood,
  });
  const city = profile.city || "United States";
  const topTechnique = profile.specialties?.[0] || profile.modality || "Massage therapy";
  const yearsExp =
    profile.years_experience ?? (profile.start_year ? new Date().getFullYear() - profile.start_year : null);
  const startingAt = profile.incall_price ?? profile.outcall_price;
  const trustHighlights = getPublicTrustHighlights(profile).slice(0, 4);
  const tierLabel = getDirectoryTierLabel(profile);
  const physicalProfile = buildPhysicalProfileSummary({
    heightInches: profile.height_inches,
    weightLb: profile.weight_lb,
    bodyType: profile.body_type,
  });

  return (
    <section className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-brand-primary via-brand-deep to-brand-secondary text-white shadow-brand">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1.25fr)_24rem]">
        {/* ── Left: content ── */}
        <div className="space-y-6 p-7 md:p-10">
          {/* Top badges row */}
          <div className="flex flex-wrap gap-2.5">
            <Link
              href={cityPath}
              className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/84 backdrop-blur"
            >
              <ArrowUpRight className="h-4 w-4" />
              Explore {city}
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/84 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              {tierLabel} profile
            </span>
            {profile.is_verified_identity ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/84 backdrop-blur">
                <BadgeCheck className="h-4 w-4" />
                ID Verified
              </span>
            ) : null}
          </div>

          {/* Name + location */}
          <div className="space-y-3">
            <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.04] tracking-[-0.03em] text-white md:text-5xl xl:text-[3.5rem]">
              {name}
            </h1>

            {/* ── Location line — always visible ── */}
            <div className="flex items-center gap-2 text-base text-white/80">
              <MapPin className="h-4 w-4 text-brand-soft" />
              <span className="font-medium">
                {neighborhood ? `${neighborhood}, ${city}` : city}
              </span>
            </div>
          </div>

          {/* Status + starting price row */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            {startingAt ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur">
                From ${startingAt}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur">
              <Clock3 className="h-4 w-4" />
              {getSessionLabel(profile)}
            </span>
            {physicalProfile ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur">
                <Ruler className="h-4 w-4" />
                {physicalProfile}
              </span>
            ) : null}
          </div>

          {/* Trust highlights */}
          {trustHighlights.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trustHighlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full border border-white/10 bg-white/6 px-3.5 py-1.5 text-xs font-medium text-white/78"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 pt-1">
            {smsHref ? (
              <a
                href={smsHref}
                onClick={() => trackContact("knotty_text_clicked")}
                className="profile-card-cta rounded-full px-7 py-3.5 text-sm font-semibold"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Text now
              </a>
            ) : null}
            {callHref ? (
              <a
                href={callHref}
                onClick={() => trackContact("knotty_call_clicked")}
                className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/8 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/14"
              >
                <Phone className="mr-2 h-4 w-4" />
                Call
              </a>
            ) : null}
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/8 px-7 py-3.5 text-sm font-semibold text-white/92 backdrop-blur transition hover:bg-white/14"
            >
              Contact options
            </a>
          </div>
        </div>

        {/* ── Right: profile photo (clean, no overlapping badges) ── */}
        <div className="relative hidden xl:block">
          <div className="absolute inset-0 translate-y-6 bg-brand-soft/10 blur-3xl" />
          <div className="relative h-full overflow-hidden">
            <Image
              src={
                profile.avatar_url ||
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&h=1120&fit=crop"
              }
              alt={`${name} profile photo`}
              width={720}
              height={900}
              priority
              className="h-full min-h-[28rem] w-full object-cover"
            />
            {/* Subtle bottom gradient only — no badges on photo */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-primary/60 to-transparent" />
          </div>
        </div>

        {/* Mobile photo (below content on small screens) */}
        <div className="px-6 pb-6 xl:hidden">
          <div className="overflow-hidden rounded-[2rem] border border-white/12">
            <Image
              src={
                profile.avatar_url ||
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&h=1120&fit=crop"
              }
              alt={`${name} profile photo`}
              width={720}
              height={900}
              priority
              className="h-72 w-full object-cover sm:h-80"
            />
          </div>
        </div>
      </div>

      {/* ── Summary info strip below hero ── */}
      <div className="border-t border-white/8 bg-white/[0.04] px-7 py-5 md:px-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-brand-soft" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">Location</p>
              <p className="text-sm font-semibold text-white">{neighborhood || city}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-brand-soft" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                {yearsExp ? "Experience" : "Profile tier"}
              </p>
              <p className="text-sm font-semibold text-white">
                {yearsExp ? `${yearsExp}+ years` : `${tierLabel} listing`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-brand-soft" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">Session style</p>
              <p className="text-sm font-semibold text-white">{getSessionLabel(profile)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
