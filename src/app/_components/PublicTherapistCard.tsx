"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Navigation, MapPin, Check } from "lucide-react";
import { useMemo } from "react";
import type { PublicTherapist } from "@/app/_lib/directory";
import { Pill } from "@/components/ui/pill";
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
  const city = therapist.city?.trim() || null;
  const state = therapist.state?.trim() || null;
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

  const services = (therapist.massage_techniques || []).slice(0, 3);
  const lgbtqAffirming = therapist.lgbtq_affirming === true;

  return (
    <motion.article
      className="group relative isolate flex flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-xs)] ring-1 ring-black/[0.06] transition-[box-shadow,ring-color] duration-300 hover:shadow-[var(--shadow-md)] hover:ring-black/10"
      itemScope
      itemType="https://schema.org/Person"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 22 } }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-1 flex-col">
        {/* Photo with badges overlay */}
        <div className="relative aspect-square overflow-hidden bg-neutral-50">
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
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
              <span className="font-display text-4xl font-extrabold text-neutral-300">
                {initials}
              </span>
            </div>
          )}

          {/* Top badge row */}
          <div className="absolute inset-x-2 top-2 flex gap-1.5">
            {availableNow && (
              <Pill
                variant="available"
                size="sm"
                icon={<span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                label="Available Now"
              />
            )}
            {isDirectoryListed && (
              <Pill
                variant="verified"
                size="sm"
                icon={<Check size={10} />}
                label="Verified"
              />
            )}
          </div>

          {/* Hover link affordance */}
          <Link
            href={profilePath}
            onClick={beginRouteTransition}
            className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100"
            aria-label={`View ${name}'s full profile`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-md">
              <ArrowUpRight className="h-5 w-5" strokeWidth={2.5} />
            </span>
          </Link>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-3.5">
          {/* Name and location */}
          <div className="min-w-0">
            <h3
              className="truncate font-display text-base font-semibold text-neutral-900"
              itemProp="name"
            >
              {name}
            </h3>
            {locationLabel && (
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-neutral-500">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{locationLabel}</span>
              </p>
            )}
          </div>

          {/* Headline/specialty */}
          {specialty && (
            <p className="line-clamp-2 text-xs text-neutral-600">
              {specialty}
            </p>
          )}

          {/* Service pills */}
          {services.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {services.map((service) => (
                <Pill
                  key={service}
                  variant="service"
                  size="sm"
                  label={service}
                />
              ))}
            </div>
          )}

          {/* Price */}
          {priceLabel && (
            <div className="pt-1">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">
                Starting at
              </p>
              <p
                className="text-sm font-semibold text-neutral-900"
                itemProp="priceRange"
              >
                {priceLabel}
              </p>
            </div>
          )}

          {/* Trust badge */}
          {lgbtqAffirming && (
            <div className="pt-1">
              <Pill
                variant="lgbtq"
                size="sm"
                label="LGBTQ+ Safe Space"
              />
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2 border-t border-neutral-200 p-3">
          <Link
            href={profilePath}
            onClick={beginRouteTransition}
            className="flex-1 rounded-lg bg-neutral-100 px-3 py-2.5 text-center text-xs font-semibold text-neutral-900 transition hover:bg-neutral-200"
          >
            View Profile
          </Link>
          <button
            onClick={() => {
              const element = document.querySelector("#contact");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-primary/90"
          >
            Ask Availability
          </button>
        </div>

        {/* Directory disclaimer */}
        <div className="border-t border-neutral-100 px-3 py-2 text-[9px] text-neutral-500">
          <p>Directory profile. Confirm rates & availability directly.</p>
        </div>
      </div>

      {/* SEO microdata */}
      <meta itemProp="jobTitle" content="Massage Therapist" />
      <meta itemProp="url" content={profilePath} />
      {(city || state) && (
        <div className="sr-only" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
          {city && <span itemProp="addressLocality">{city}</span>}
          {state && <span itemProp="addressRegion">{state}</span>}
          <span itemProp="addressCountry">US</span>
        </div>
      )}
    </motion.article>
  );
}
