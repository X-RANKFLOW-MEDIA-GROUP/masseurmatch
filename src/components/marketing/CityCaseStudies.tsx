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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {launchCities.map((entry, i) => (
            <motion.div
              key={entry.href}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
            >
              <Link href={entry.href} className="group block">
                {/* Square image frame */}
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#060f1e] ring-1 ring-white/5 transition-all duration-300 group-hover:ring-primary/30 group-hover:shadow-[0_0_24px_rgba(255,138,31,0.12)]">
                  <Image
                    src={`/marketing/cities/${entry.city.slug}.svg`}
                    alt={`${entry.city.name} massage therapists`}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `/marketing/cities/${entry.city.slug}.jpg`;
                    }}
                  />
                  {/* Hover arrow */}
                  <div className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full border border-white/0 bg-white/0 text-[10px] text-white/0 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white">
                    ↗
                  </div>
                </div>

                {/* City name below */}
                <div className="mt-3 px-0.5">
                  <p className="font-display text-base font-bold leading-none lg:text-lg">
                    {entry.city.name}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {entry.city.stateCode} · {entry.routeCount} routes
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
