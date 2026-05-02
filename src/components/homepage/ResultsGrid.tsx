import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, DollarSign, ChevronRight, ShieldCheck, Zap, Plane } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { formatDistance } from "@/lib/distance";
import { trackEvent } from "@/lib/tracking";
import type { NearbyTherapist } from "@/hooks/useResults";

type ResultsGridProps = {
  results: NearbyTherapist[];
  loading: boolean;
  emptyState: boolean;
  onExpandRadius?: () => void;
  suggestedCity?: string | null;
};

function DynamicBadge({
  type,
}: {
  type: "available" | "verified" | "visiting";
}) {
  if (type === "available") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-green-400/25 bg-green-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-300 shadow-[0_0_12px_rgba(34,197,94,0.2)] backdrop-blur-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
        </span>
        <Zap className="h-3 w-3" />
        Available Now
      </div>
    );
  }
  if (type === "verified") {
    return (
      <div className="inline-flex items-center gap-1 rounded-full border border-blue-400/25 bg-blue-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300 backdrop-blur-sm">
        <ShieldCheck className="h-3 w-3" />
        Verified
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-purple-400/25 bg-purple-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-300 backdrop-blur-sm">
      <Plane className="h-3 w-3" />
      Visiting Soon
    </div>
  );
}

function TherapistCard({ therapist, index }: { therapist: NearbyTherapist; index: number }) {
  const profileHref = `/therapists/${therapist.slug || therapist.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
    >
      <Link
        href={profileHref}
        onClick={() =>
          trackEvent("card_clicked", {
            therapist_id: therapist.id,
            city: therapist.city ?? "",
          })
        }
        className="group relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.03] shadow-[0_8px_32px_rgb(var(--color-brand-primary-rgb)/0.06)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-brand-accent/30 hover:bg-white/[0.06] hover:shadow-[0_20px_50px_rgb(var(--color-brand-primary-rgb)/0.12),0_0_0_1px_rgb(var(--color-brand-accent-rgb)/0.15)] block"
      >
        {/* Gradient border glow on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "linear-gradient(135deg, rgba(255,138,31,0.08), rgba(255,179,71,0.04), transparent 60%)" }} />

        {/* Image / Initials area */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10">
          {therapist.profile_photo ? (
            <Image
              src={therapist.profile_photo}
              alt={therapist.name}
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.06]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl font-semibold text-brand-primary/40">
              {therapist.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Dynamic badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {therapist.available_now && <DynamicBadge type="available" />}
            {therapist._tier === "verified" && <DynamicBadge type="verified" />}
          </div>
        </div>

        {/* Card body */}
        <div className="relative p-4">
          <h3 className="truncate text-base font-semibold text-brand-primary">
            {therapist.name}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
            {therapist.neighborhood && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {therapist.neighborhood}
              </span>
            )}
            {therapist.distance != null && (
              <span className="inline-flex items-center gap-1">
                {formatDistance(therapist.distance)}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            {therapist.starting_price ? (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
                <DollarSign className="h-3.5 w-3.5" />
                From ${therapist.starting_price}
              </span>
            ) : (
              <span className="text-sm text-text-muted">Contact for pricing</span>
            )}

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-action-secondary transition-all duration-300 group-hover:gap-2 group-hover:text-brand-accent">
              View
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ResultsGrid({
  results,
  loading,
  emptyState,
  onExpandRadius,
  suggestedCity,
}: ResultsGridProps) {
  if (loading) {
    return (
      <section className="page-shell py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-[24px] border border-border-subtle bg-bg-subtle"
            />
          ))}
        </div>
      </section>
    );
  }

  if (emptyState) {
    return (
      <section className="page-shell py-10">
        <div className="mx-auto max-w-lg rounded-[28px] border border-border-subtle bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-brand-primary">
            No therapists found nearby
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            {suggestedCity
              ? `Try searching in ${suggestedCity} instead.`
              : "Try expanding your search radius or searching a different city."}
          </p>
          {onExpandRadius && (
            <button
              onClick={onExpandRadius}
              className="mt-4 rounded-full bg-brand-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary"
            >
              Expand search radius
            </button>
          )}
        </div>
      </section>
    );
  }

  if (!results.length) return null;

  return (
    <section className="page-shell py-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl font-light text-brand-primary sm:text-3xl">
          Therapists near you
        </h2>
        <Link
          href="/search"
          className="text-sm font-semibold text-action-secondary transition hover:underline"
        >
          View all →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((therapist, i) => (
          <TherapistCard key={therapist.id} therapist={therapist} index={i} />
        ))}
      </div>
    </section>
  );
}
