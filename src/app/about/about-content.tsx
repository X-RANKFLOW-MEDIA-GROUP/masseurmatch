"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, Star, Lock, ArrowRight, Users, Globe, BadgeCheck } from "lucide-react";
import Link from "next/link";

function Pillar({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return (
    <div className="flex flex-col gap-4 border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.10] bg-[#8B1E2D]/10">
        <Icon className="h-5 w-5 text-[#8B1E2D]" strokeWidth={2.25} />
      </div>
      <h3 className="font-display text-lg font-bold text-white">{title}</h3>
      <p className="text-sm leading-6 text-white/55">{text}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-none tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-sm font-medium text-white/50">{label}</p>
    </div>
  );
}

export default function AboutContent() {
  const reduced = useReducedMotion();

  return (
    <div className="bg-[#060E1A] text-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-28 sm:px-6 lg:pb-32 lg:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-[#8B1E2D]/[0.06] blur-3xl" />

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-[1100px] text-center"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">
            Our Manifesto
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight">
            Elevating the standard
            <br />
            <span className="text-[#8B1E2D]">of wellness discovery.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/55 lg:text-lg">
            MasseurMatch is a premium US directory that connects clients with verified,
            LGBTQ+-affirming male massage therapists. We built it to replace guesswork
            with trust — and to give independent therapists a professional platform
            that respects their work.
          </p>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          className="relative mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-8 border-t border-white/[0.08] pt-12"
        >
          <Stat value="250+" label="US cities covered" />
          <Stat value="48+" label="States with listings" />
          <Stat value="6+" label="Massage specialties" />
        </motion.div>
      </section>

      {/* ── Brand hairline ────────────────────────────────────────────────── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#8B1E2D]/30 to-transparent" />

      {/* ── Core pillars ─────────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-[1100px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">
            What we stand for
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-white">
            Built on three pillars.
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-px bg-white/[0.04] sm:grid-cols-3">
            <Pillar
              icon={ShieldCheck}
              title="Rigorous verification"
              text="Every profile is reviewed before going live. Identity checks, photo moderation, and profile approval ensure only legitimate, professional therapists are listed."
            />
            <Pillar
              icon={Star}
              title="Elite standards"
              text="We focus on quality over quantity. Only professionals dedicated to real results and a premium client experience appear in our directory."
            />
            <Pillar
              icon={Lock}
              title="Absolute privacy"
              text="Your wellness journey is personal. Our platform is built with encrypted communications and no data selling — ever."
            />
          </div>
        </div>
      </section>

      {/* ── Why we built it ──────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto grid max-w-[1100px] gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">
              Why we exist
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold leading-tight tracking-tight text-white">
              The directory the community deserved.
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/55">
              Existing platforms were either anonymous, unverified, or operated behind
              booking middlemen taking 20–30% commissions. Independent therapists had
              no premium home — and clients had no way to compare therapists with real
              trust signals.
            </p>
            <p className="mt-4 text-sm leading-7 text-white/55">
              MasseurMatch was built to fix that: a professional, LGBTQ+-affirming
              directory where therapists own their profiles and clients get transparent,
              searchable information — with no platform in the middle.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { icon: Users, label: "Independent therapists", text: "Profiles owned by the professional — not a platform." },
              { icon: Globe, label: "250+ US cities", text: "National reach from Dallas to New York to LA and beyond." },
              { icon: BadgeCheck, label: "Identity verified", text: "Each profile reviewed and approved before going live." },
              { icon: ShieldCheck, label: "LGBTQ+ affirming", text: "Inclusive by design — every profile clearly marked." },
            ].map(({ icon: Icon, label, text }) => (
              <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8B1E2D]/10">
                  <Icon className="h-4 w-4 text-[#8B1E2D]" strokeWidth={2.25} />
                </div>
                <p className="mt-3 text-sm font-bold text-white">{label}</p>
                <p className="mt-1 text-xs leading-5 text-white/50">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] px-4 py-20 text-center sm:px-6">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-white">
            Join the community.
          </h2>
          <p className="mt-4 text-base leading-7 text-white/50">
            Free for clients. Professional for therapists.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full bg-[#8B1E2D] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#8B1E2D]/20 transition hover:bg-[#e67600]"
            >
              Find a therapist
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
            <Link
              href="/for-therapists"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.10]"
            >
              List your practice
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
