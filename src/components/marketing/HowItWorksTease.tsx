import Link from "next/link";
import { IconSearch, IconShield, IconMessage, IconArrowRight } from "@/components/icons";
import FadeUp from "@/components/motion/FadeUp";

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

export function HowItWorksTease() {
  return (
    <section className="bg-[#F7F6F3] py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <FadeUp>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">
                How it works
              </p>
              <h2 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight tracking-tight text-[#111111]">
                Find your therapist in three steps.
              </h2>
            </div>
            <Link
              href="/how-it-works"
              className="hidden items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8B1E2D] transition hover:opacity-70 sm:inline-flex"
            >
              Full guide
              <IconArrowRight size={14} className="inline" />
            </Link>
          </div>
        </FadeUp>

        {/* Steps */}
        <div className="mt-10 grid grid-cols-1 gap-px bg-[#E8E6E1] sm:grid-cols-3">
          {STEPS.map(({ n, icon: Icon, title, body }, i) => (
            <FadeUp key={n} delay={i * 0.08}>
              <div className="flex h-full flex-col bg-[#F7F6F3] p-8 lg:p-10">
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B1E2D]/10">
                    <Icon size={20} className="text-[#8B1E2D]" />
                  </div>
                  <span aria-hidden="true" className="font-display text-4xl font-extrabold text-[#E8E6E1]">{n}</span>
                </div>
                <h3 className="font-display text-[1.05rem] font-bold leading-snug text-[#111111]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#6F6F6F]">{body}</p>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.2}>
          <div className="mt-8 sm:hidden">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8B1E2D] transition hover:opacity-70"
            >
              Full guide
              <IconArrowRight size={14} className="inline" />
            </Link>
          </div>
        </FadeUp>

      </div>
    </section>
  );
}
