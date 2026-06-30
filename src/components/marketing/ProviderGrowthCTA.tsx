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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#ffffff] to-[#f7f7f7] py-24 lg:py-32">
      <GrainOverlay opacity={0.02} className="z-0" />
      <BreathingGlow
        color="rgba(139, 30, 45, 0.06)"
        size={500}
        duration={12}
        className="left-[-10%] top-[50%] z-0"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: dur, ease: customEase }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#8B1E2D]">
              For Massage Therapists
            </p>

            <h2 className="mt-6 font-display text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">
              Grow Your Practice <span className="text-[#8B1E2D]">With MasseurMatch</span>
            </h2>

            <p className="mt-8 text-lg leading-relaxed text-[#6F6F6F]">
              Join a curated directory built for serious massage therapists who want to reach clients
              in a professional, LGBTQ+-affirming environment. No booking platform. No booking fees.
              Just direct connections with clients who value your expertise.
            </p>

            {/* Benefits list */}
            <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 text-sm font-semibold text-[#111111]"
                >
                  <svg
                    className="h-5 w-5 shrink-0 text-[#8B1E2D]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {benefit}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-wrap gap-4 sm:gap-6">
              <Link
                href="/therapist-agreement"
                className="inline-flex items-center gap-2 rounded-full bg-[#8B1E2D] px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#8B1E2D]/20 transition hover:bg-[#6E1521] hover:shadow-[#8B1E2D]/40"
              >
                Join MasseurMatch
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[#D9D9D9] bg-white px-8 py-4 text-sm font-black uppercase tracking-wider text-[#111111] transition hover:border-[#8B1E2D]/50 hover:bg-[#F8EDEE]"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Right: Visual showcase */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: dur + 0.1, ease: customEase }}
            className="relative"
          >
            {/* Card container */}
            <div className="relative space-y-4">
              {/* Card 1: Profile Setup */}
              <div className="rounded-[24px] border border-[#E8E8E8] bg-white p-8 shadow-md transition hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B1E2D]/10 text-[#8B1E2D]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-[#111111]">
                  Premium Profile Setup
                </h3>
                <p className="mt-2 text-sm text-[#6F6F6F]">
                  Create a professional profile showcasing your expertise, specialties, and approach.
                </p>
              </div>

              {/* Card 2: Direct Clients */}
              <div className="rounded-[24px] border border-[#E8E8E8] bg-white p-8 shadow-md transition hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B1E2D]/10 text-[#8B1E2D]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-[#111111]">
                  Direct Client Connections
                </h3>
                <p className="mt-2 text-sm text-[#6F6F6F]">
                  Connect directly with verified clients seeking your specific services.
                </p>
              </div>

              {/* Card 3: Zero Fees */}
              <div className="rounded-[24px] border border-[#E8E8E8] bg-white p-8 shadow-md transition hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B1E2D]/10 text-[#8B1E2D]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8M12 8v8" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-[#111111]">
                  Zero Booking Fees
                </h3>
                <p className="mt-2 text-sm text-[#6F6F6F]">
                  Keep 100% of your rates. No commissions, no hidden fees, just direct bookings.
                </p>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: dur, ease: customEase, delay: 0.5 }}
              className="absolute -right-6 bottom-4 rounded-full border border-[#8B1E2D]/30 bg-white px-5 py-3 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#8B1E2D]" />
                <span className="text-sm font-bold text-[#111111]">Premium Opportunity</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
