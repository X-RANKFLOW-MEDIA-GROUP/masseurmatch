"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { GrainOverlay } from "@/components/motion/GrainOverlay";
import type { PublicTherapist } from "@/app/_lib/directory";

type Props = {
  featuredTherapists: PublicTherapist[];
};

function formatPrice(amount: number | null) {
  if (!amount) return "Contact for pricing";
  return `From $${amount}`;
}

function buildLocationLabel(therapist: PublicTherapist) {
  return (
    therapist.neighborhood_name ||
    therapist.primary_area ||
    therapist.city ||
    "Featured market"
  );
}

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function FeaturedTherapistsEditorial({ featuredTherapists }: Props) {
  if (!featuredTherapists.length) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f7f7] to-[#ffffff] py-24 lg:py-32">
      <GrainOverlay opacity={0.02} className="z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: customEase }}
          className="mb-16 flex items-end justify-between"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#8B1E2D]">
              Featured profiles
            </p>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">
              Verified Therapists Ready to Help
            </h2>
          </div>
          <Link
            href="/search"
            className="hidden items-center gap-1.5 rounded-full border border-[#D9D9D9] bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#111111] transition hover:border-[#8B1E2D]/50 hover:bg-[#F8EDEE] sm:inline-flex"
          >
            Browse all
            <ArrowRight size={14} className="inline" />
          </Link>
        </motion.div>

        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {featuredTherapists.map((therapist, index) => {
            const profileHref = `/therapists/${therapist.slug || therapist.id}`;
            const specialties = (therapist.specialties || []).slice(0, 2);
            const isVerified =
              therapist.is_verified_identity || therapist.is_verified_profile;
            const initials = (therapist.display_name || therapist.full_name || "?")
              .split(" ")
              .slice(0, 2)
              .map((p) => p[0] ?? "")
              .join("")
              .toUpperCase();

            return (
              <motion.div
                key={profileHref}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.7,
                  ease: customEase,
                  delay: index * 0.1,
                }}
              >
                <Link
                  href={profileHref}
                  className="group relative block overflow-hidden rounded-[24px] border border-[#E8E8E8] bg-gradient-to-b from-white to-[#FAFAFA] shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-3 hover:border-[#8B1E2D]/30 hover:shadow-[0_16px_48px_rgba(139,30,45,0.12)]"
                >
                  {/* Portrait image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#F7F7F7]">
                    {(therapist.profile_photo || therapist.avatar_url) ? (
                      <Image
                        src={(therapist.profile_photo || therapist.avatar_url) as string}
                        alt={therapist.display_name || therapist.full_name || "Therapist"}
                        fill
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-display text-6xl font-extrabold text-gray-200">
                        {initials}
                      </div>
                    )}
                    {isVerified && (
                      <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                        <BadgeCheck size={12} className="text-white" />
                        Verified
                      </div>
                    )}
                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-[#8B1E2D] to-[#A82E3D] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                      ★ Featured
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col p-6">
                    <h3 className="font-display text-lg font-black leading-tight text-[#111111]">
                      {therapist.display_name || therapist.full_name || "Therapist"}
                    </h3>
                    <p className="mt-1.5 text-sm font-medium text-[#8B1E2D]">
                      {buildLocationLabel(therapist)}
                    </p>
                    {specialties.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {specialties.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-[#8B1E2D]/20 bg-gradient-to-r from-[#F8EDEE] to-[#FCF4F6] px-3 py-1.5 text-xs font-semibold text-[#8B1E2D]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between border-t border-[#E8E8E8] pt-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#8B1E2D]">
                        {formatPrice(therapist.incall_price || therapist.outcall_price)}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B1E2D] transition-all group-hover:gap-2 group-hover:translate-x-0.5">
                        View Profile
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
