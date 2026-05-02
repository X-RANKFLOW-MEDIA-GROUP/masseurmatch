import Link from "next/link";
import Image from "next/image";
import { Star, ChevronRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import { trackEvent } from "@/lib/tracking";
import type { NearbyTherapist } from "@/hooks/useResults";

type FeaturedRowProps = {
  items: NearbyTherapist[];
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardFade = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function FeaturedRow({ items }: FeaturedRowProps) {
  if (!items.length) return null;

  return (
    <section className="page-shell py-10">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-6 flex items-center gap-3"
      >
        <Star className="h-5 w-5 text-brand-accent" />
        <h2 className="font-display text-2xl font-light text-brand-primary">Featured</h2>
      </motion.div>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {items.map((therapist) => {
          const profileHref = `/therapists/${therapist.slug || therapist.id}`;
          return (
            <motion.div key={therapist.id} variants={cardFade}>
              <Link
                href={profileHref}
                onClick={() =>
                  trackEvent("featured_clicked", { therapist_id: therapist.id })
                }
                className="group flex items-center gap-4 overflow-hidden rounded-[20px] border border-brand-accent/15 bg-white/[0.04] p-4 backdrop-blur-lg transition-all duration-400 hover:-translate-y-1 hover:border-brand-accent/35 hover:bg-white/[0.08] hover:shadow-[0_12px_32px_rgb(var(--color-brand-accent-rgb)/0.1)]"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] bg-brand-primary/10">
                  {therapist.profile_photo ? (
                    <Image
                      src={therapist.profile_photo}
                      alt={therapist.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="56px"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-semibold text-brand-primary/40">
                      {therapist.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                    </div>
                  )}

                  {therapist.available_now && (
                    <div className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full border border-white bg-green-500" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-brand-primary">
                      {therapist.name}
                    </p>
                    {therapist._tier === "verified" && (
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                    )}
                  </div>
                  <p className="truncate text-xs text-text-secondary">
                    {therapist.neighborhood ?? therapist.city ?? ""}
                  </p>
                  {therapist.starting_price && (
                    <p className="mt-0.5 text-xs font-semibold text-brand-accent">
                      From ${therapist.starting_price}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-brand-accent transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
