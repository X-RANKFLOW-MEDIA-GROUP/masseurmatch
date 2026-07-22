"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { GrainOverlay } from "@/components/motion/GrainOverlay";
import { BreathingGlow } from "@/components/motion/BreathingGlow";

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const benefits = [
  "Premium therapist directory",
  "Direct client connections",
  "Verified LGBTQ+ audience",
  "No booking fees",
  "Professional positioning",
  "Growth opportunities",
];

export function ProviderGrowthCTA() {
  const reducedMotion = useReducedMotion();
  const dur = reducedMotion ? 0 : 0.7;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#f7f7f7] py-16 sm:py-24 lg:py-32">
      <GrainOverlay opacity={0.02} className="z-0" />
      <BreathingGlow color="rgba(139, 30, 45, 0.06)" size={500} duration={12} className="left-[-10%] top-[50%] z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: dur, ease: customEase }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#8B1E2D]">For Massage Therapists</p>
            <h2 className="mt-5 font-display text-3xl font-black tracking-tight text-[#111111] sm:mt-6 sm:text-5xl">
              Grow Your Practice <span className="text-[#8B1E2D]">With MasseurMatch</span>
            </h2>
            <p className="mt-6 text-base leading-7 text-[#5E5E5E] sm:mt-8 sm:text-lg sm:leading-relaxed">
              Join a curated directory built for serious massage therapists who want direct connections with clients in a professional, LGBTQ+-affirming environment.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 text-sm font-semibold text-[#111111]">
                  <svg className="h-5 w-5 shrink-0 text-[#8B1E2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {benefit}
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/signup/account"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#8B1E2D] px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#8B1E2D]/20 transition hover:bg-[#6E1521] sm:w-auto"
              >
                Join MasseurMatch
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/for-therapists"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#D0D0D0] bg-white px-8 py-4 text-sm font-black uppercase tracking-wider text-[#111111] transition hover:border-[#8B1E2D]/50 hover:bg-[#F8EDEE] sm:w-auto"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: dur + 0.1, ease: customEase }}
            className="relative"
          >
            <div className="relative space-y-4">
              {[
                ["Premium Profile Setup", "Create a professional profile showcasing your expertise, specialties, and approach."],
                ["Direct Client Connections", "Clients contact you directly. MasseurMatch does not take bookings or commissions."],
                ["Zero Booking Fees", "Keep 100% of your service rates with no platform booking fee."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-[24px] border border-[#E3E3E3] bg-white p-6 shadow-md transition hover:shadow-lg sm:p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B1E2D]/10 text-[#8B1E2D]">
                    <Sparkles size={22} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#111111]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5E5E5E]">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
