"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { IconSearch, IconShield, IconMessage, IconArrowRight } from "@/components/icons";
import { InkReveal } from "@/components/motion/InkReveal";
import { SplitTextReveal } from "@/components/motion/SplitTextReveal";
import { StrokeReveal } from "@/components/motion/StrokeReveal";

const STEPS = [
  {
    n: "01",
    icon: IconSearch,
    title: "Search your city",
    body: "Enter any US city — or browse cities nationwide. Filter by technique, price, incall / outcall, and LGBTQ+ affirmation.",
  },
  {
    n: "02",
    icon: IconShield,
    title: "Compare verified profiles",
    body: "Review photos, services, pricing, trust badges, years of experience, and availability before reaching out.",
  },
  {
    n: "03",
    icon: IconMessage,
    title: "Contact directly — no middleman",
    body: "Use the phone, WhatsApp, or email button on each profile. All contact goes straight to the therapist.",
  },
] as const;

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function HowItWorksTease() {
  const reduced = useReducedMotion();

  return (
    <section className="bg-[#F7F6F3] py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <InkReveal origin="left" duration={0.7}>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">
                How it works
              </p>
            </InkReveal>
            <SplitTextReveal
              text="Find your therapist in three steps."
              tag="h2"
              wordMode
              charDelay={0.07}
              className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight tracking-tight text-[#111111]"
            />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: reduced ? 0 : 0.6, ease, delay: reduced ? 0 : 0.4 }}
          >
            <Link
              href="/how-it-works"
              className="hidden items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8B1E2D] transition hover:opacity-70 sm:inline-flex"
            >
              Full guide
              <IconArrowRight size={14} className="inline" />
            </Link>
          </motion.div>
        </div>

        {/* Connector line (desktop only) */}
        <div className="mt-8 hidden sm:block">
          <StrokeReveal
            d="M 100 15 Q 300 5, 500 15 T 900 15"
            width={1000}
            height={30}
            strokeColor="#8B1E2D"
            strokeWidth={1}
            duration={1.4}
            delay={0.3}
            className="mx-auto w-full max-w-[900px] opacity-20"
            viewBox="0 0 1000 30"
          />
        </div>

        {/* Steps */}
        <div className="mt-4 grid grid-cols-1 gap-px bg-[#E8E6E1] sm:grid-cols-3">
          {STEPS.map(({ n, icon: Icon, title, body }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: reduced ? 0 : 0.55,
                ease,
                delay: reduced ? 0 : i * 0.1,
              }}
            >
              <div className="flex h-full flex-col bg-[#F7F6F3] p-8 lg:p-10">
                <div className="mb-5 flex items-start justify-between">
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B1E2D]/10"
                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                    whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 18,
                      delay: reduced ? 0 : 0.15 + i * 0.1,
                    }}
                  >
                    <Icon size={20} className="text-[#8B1E2D]" />
                  </motion.div>
                  <motion.span
                    aria-hidden="true"
                    data-step={n}
                    className="step-watermark font-display text-4xl font-extrabold"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: reduced ? 0 : 0.8,
                      ease,
                      delay: reduced ? 0 : 0.3 + i * 0.1,
                    }}
                  />
                </div>
                <h3 className="font-display text-[1.05rem] font-bold leading-snug text-[#111111]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#6F6F6F]">{body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-8 sm:hidden"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduced ? 0 : 0.5, ease, delay: reduced ? 0 : 0.2 }}
        >
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8B1E2D] transition hover:opacity-70"
          >
            Full guide
            <IconArrowRight size={14} className="inline" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
