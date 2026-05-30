"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LaunchCityCard } from "@/lib/marketing/home-data";

type Props = {
  launchCities: LaunchCityCard[];
};

export function CityCaseStudies({ launchCities }: Props) {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Top markets
            </p>
            <h2 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,3rem)] font-extrabold leading-[0.95] tracking-tight">
              Find your city.
            </h2>
          </div>
          <Link
            href="/cities"
            className="hidden text-xs font-semibold uppercase tracking-widest text-primary transition hover:opacity-70 sm:block"
          >
            All cities →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:gap-3">
          {launchCities.map((entry, i) => (
            <motion.div
              key={entry.href}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
            >
              <Link
                href={entry.href}
                className="group relative block aspect-square overflow-hidden rounded-2xl bg-[#0a1628]"
              >
                {/* Fallback ghost name */}
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-4xl font-extrabold uppercase text-white/[0.06] select-none">
                  {entry.city.name.split(" ")[0]}
                </span>

                {/* City image */}
                <Image
                  src={`/marketing/cities/${entry.city.slug}.jpg`}
                  alt={`${entry.city.name} massage therapists`}
                  fill
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/85" />

                {/* Bottom label */}
                <div className="absolute bottom-0 left-0 right-0 p-3.5">
                  <p className="font-display text-base font-bold leading-none text-white lg:text-lg">
                    {entry.city.name}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/50">
                    {entry.city.stateCode} · {entry.routeCount} routes
                  </p>
                </div>

                {/* Top-right arrow — appears on hover */}
                <div className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full border border-white/20 bg-white/0 text-[11px] text-white/0 transition-all duration-300 group-hover:bg-white/15 group-hover:text-white">
                  ↗
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
