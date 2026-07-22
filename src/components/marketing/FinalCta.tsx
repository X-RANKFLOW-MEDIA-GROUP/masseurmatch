"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { InkReveal } from "@/components/motion/InkReveal";
import { SplitTextReveal } from "@/components/motion/SplitTextReveal";
import { BreathingGlow } from "@/components/motion/BreathingGlow";
import { MagneticHover } from "@/components/motion/MagneticHover";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function FinalCta() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-20 sm:py-24 lg:py-36">
      <ParallaxLayer speed={0.08} className="absolute inset-0">
        <div className="absolute inset-[-10%]">
          <Image
            src="/marketing/hero/cover.jpg"
            alt="Professional male massage therapist providing therapeutic massage services"
            fill
            className="object-cover object-center"
            sizes="100vw"
            aria-hidden="true"
          />
        </div>
      </ParallaxLayer>
      <div className="absolute inset-0 bg-[#111111]/88" />
      <BreathingGlow color="rgba(139, 30, 45, 0.18)" size={600} duration={6} className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative mx-auto max-w-[900px] px-4 text-center sm:px-6 lg:px-8">
        <InkReveal origin="center" duration={0.7}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">For therapists</p>
        </InkReveal>

        <SplitTextReveal
          text="Get listed today."
          tag="h2"
          wordMode
          charDelay={0.09}
          className="mt-4 font-display text-[clamp(2.75rem,7vw,6rem)] font-extrabold leading-[0.9] tracking-tight text-white"
        />

        <motion.p
          className="mx-auto mt-5 max-w-md text-base leading-7 text-white/80"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: reduced ? 0 : 0.6, ease, delay: reduced ? 0 : 0.35 }}
        >
          Join verified therapists growing their practice through MasseurMatch.
        </motion.p>

        <motion.div
          className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: reduced ? 0 : 0.6, ease, delay: reduced ? 0 : 0.45 }}
        >
          <MagneticHover strength={0.15} radius={120}>
            <Link
              href="/signup/account"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#A91E38] px-8 text-sm font-bold text-white transition-all hover:bg-[#8B1E2D] hover:shadow-[0_0_40px_rgba(139,30,45,0.35)] sm:w-auto"
            >
              List your practice
            </Link>
          </MagneticHover>
          <MagneticHover strength={0.15} radius={120}>
            <Link
              href="/pricing"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/35 bg-black/10 px-8 text-sm font-bold text-white transition-all hover:border-white/60 hover:bg-white/10 sm:w-auto"
            >
              View pricing
            </Link>
          </MagneticHover>
        </motion.div>
      </div>
    </section>
  );
}
