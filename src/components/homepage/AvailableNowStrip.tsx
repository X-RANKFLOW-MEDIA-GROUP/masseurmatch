"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion } from "framer-motion";
import { Zap, ChevronRight, ChevronLeft, MapPin, ArrowRight } from "lucide-react";

import { trackEvent } from "@/lib/tracking";
import type { NearbyTherapist } from "@/hooks/useResults";

type AvailableNowStripProps = {
  items: NearbyTherapist[];
  city: string | null;
};

function AvailableCard({ therapist }: { therapist: NearbyTherapist }) {
  const profileHref = `/therapists/${therapist.slug || therapist.id}`;

  return (
    <Link
      href={profileHref}
      onClick={() =>
        trackEvent("card_clicked", { therapist_id: therapist.id })
      }
      className="group relative flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-[20px] border border-green-400/15 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-400 hover:-translate-y-1 hover:border-green-400/30 hover:shadow-[0_16px_40px_rgba(34,197,94,0.12)]"
    >
      {/* Pulsing green glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-60" />

      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-brand-primary/8 to-brand-secondary/8">
        {therapist.profile_photo ? (
          <Image
            src={therapist.profile_photo}
            alt={therapist.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="260px"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl font-semibold text-brand-primary/30">
            {therapist.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Available Now badge */}
        <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-300 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          <Zap className="h-3 w-3" />
          Now
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="truncate text-sm font-semibold text-brand-primary">
          {therapist.name}
        </p>
        <div className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
          <MapPin className="h-3 w-3" />
          {therapist.neighborhood ?? therapist.city ?? ""}
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          {therapist.starting_price ? (
            <span className="text-xs font-semibold text-brand-primary">
              From ${therapist.starting_price}
            </span>
          ) : (
            <span className="text-xs text-text-muted">Contact</span>
          )}
          <span className="text-[10px] font-semibold uppercase tracking-wide text-green-500 transition group-hover:text-green-400">
            Book →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function AvailableNowStrip({ items, city }: AvailableNowStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const availableItems = items.filter((t) => t.available_now);

  if (!availableItems.length) return null;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent py-10">
      {/* Subtle green glow background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(34,197,94,0.04),transparent_60%)]" />

      <div className="page-shell">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500/10">
              <Zap className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-light text-brand-primary sm:text-3xl">
                Available Now{city ? ` in ${city}` : ""}
              </h2>
              <p className="text-xs text-text-secondary">Ready to book right now</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={() => scroll("left")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-white transition hover:border-brand-accent/30 hover:bg-bg-subtle"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4 text-text-secondary" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-white transition hover:border-brand-accent/30 hover:bg-bg-subtle"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4 text-text-secondary" />
            </button>
          </div>
        </motion.div>

        {/* Horizontal scroll */}
        <div
          ref={scrollRef}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-none sm:-mx-0 sm:px-0"
          style={{ scrollbarWidth: "none" }}
        >
          {availableItems.map((t) => (
            <AvailableCard key={t.id} therapist={t} />
          ))}

          {/* View all card */}
          <Link
            href={`/search?keyword=Available+Now${city ? `&city=${encodeURIComponent(city)}` : ""}`}
            className="flex w-[200px] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-green-400/20 bg-green-500/[0.03] transition hover:border-green-400/40 hover:bg-green-500/[0.06]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <ArrowRight className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-sm font-semibold text-green-600">View all</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
