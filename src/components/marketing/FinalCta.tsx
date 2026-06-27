"use client";

import Link from "next/link";
import Image from "next/image";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { InkReveal } from "@/components/motion/InkReveal";
import { SplitTextReveal } from "@/components/motion/SplitTextReveal";
import { BreathingGlow } from "@/components/motion/BreathingGlow";
import { MagneticHover } from "@/components/motion/MagneticHover";
import { GrainOverlay } from "@/components/motion/GrainOverlay";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-36">
      {/* Background image with parallax */}
      <ParallaxLayer speed={0.12} className="absolute inset-0">
        <div className="absolute inset-[-15%]">
          <Image
            src="/marketing/hero/cover.jpg"
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            aria-hidden="true"
          />
        </div>
      </ParallaxLayer>
      <div className="absolute inset-0 bg-[#1A1A1A]/85" />
      <GrainOverlay opacity={0.04} />

      {/* Breathing glow */}
      <BreathingGlow
        color="rgba(204, 36, 36, 0.12)"
        size={500}
        duration={6}
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      <div className="relative z-[2] mx-auto max-w-[900px] px-4 text-center sm:px-6 lg:px-8">
        <InkReveal origin="center" duration={0.8}>
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">
            For therapists
          </p>
        </InkReveal>
        <SplitTextReveal
          text="Get listed today."
          tag="h2"
          wordMode
          charDelay={0.1}
          className="mt-4 font-display text-[clamp(2.75rem,7vw,6rem)] font-extrabold leading-[0.9] tracking-tight text-white"
        />
        <InkReveal origin="center" delay={0.4} duration={0.7}>
          <p className="mx-auto mt-5 max-w-md text-base text-white/60">
            Join verified therapists growing their practice through MasseurMatch.
          </p>
        </InkReveal>

        <InkReveal origin="bottom" delay={0.6} duration={0.7}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <MagneticHover strength={0.2} radius={120}>
              <Link
                href="/for-therapists"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-[0_0_40px_rgba(204,36,36,0.35)]"
              >
                List your practice
              </Link>
            </MagneticHover>
            <MagneticHover strength={0.2} radius={120}>
              <Link
                href="/pricing"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-8 text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5"
              >
                View pricing
              </Link>
            </MagneticHover>
          </div>
        </InkReveal>
      </div>
    </section>
  );
}
