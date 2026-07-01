"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { GrainOverlay } from "@/components/motion/GrainOverlay";

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const cities = [
  { name: "New York", slug: "new-york", therapists: 127 },
  { name: "Los Angeles", slug: "los-angeles", therapists: 98 },
  { name: "Miami", slug: "miami", therapists: 76 },
  { name: "Chicago", slug: "chicago", therapists: 64 },
  { name: "Dallas", slug: "dallas", therapists: 52 },
  { name: "Houston", slug: "houston", therapists: 48 },
  { name: "Atlanta", slug: "atlanta", therapists: 44 },
  { name: "Washington DC", slug: "washington-dc", therapists: 38 },
];

export function CityDiscoveryShowcase() {
  const reducedMotion = useReducedMotion();
  const dur = reducedMotion ? 0 : 0.7;

  return (
    <section className="relative overflow-hidden bg-[#ffffff] py-24 lg:py-32">
      <GrainOverlay opacity={0.01} className="z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: dur, ease: customEase }}
          className="mb-16"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#8B1E2D]">
            Browse by city
          </p>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">
                Explore Major US Cities
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-[#6F6F6F]">
                Search verified therapists across 50+ cities from coast to coast
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#D9D9D9] bg-white px-6 py-3 text-sm font-black uppercase tracking-wider text-[#111111] transition hover:border-[#8B1E2D]/50 hover:bg-[#F8EDEE]"
            >
              View All Cities
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        {/* City cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cities.map((city, index) => (
            <Link key={city.slug} href={`/${city.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: dur + 0.1,
                  ease: customEase,
                  delay: index * 0.08,
                }}
                className="group flex flex-col justify-between rounded-[24px] border border-[#E8E8E8] bg-gradient-to-br from-[#f7f7f7] to-[#fafafa] p-8 shadow-md transition duration-300 hover:-translate-y-2 hover:border-[#8B1E2D]/20 hover:shadow-xl min-h-44"
              >
                <div className="flex items-center gap-2 text-[#8B1E2D] mb-4">
                  <MapPin size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#8B1E2D]">
                    {city.therapists} Verified
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-3xl font-black text-[#111111] transition duration-300 group-hover:text-[#8B1E2D]">
                    {city.name}
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-[#8B1E2D] transition duration-300 group-hover:translate-x-1">
                    <span className="text-sm font-semibold">Browse Therapists</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Additional cities teaser */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: dur, ease: customEase, delay: 0.6 }}
          className="mt-12 rounded-[24px] border border-[#E8E8E8] bg-[#f7f7f7] px-8 py-8 text-center"
        >
          <p className="text-[#6F6F6F]">
            Not seeing your city? Check our full directory of 50+ US cities and growing.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-flex items-center gap-2 font-black uppercase tracking-widest text-[#8B1E2D] transition hover:gap-3"
          >
            Browse all cities
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
