"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Shield, Lock, Heart, Users } from "lucide-react";
import { GrainOverlay } from "@/components/motion/GrainOverlay";
import { BreathingGlow } from "@/components/motion/BreathingGlow";

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const trustPillars = [
  {
    icon: Shield,
    title: "Reviewed Before Going Live",
    description:
      "Public profiles go through platform review before publication. Identity verification is a separate identity-only trust signal.",
  },
  {
    icon: Lock,
    title: "Direct Contact",
    description: "MasseurMatch is a discovery directory. Clients contact providers directly to discuss availability, rates, and scheduling.",
  },
  {
    icon: Heart,
    title: "LGBTQ+ Affirming",
    description: "Therapists identify their LGBTQ+ affirming status, and profiles remain subject to respectful-content and conduct rules.",
  },
  {
    icon: Users,
    title: "Professional Directory",
    description: "Profiles are presented for professional massage and bodywork discovery. MasseurMatch does not verify professional licenses or guarantee services.",
  },
];

export function TrustDashboardSection() {
  const reducedMotion = useReducedMotion();
  const dur = reducedMotion ? 0 : 0.7;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0F1419] via-[#1a1f2e] to-[#0F1419] py-24 lg:py-32">
      <GrainOverlay opacity={0.03} className="z-[2]" />
      <BreathingGlow color="rgba(139, 30, 45, 0.08)" size={700} duration={11} className="left-[10%] top-[20%] z-[1]" />

      <div
        className="absolute inset-0 z-0 opacity-[0.01]"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 24%, rgba(139, 30, 45, 0.05) 25%, rgba(139, 30, 45, 0.05) 26%, transparent 27%, transparent 74%, rgba(139, 30, 45, 0.05) 75%, rgba(139, 30, 45, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(139, 30, 45, 0.05) 25%, rgba(139, 30, 45, 0.05) 26%, transparent 27%, transparent 74%, rgba(139, 30, 45, 0.05) 75%, rgba(139, 30, 45, 0.05) 76%, transparent 77%, transparent)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: dur, ease: customEase }}
          className="mb-16 text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#8B1E2D]">Trust &amp; Safety</p>
          <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">Trust signals with clear limits</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">
            Profile review, identity verification, paid placement, and professional credentials are different things. MasseurMatch labels them separately so users can understand what each signal means.
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: dur + 0.1, ease: customEase, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-white/5 to-white/2 p-8 backdrop-blur-md transition duration-300 hover:border-[#8B1E2D]/30 hover:bg-white/[0.08]"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#8B1E2D]/10 blur-2xl transition duration-300 group-hover:bg-[#8B1E2D]/20" />
                <div className="relative z-10">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8B1E2D]/20 text-[#8B1E2D] transition duration-300 group-hover:bg-[#8B1E2D]/30">
                    <Icon size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-300">{pillar.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: dur + 0.2, ease: customEase, delay: 0.4 }}
          className="mt-20 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/5 to-white/2 p-8 backdrop-blur-md sm:p-12"
        >
          <div className="mb-8 border-b border-white/10 pb-8">
            <p className="font-mono text-xs uppercase tracking-widest text-[#8B1E2D]">How the trust layer works</p>
            <h3 className="mt-2 font-display text-2xl font-black text-white">Separate signals, separate meanings</h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <p className="font-mono text-xs uppercase tracking-widest text-gray-400">Profile Review</p>
              <p className="mt-3 font-display text-xl font-black text-white">Reviewed before publication</p>
              <p className="mt-1 text-sm text-gray-400">Content and profile readiness review. This is not identity or license verification.</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <p className="font-mono text-xs uppercase tracking-widest text-gray-400">Identity Verification</p>
              <p className="mt-3 font-display text-xl font-black text-white">ID + challenge selfie + human review</p>
              <p className="mt-1 text-sm text-gray-400">Identity only. Raw evidence is kept private and removed after the final review decision under the current workflow.</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <p className="font-mono text-xs uppercase tracking-widest text-gray-400">Paid Placement</p>
              <p className="mt-3 font-display text-xl font-black text-white">Featured is promotional</p>
              <p className="mt-1 text-sm text-gray-400">Paid visibility does not verify identity, licenses, qualifications, or service quality.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: dur, ease: customEase, delay: 0.6 }}
          className="mt-16 rounded-[24px] border border-[#8B1E2D]/30 bg-[#8B1E2D]/10 p-8 text-center backdrop-blur-sm"
        >
          <p className="text-lg font-semibold text-white">
            Identity Verified confirms a point-in-time identity review only. It is not a professional license check, background check, endorsement, or guarantee.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
