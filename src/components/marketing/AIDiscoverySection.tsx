"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Zap, Brain, Target, MessageSquare } from "lucide-react";
import { GrainOverlay } from "@/components/motion/GrainOverlay";
import { BreathingGlow } from "@/components/motion/BreathingGlow";

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const features = [
  { icon: Brain, title: "Smart Matching", description: "AI learns your preferences and finds therapists suited to your needs." },
  { icon: Zap, title: "Instant Results", description: "Get personalized recommendations in seconds instead of browsing for hours." },
  { icon: Target, title: "Precise Filtering", description: "Filter by technique, availability, location, and pricing with ease." },
  { icon: MessageSquare, title: "Direct Communication", description: "Connect directly with therapists—no booking platform in between." },
];

export function AIDiscoverySection() {
  const reducedMotion = useReducedMotion();
  const dur = reducedMotion ? 0 : 0.7;

  function openKnotty() {
    window.dispatchEvent(new CustomEvent("knotty:open", {
      detail: { prompt: "Help me find the right massage therapist near me." },
    }));
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#f7f7f7] py-16 sm:py-24 lg:py-32">
      <GrainOverlay opacity={0.02} className="z-0" />
      <BreathingGlow color="rgba(139, 30, 45, 0.05)" size={500} duration={9} className="left-[5%] top-[15%] z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: dur, ease: customEase }}
          className="mb-10 text-center sm:mb-16"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#8B1E2D]">AI-Powered Discovery</p>
          <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[#111111] sm:text-5xl">Smart Matching Made Simple</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#5E5E5E] sm:mt-6 sm:text-lg">
            Our AI assistant learns what matters to you and connects you with the right therapist faster than browsing alone.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: dur + 0.1, ease: customEase, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-[22px] border border-[#E1E1E1] bg-white p-6 shadow-sm transition hover:border-[#8B1E2D]/30 hover:shadow-lg sm:p-8"
              >
                <div className="relative z-10">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B1E2D]/10 text-[#8B1E2D] sm:h-14 sm:w-14">
                    <Icon size={26} strokeWidth={1.7} />
                  </div>
                  <h3 className="mb-3 font-display text-lg font-bold text-[#111111] sm:text-xl">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-[#5E5E5E]">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: dur, ease: customEase, delay: 0.4 }}
          className="mt-12 rounded-[24px] border border-[#D9D9D9] bg-white px-5 py-10 text-center shadow-sm sm:mt-20 sm:p-12"
        >
          <h3 className="font-display text-2xl font-black leading-tight text-[#111111] sm:text-3xl">Ready to find your perfect massage therapist?</h3>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5E5E5E]">
            Start with Knotty AI for personalized recommendations, or browse verified therapists by city and specialty.
          </p>
          <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <button
              type="button"
              onClick={openKnotty}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#8B1E2D] px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#8B1E2D]/20 transition hover:bg-[#6E1521] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E2D] focus-visible:ring-offset-2 sm:w-auto"
            >
              Ask Knotty AI
            </button>
            <Link
              href="/explore"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#CFCFCF] bg-white px-7 py-3.5 text-sm font-black uppercase tracking-wider text-[#111111] transition hover:border-[#8B1E2D]/50 hover:bg-[#F8EDEE] sm:w-auto"
            >
              Browse All Therapists
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
