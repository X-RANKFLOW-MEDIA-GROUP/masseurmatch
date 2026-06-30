"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Zap, Brain, Target, MessageSquare } from "lucide-react";
import { GrainOverlay } from "@/components/motion/GrainOverlay";
import { BreathingGlow } from "@/components/motion/BreathingGlow";

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const features = [
  {
    icon: Brain,
    title: "Smart Matching",
    description: "AI learns your preferences and finds therapists perfectly suited to you",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get personalized recommendations in seconds, not hours of browsing",
  },
  {
    icon: Target,
    title: "Precise Filtering",
    description: "Filter by technique, availability, location, and pricing with ease",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "Connect directly with therapists—no booking platform in between",
  },
];

export function AIDiscoverySection() {
  const reducedMotion = useReducedMotion();
  const dur = reducedMotion ? 0 : 0.7;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#ffffff] to-[#f7f7f7] py-24 lg:py-32">
      <GrainOverlay opacity={0.02} className="z-0" />
      <BreathingGlow
        color="rgba(139, 30, 45, 0.05)"
        size={500}
        duration={9}
        className="left-[5%] top-[15%] z-0"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: dur, ease: customEase }}
          className="mb-16 text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#8B1E2D]">
            AI-Powered Discovery
          </p>
          <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">
            Smart Matching Made Simple
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#6F6F6F]">
            Our AI assistant learns what matters to you and connects you with the perfect therapist,
            faster than browsing alone.
          </p>
        </motion.div>

        {/* Large visual showcase - Glassmorphism cards in grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: dur + 0.1,
                  ease: customEase,
                  delay: index * 0.1,
                }}
                className="group relative overflow-hidden rounded-[24px] border border-[#E8E8E8] bg-white/60 p-8 backdrop-blur-md transition duration-300 hover:border-[#8B1E2D]/30 hover:bg-white/80 hover:shadow-lg"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#8B1E2D]/5 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B1E2D]/10 text-[#8B1E2D] transition duration-300 group-hover:bg-[#8B1E2D]/20">
                    <Icon size={28} strokeWidth={1.5} />
                  </div>

                  <h3 className="mb-3 font-display text-xl font-bold text-[#111111]">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#6F6F6F]">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: dur, ease: customEase, delay: 0.5 }}
          className="mt-20 rounded-[28px] border border-[#D9D9D9] bg-gradient-to-br from-[#f7f7f7] to-[#fafafa] p-12 text-center"
        >
          <h3 className="font-display text-2xl font-black text-[#111111]">
            Ready to find your perfect massage therapist?
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-[#6F6F6F]">
            Start with Knotty AI for personalized recommendations, or browse all verified therapists
            by city and specialty.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[#8B1E2D] px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#8B1E2D]/20 transition hover:bg-[#6E1521] hover:shadow-[#8B1E2D]/40"
            >
              Ask Knotty AI
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#D9D9D9] bg-white px-8 py-4 text-sm font-black uppercase tracking-wider text-[#111111] transition hover:border-[#8B1E2D]/50 hover:bg-[#F8EDEE]"
            >
              Browse All Therapists
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
