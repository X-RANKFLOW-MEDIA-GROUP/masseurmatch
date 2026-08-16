"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Users } from "lucide-react";
import Link from "next/link";

import { IconArrowRight, IconGlobe, IconLock, IconShield, IconStar } from "@/components/icons";

function Pillar({ icon: Icon, title, text }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; text: string }) {
  return (
    <div className="flex flex-col gap-4 border border-white/[0.10] bg-white/[0.04] p-8 backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.10] bg-[#A92D40]/15">
        <Icon size={20} className="text-[#D65C6E]" />
      </div>
      <h3 className="font-display text-lg font-bold text-white">{title}</h3>
      <p className="text-sm leading-6 text-white/70">{text}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="break-words font-display text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-tight tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm font-medium text-white/65">{label}</p>
    </div>
  );
}

export default function AboutContent() {
  const reduced = useReducedMotion();

  return (
    <div className="bg-[#0D0D0F] text-white">
      <section className="relative overflow-hidden px-4 pb-24 pt-28 sm:px-6 lg:pb-32 lg:pt-36">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-[#A92D40]/10 blur-3xl" />

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-[1100px] text-center"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#D65C6E]">About MasseurMatch</p>
          <h1 className="mt-5 font-display text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold leading-[1.02] tracking-tight text-white">
            <span className="block">Professional massage discovery</span>
            <span className="mt-2 block text-[#D65C6E]">with clearer trust signals.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/70 lg:text-lg">
            MasseurMatch is a U.S. directory for discovering independent male massage and bodywork providers,
            including LGBTQ+-affirming profiles. The platform is designed to make profile information, promotional
            placement, and trust signals easier to understand without pretending they mean the same thing.
          </p>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          className="relative mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 border-t border-white/[0.10] pt-12 sm:grid-cols-3"
        >
          <Stat value="U.S." label="Directory coverage" />
          <Stat value="Independent" label="Listed providers" />
          <Stat value="Reviewed" label="Profiles before public publication" />
        </motion.div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#A92D40]/45 to-transparent" />

      <section className="px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-[1100px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#D65C6E]">What we stand for</p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-white">Three operating principles.</h2>

          <div className="mt-10 grid grid-cols-1 gap-px bg-white/[0.06] sm:grid-cols-3">
            <Pillar
              icon={IconShield}
              title="Clear trust labels"
              text="Profile Reviewed, Identity Verified, and paid promotional labels such as Featured describe different things. Identity Verified is identity-only and does not verify professional licensing or background."
            />
            <Pillar
              icon={IconStar}
              title="Accurate professional profiles"
              text="Providers are responsible for truthful profile information. Public profiles remain subject to platform moderation and publication rules."
            />
            <Pillar
              icon={IconLock}
              title="Data responsibility"
              text="We disclose the categories of information used to operate accounts, profiles, verification, billing, analytics, support, and AI features in our Privacy Policy."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.08] px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto grid max-w-[1100px] gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#D65C6E]">Why we exist</p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold leading-tight tracking-tight text-white">A directory built around direct discovery.</h2>
            <p className="mt-5 text-sm leading-7 text-white/70">
              Independent providers need a professional place to explain their services, rates, availability, practice
              details, and contact methods. Clients need enough information to compare listings and make their own decisions.
            </p>
            <p className="mt-4 text-sm leading-7 text-white/70">
              MasseurMatch provides that discovery layer. It does not employ listed providers, provide massage services,
              verify professional licenses, or process massage-session bookings and payments.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.10] bg-white/[0.04] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A92D40]/15"><Users className="h-4 w-4 text-[#D65C6E]" strokeWidth={2.25} /></div>
              <p className="mt-3 text-sm font-bold text-white">Independent providers</p>
              <p className="mt-1 text-xs leading-5 text-white/65">Providers control their own practice, schedule, rates, and off-platform client arrangements.</p>
            </div>
            <div className="rounded-2xl border border-white/[0.10] bg-white/[0.04] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A92D40]/15"><IconGlobe size={16} className="text-[#D65C6E]" /></div>
              <p className="mt-3 text-sm font-bold text-white">Location discovery</p>
              <p className="mt-1 text-xs leading-5 text-white/65">City and service pages help users discover eligible public profiles by market.</p>
            </div>
            <div className="rounded-2xl border border-white/[0.10] bg-white/[0.04] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A92D40]/15"><IconShield size={16} className="text-[#D65C6E]" /></div>
              <p className="mt-3 text-sm font-bold text-white">Identity Verified</p>
              <p className="mt-1 text-xs leading-5 text-white/65">A separate identity-only review using identity evidence and a current challenge selfie. Not a license or background check.</p>
            </div>
            <div className="rounded-2xl border border-white/[0.10] bg-white/[0.04] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A92D40]/15"><IconShield size={16} className="text-[#D65C6E]" /></div>
              <p className="mt-3 text-sm font-bold text-white">LGBTQ+ affirming</p>
              <p className="mt-1 text-xs leading-5 text-white/65">Providers can identify their affirming status; platform rules require respectful professional presentation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.08] px-4 py-20 text-center sm:px-6">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-white">Explore the directory.</h2>
          <p className="mt-4 text-base leading-7 text-white/65">Browse public profiles or create a provider listing.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/search" className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:bg-[var(--color-primary-hover)]">
              Find a therapist <IconArrowRight size={15} />
            </Link>
            <Link href="/for-therapists" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.10]">
              List your practice
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
