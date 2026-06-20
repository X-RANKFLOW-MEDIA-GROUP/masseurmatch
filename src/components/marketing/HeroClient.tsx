"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  MapPin,
  Calendar,
  ArrowRight,
  Star,
  Clock,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const spotlights = [
  {
    name: "Daniel M.",
    specialty: "Sports Massage Specialist",
    location: "Downtown, City Center",
    rating: 4.9,
    reviews: 128,
    duration: "60 min",
    price: "$95",
    initials: "DM",
  },
  {
    name: "Lucas S.",
    specialty: "Deep Tissue Expert",
    location: "Midtown, City Center",
    rating: 4.8,
    reviews: 96,
    duration: "60 min",
    price: "$90",
    initials: "LS",
  },
  {
    name: "Anderson R.",
    specialty: "Recovery & Mobility",
    location: "Uptown, City Center",
    rating: 4.9,
    reviews: 75,
    duration: "60 min",
    price: "$100",
    initials: "AR",
  },
];

const popularSearches = [
  "Deep Tissue",
  "Sports Massage",
  "Recovery",
  "Relaxation",
];

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function HeroClient() {
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const [activeSpotlight, setActiveSpotlight] = useState(0);
  const [searchLocation, setSearchLocation] = useState("");

  const dur = reducedMotion ? 0 : 0.7;
  const noDelay = reducedMotion ? 0 : undefined;

  return (
    <section className="relative overflow-hidden bg-white text-[#1A1A1A]">
      <div className="mx-auto flex min-h-[600px] flex-col lg:flex-row">
        {/* ── Left column: Hero image (~38%) ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: dur,
            ease: customEase,
            delay: noDelay ?? 0.1,
          }}
          className="relative min-h-[340px] w-full lg:min-h-[600px] lg:w-[38%]"
        >
          <Image
            src="/marketing/hero/cover.jpg"
            alt="Professional massage therapist"
            fill
            priority
            className="object-cover lg:rounded-r-3xl"
            sizes="(max-width: 1024px) 100vw, 38vw"
          />
          {/* Subtle overlay for text legibility on mobile */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 lg:hidden" />
        </motion.div>

        {/* ── Center column: Copy + Search (~35%) ────────────────────── */}
        <div className="flex w-full flex-col justify-center px-6 py-8 lg:w-[35%] lg:px-10 lg:py-0">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: dur,
              ease: customEase,
              delay: noDelay ?? 0.2,
            }}
            className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-[#CC2424] sm:text-xs"
          >
            PREMIUM.&nbsp;&nbsp;PROFESSIONAL.&nbsp;&nbsp;PERSONAL.
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: dur,
              ease: customEase,
              delay: noDelay ?? 0.3,
            }}
            className="mb-5 font-display font-extrabold uppercase leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            <span className="block text-[#1A1A1A]">FIND THE RIGHT</span>
            <span className="block text-[#CC2424]">MASSAGE. EVERY TIME.</span>
          </motion.h1>

          {/* Red separator bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{
              duration: dur,
              ease: customEase,
              delay: noDelay ?? 0.4,
            }}
            className="mb-5 h-1 w-16 origin-left bg-[#CC2424]"
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: dur,
              ease: customEase,
              delay: noDelay ?? 0.45,
            }}
            className="mb-6 max-w-md text-base leading-relaxed text-[#666666] lg:text-lg"
          >
            Book certified massage professionals near you. Tailored to your
            goals. Backed by quality.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: dur,
              ease: customEase,
              delay: noDelay ?? 0.5,
            }}
            className="mb-5 flex flex-col overflow-hidden rounded-xl border border-gray-200 sm:flex-row"
          >
            {/* Location input */}
            <div className="flex flex-1 items-center gap-2 border-b border-gray-200 px-4 py-3 sm:border-b-0 sm:border-r">
              <MapPin
                size={18}
                strokeWidth={2.25}
                className="flex-shrink-0 text-[#999999]"
              />
              <input
                type="text"
                placeholder="Search by location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const q = searchLocation.trim();
                    router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
                  }
                }}
                className="w-full bg-transparent text-sm text-[#1A1A1A] placeholder-[#999999] outline-none"
              />
            </div>

            {/* Search button */}
            <button
              type="button"
              onClick={() => {
                const q = searchLocation.trim();
                router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
              }}
              className="flex items-center justify-center gap-2 bg-[#CC2424] px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#A81D1D]"
            >
              FIND A MASSEUR
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </motion.div>

          {/* Popular searches */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: dur,
              ease: customEase,
              delay: noDelay ?? 0.55,
            }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-xs font-medium text-[#999999]">
              Popular searches:
            </span>
            {popularSearches.map((tag) => (
              <button
                key={tag}
                type="button"
                className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-[#1A1A1A] transition-colors hover:border-[#CC2424] hover:text-[#CC2424]"
              >
                {tag}
              </button>
            ))}
          </motion.div>
        </div>

        {/* ── Right column: Spotlights (~27%) ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: dur,
            ease: customEase,
            delay: noDelay ?? 0.3,
          }}
          className="flex w-full flex-col justify-center px-6 py-8 lg:w-[27%] lg:px-6 lg:py-0"
        >
          {/* Section header */}
          <h2 className="mb-5 font-display text-sm font-bold uppercase tracking-wider text-[#CC2424]">
            SPOTLIGHTS OF THE WEEK
          </h2>

          {/* Therapist cards */}
          <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:gap-4 lg:overflow-x-visible lg:pb-0">
            {spotlights.map((therapist, idx) => (
              <div
                key={therapist.name}
                className="relative min-w-[200px] flex-shrink-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md lg:min-w-0"
              >
                {/* Favorite icon */}
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-300 transition-colors hover:text-[#CC2424]"
                  aria-label={`Save ${therapist.name}`}
                >
                  <Heart size={16} strokeWidth={2.25} />
                </button>

                {/* Avatar + Name row */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#CC2424] to-[#8B0A1E] text-xs font-bold text-white">
                    {therapist.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#1A1A1A]">
                      {therapist.name}
                    </p>
                    <p className="truncate text-[11px] text-[#666666]">
                      {therapist.specialty}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="mb-2 flex items-center gap-1 text-[11px] text-[#999999]">
                  <MapPin size={12} strokeWidth={2.25} />
                  <span>{therapist.location}</span>
                </div>

                {/* Rating */}
                <div className="mb-2 flex items-center gap-1">
                  <Star
                    size={13}
                    strokeWidth={2.25}
                    className="fill-amber-400 text-amber-400"
                  />
                  <span className="text-xs font-semibold text-[#1A1A1A]">
                    {therapist.rating}
                  </span>
                  <span className="text-[11px] text-[#999999]">
                    ({therapist.reviews} reviews)
                  </span>
                </div>

                {/* Duration + Price */}
                <div className="mb-3 flex items-center gap-3 text-[11px] text-[#666666]">
                  <span className="flex items-center gap-1">
                    <Clock size={12} strokeWidth={2.25} />
                    {therapist.duration}
                  </span>
                  <span className="font-semibold text-[#1A1A1A]">
                    {therapist.price}
                  </span>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  className="w-full rounded-md bg-[#CC2424] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a00d25]"
                >
                  VIEW PROFILE
                </button>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-4 flex items-center justify-between">
            {/* Dots */}
            <div className="flex gap-1.5">
              {spotlights.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSpotlight(idx)}
                  aria-label={`Go to spotlight ${idx + 1}`}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    idx === activeSpotlight
                      ? "bg-[#CC2424]"
                      : "bg-[#CC2424]/25"
                  }`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() =>
                  setActiveSpotlight((prev) =>
                    prev === 0 ? spotlights.length - 1 : prev - 1
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-[#666666] transition-colors hover:border-[#CC2424] hover:text-[#CC2424]"
                aria-label="Previous spotlight"
              >
                <ChevronLeft size={14} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveSpotlight((prev) =>
                    prev === spotlights.length - 1 ? 0 : prev + 1
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-[#666666] transition-colors hover:border-[#CC2424] hover:text-[#CC2424]"
                aria-label="Next spotlight"
              >
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
