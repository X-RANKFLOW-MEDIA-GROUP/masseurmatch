"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Search, MessageSquare, CheckCircle } from "lucide-react";
import { GrainOverlay } from "@/components/motion/GrainOverlay";
import { BreathingGlow } from "@/components/motion/BreathingGlow";

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search & Filter",
    description:
      "Browse verified therapists by city, specialty, technique, availability, and pricing. Use our AI assistant or advanced filters to narrow your search.",
    features: ["Filter by city", "Search by specialty", "View availability", "Compare pricing"],
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Review & Connect",
    description:
      "Read detailed profiles with photos, specialties, and direct contact information. Message therapists directly to confirm details.",
    features: ["Reviewed profiles", "Direct messaging", "Transparent pricing", "Detailed specialties"],
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Book & Enjoy",
    description:
      "Coordinate session details directly with your chosen therapist. No middleman, no booking fees, just a professional and trustworthy experience.",
    features: ["Direct booking", "No hidden fees", "Flexible scheduling", "Professional service"],
  },
];

export function HowItWorksPremium() {
  const reducedMotion = useReducedMotion();
  const dur = reducedMotion ? 0 : 0.7;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f7f7] to-[#ffffff] py-24 lg:py-32">
      <GrainOverlay opacity={0.02} className="z-0" />
      <BreathingGlow
        color="rgba(139, 30, 45, 0.04)"
        size={600}
        duration={10}
        className="bottom-[10%] right-[5%] z-0"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: dur, ease: customEase }}
          className="mb-20 text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#8B1E2D]">
            Simple Process
          </p>
          <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">
            How It Works
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#6F6F6F]">
            Three simple steps to find and connect with your perfect massage therapist
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-8 lg:space-y-12">
          {steps.map((step, stepIndex) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: dur,
                  ease: customEase,
                  delay: stepIndex * 0.15,
                }}
                className="relative"
              >
                {/* Connector line (hidden on mobile) */}
                {stepIndex < steps.length - 1 && (
                  <div className="absolute -bottom-8 left-7 hidden h-12 w-0.5 bg-gradient-to-b from-[#8B1E2D]/30 to-transparent lg:-bottom-16" />
                )}

                <div className="grid gap-8 lg:grid-cols-[120px_1fr]">
                  {/* Left: Icon and number */}
                  <div className="flex flex-col items-start gap-4">
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#8B1E2D] text-white shadow-lg shadow-[#8B1E2D]/20">
                        <Icon size={40} strokeWidth={1.5} />
                      </div>
                      <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] font-display text-lg font-black text-[#8B1E2D]">
                        {step.number}
                      </div>
                    </div>
                  </div>

                  {/* Right: Content */}
                  <div className="flex flex-col justify-center">
                    <h3 className="font-display text-2xl font-black text-[#111111] sm:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-lg leading-relaxed text-[#6F6F6F]">
                      {step.description}
                    </p>
                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                      {step.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-2 text-sm font-semibold text-[#111111]"
                        >
                          <svg
                            className="h-5 w-5 text-[#8B1E2D]"
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
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: dur, ease: customEase, delay: 0.6 }}
          className="mt-20 rounded-[28px] border border-[#D9D9D9] bg-white p-12 text-center shadow-lg"
        >
          <h3 className="font-display text-2xl font-black text-[#111111]">
            Ready to get started?
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-[#6F6F6F]">
            Browse our directory now or ask Knotty AI for personalized recommendations
          </p>
          <button
            type="button"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#8B1E2D] px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#8B1E2D]/20 transition hover:bg-[#6E1521]"
          >
            Start Searching
          </button>
        </motion.div>
      </div>
    </section>
  );
}
