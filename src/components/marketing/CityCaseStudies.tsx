"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, ArrowUpRight } from "lucide-react";

type CityEntry = {
  name: string;
  state: string;
  slug: string;
  featured?: boolean;
};

const CITIES: CityEntry[] = [
  { name: "New York", state: "NY", slug: "new-york", featured: true },
  { name: "Los Angeles", state: "CA", slug: "los-angeles", featured: true },
  { name: "Miami", state: "FL", slug: "miami", featured: true },
  { name: "Chicago", state: "IL", slug: "chicago", featured: true },
  { name: "Dallas", state: "TX", slug: "dallas" },
  { name: "Houston", state: "TX", slug: "houston" },
  { name: "Atlanta", state: "GA", slug: "atlanta" },
  { name: "Las Vegas", state: "NV", slug: "las-vegas" },
];

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

function CityLink({
  city,
  index,
}: {
  city: CityEntry;
  index: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: reduced ? 0 : 0.5,
        ease,
        delay: reduced ? 0 : index * 0.04,
      }}
    >
      <Link
        href={`/${city.slug}`}
        className={`group relative flex items-center justify-between overflow-hidden rounded-xl border px-5 py-4 transition-all duration-300 ${
          city.featured
            ? "border-[#E2E4E6] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#8B1E2D]/40 hover:shadow-[0_8px_30px_rgba(204,36,36,0.08)]"
            : "border-[#E2E4E6]/60 bg-[#FAFAFA] hover:border-[#8B1E2D]/30 hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
        }`}
      >
        {/* Red accent bar on hover */}
        <div className="absolute inset-y-0 left-0 w-0.5 bg-[#8B1E2D] opacity-0 transition-all duration-300 group-hover:opacity-100" />

        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-300 ${
              city.featured
                ? "bg-[#8B1E2D]/8 group-hover:bg-[#8B1E2D]/12"
                : "bg-[#F4F5F6] group-hover:bg-[#8B1E2D]/8"
            }`}
          >
            <MapPin
              size={16}
              strokeWidth={2.25}
              className={`transition-colors duration-300 ${
                city.featured
                  ? "text-[#8B1E2D]"
                  : "text-[#999999] group-hover:text-[#8B1E2D]"
              }`}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">
              {city.name}
            </p>
            <p className="text-[11px] font-medium text-[#999999]">
              {city.state}
            </p>
          </div>
        </div>

        <ArrowUpRight
          size={16}
          strokeWidth={2.25}
          className="text-[#CCCCCC] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#8B1E2D]"
        />
      </Link>
    </motion.div>
  );
}

export function CityCaseStudies() {
  const reduced = useReducedMotion();

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reduced ? 0 : 0.6, ease }}
          >
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[#8B1E2D]">
              BROWSE BY CITY
            </p>
            <h2
              className="font-display font-extrabold uppercase leading-[1.05] tracking-tight text-[#1A1A1A]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
            >
              YOUR CITY. YOUR THERAPIST.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#666666] lg:text-base">
              Explore verified massage professionals across the country.
              Every city page connects you with local, trusted therapists.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: reduced ? 0 : 0.6, ease, delay: reduced ? 0 : 0.2 }}
          >
            <Link
              href="/cities"
              className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-[#8B1E2D] transition-opacity hover:opacity-70"
            >
              ALL CITIES
              <ArrowUpRight size={14} strokeWidth={2.5} />
            </Link>
          </motion.div>
        </div>

        {/* City grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CITIES.map((city, i) => (
            <CityLink key={city.slug} city={city} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
