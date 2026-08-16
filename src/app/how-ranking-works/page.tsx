import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  Clock,
  CreditCard,
  ListChecks,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { IconArrowRight } from "@/components/icons";
import { RankingLedger } from "@/components/marketing/RankingLedger";
import { RankingSimulator } from "@/components/marketing/RankingSimulator";
import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, createPageMetadata } from "@/app/_lib/seo";
import { PLACEMENT_FACTORS, STRENGTH_SIGNALS } from "@/lib/ranking-signals";

export const metadata: Metadata = createPageMetadata({
  title: "How Ranking Works — What Moves a Profile on MasseurMatch",
  description:
    "How MasseurMatch orders directory profiles, how paid placement differs from trust signals, and what helps a profile convert views into direct contact.",
  path: "/how-ranking-works",
  keywords: [
    "how masseurmatch ranking works",
    "massage directory ranking",
    "massage directory search placement",
    "therapist profile strength",
    "identity verified massage therapist",
    "massage directory paid placement",
  ],
});

const PLACEMENT_ICONS: Record<string, LucideIcon> = {
  plan: CreditCard,
  available: Zap,
  featured: Sparkles,
};

const STRENGTH_ICONS: Record<string, LucideIcon> = {
  reviews: Star,
  photos: Camera,
  completeness: ListChecks,
  identity: ShieldCheck,
  response: Clock,
  activity: RefreshCw,
};

const FAQ_ITEMS = [
  {
    question: "Does a paid plan rank me higher?",
    answer:
      "Yes. Plan tier is a disclosed placement factor in the directory. Paid placement affects visibility; it does not create or substitute for identity verification, reviews, or other trust signals.",
  },
  {
    question: "What decides my order beyond the plan?",
    answer:
      "Within the current ranking model, availability and featured placement can affect ordering after plan tier. Profile quality signals help clients evaluate a listing but should not be confused with paid placement.",
  },
  {
    question: "Do you verify professional licenses?",
    answer:
      "No. Professional licenses and credentials are self-declared by the provider. MasseurMatch identity verification is a separate identity-only review using a government-issued ID, a current challenge selfie, and human review. It does not verify professional licensing, qualifications, background, or service quality.",
  },
  {
    question: "Does MasseurMatch take a commission on massage sessions?",
    answer:
      "No. MasseurMatch is a discovery directory. Clients contact providers directly, and MasseurMatch does not process or take a commission from off-platform massage-session payments.",
  },
];

const WONT_DO = [
  {
    icon: CreditCard,
    title: "Hide what a plan buys",
    body: "Paid placement is identified as paid placement. We do not present a subscription tier as an earned trust credential.",
  },
  {
    icon: Star,
    title: "Turn payment into a review",
    body: "A paid plan does not create client reviews or convert promotional placement into an endorsement.",
  },
  {
    icon: ShieldCheck,
    title: "Fake verification",
    body: "An Identity Verified badge means the provider successfully completed MasseurMatch's identity review. It is not a license check, background check, endorsement, or paid-placement label.",
  },
  {
    icon: RefreshCw,
    title: "Hide ranking changes",
    body: "When the material ranking model changes, this public explanation should be updated to match the live product.",
  },
];

export default function HowRankingWorksPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "How Ranking Works", path: "/how-ranking-works" },
        ])}
      />
      <JsonLd data={buildFaqJsonLd(FAQ_ITEMS)} />

      <div className="bg-white text-[#111111]">
        <section className="border-b border-[#E8E8E8] px-4 pb-14 pt-24 sm:px-6 lg:pt-28">
          <div className="mx-auto max-w-[960px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-primary)]">How ranking works</p>
            <h1 className="mt-5 max-w-[20ch] font-display text-[clamp(2.375rem,6.4vw,4.25rem)] font-extrabold leading-[1.02] tracking-tight">
              Placement and trust are two different things.
            </h1>
            <p className="mt-6 max-w-[62ch] text-[19px] leading-relaxed text-[#6F6F6F]">
              Your position in search can be influenced by paid placement and live availability. Trust signals such
              as identity verification and reviews are separate. This page explains both without blending them together.
            </p>
          </div>
        </section>

        <section className="border-b border-[#E8E8E8] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[960px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-primary)]">Where you appear</p>
            <h2 className="mt-3 font-display text-[clamp(1.625rem,3.6vw,2.375rem)] font-extrabold leading-tight tracking-tight">
              Current placement factors, in disclosed order.
            </h2>
            <ol className="mt-10 border-t border-[#E8E8E8]">
              {PLACEMENT_FACTORS.map((factor, i) => {
                const Icon = PLACEMENT_ICONS[factor.key] ?? CreditCard;
                return (
                  <li key={factor.key} className="grid grid-cols-[auto_1fr] items-start gap-5 border-b border-[#E8E8E8] py-6 sm:gap-6">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[13px] font-semibold text-[var(--color-primary)]">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EDEE]">
                        <Icon size={19} strokeWidth={2.25} className="text-[var(--color-primary)]" />
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-[19px] font-bold tracking-tight">{factor.label}</h3>
                      <p className="mt-1.5 max-w-[62ch] leading-relaxed text-[#6F6F6F]">{factor.note}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-6 text-[15px] text-[#6F6F6F]">
              <Link href="/pricing" className="font-semibold text-[var(--color-primary)] underline underline-offset-4 transition hover:opacity-75">
                See current plan features and pricing
              </Link>.
            </p>
          </div>
        </section>

        <section className="border-b border-[#E8E8E8] bg-[#FAFAFA] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[960px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-primary)]">Profile strength</p>
            <h2 className="mt-3 font-display text-[clamp(1.625rem,3.6vw,2.375rem)] font-extrabold leading-tight tracking-tight">
              Signals clients can use to evaluate a profile.
            </h2>
            <p className="mt-3 max-w-[62ch] text-[#6F6F6F]">
              These signals are shown separately from promotional placement. They help describe profile strength and
              client confidence; they are not presented as a hidden search-ranking formula.
            </p>
            <RankingLedger />
            <p className="mt-5 max-w-[70ch] font-mono text-[12px] leading-relaxed text-[#6F6F6F]">
              Illustrative weighting only. The ledger is not a promise of ranking, leads, bookings, or revenue.
            </p>
          </div>
        </section>

        <section className="border-b border-[#E8E8E8] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[960px]">
            <h2 className="font-display text-[clamp(1.625rem,3.6vw,2.375rem)] font-extrabold leading-tight tracking-tight">
              Explore profile-strength signals.
            </h2>
            <p className="mt-3 max-w-[58ch] text-[#6F6F6F]">
              The simulator explains relative profile-strength concepts. It does not predict a specific ranking or business result.
            </p>
            <RankingSimulator />
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[960px]">
            <h2 className="font-display text-[clamp(1.625rem,3.6vw,2.375rem)] font-extrabold leading-tight tracking-tight">What each signal means.</h2>
            <div className="mt-10 border-t border-[#E8E8E8]">
              {STRENGTH_SIGNALS.map((signal, i) => {
                const Icon = STRENGTH_ICONS[signal.key] ?? ShieldCheck;
                return (
                  <div key={signal.key} className="grid grid-cols-[auto_1fr] gap-5 border-b border-[#E8E8E8] py-7 sm:gap-6">
                    <div className="flex flex-col items-center gap-3">
                      <span className="font-mono text-[13px] font-semibold text-[var(--color-primary)]">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EDEE]">
                        <Icon size={19} strokeWidth={2.25} className="text-[var(--color-primary)]" />
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-[21px] font-bold tracking-tight">{signal.label}</h3>
                      <p className="mt-2 max-w-[64ch] leading-relaxed text-[#6F6F6F]">{signal.blurb}</p>
                      <p className="mt-3 border-l-2 border-[var(--color-primary)] pl-3 font-mono text-[13px] leading-relaxed text-[#111111]">Do this: {signal.action}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#111111] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[960px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-primary)]">Trust rules</p>
            <h2 className="mt-3 font-display text-[clamp(1.625rem,3.6vw,2.375rem)] font-extrabold leading-tight tracking-tight text-white">What MasseurMatch will not conflate.</h2>
            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-white/[0.06] sm:grid-cols-2">
              {WONT_DO.map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-[#1A1A1A] p-7">
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} strokeWidth={2.25} className="text-[var(--color-primary)]" />
                    <span className="font-mono text-[13px] uppercase tracking-[0.1em] text-white/70">{title}</span>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/60">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#E8E8E8] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[720px]">
            <h2 className="font-display text-[clamp(1.5rem,2.5vw,2rem)] font-extrabold tracking-tight">Straight answers.</h2>
            <dl className="mt-8 divide-y divide-[#E8E8E8]">
              {FAQ_ITEMS.map(({ question, answer }) => (
                <div key={question} className="py-6">
                  <dt className="font-display text-base font-bold">{question}</dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-[#6F6F6F]">{answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[960px]">
            <h2 className="max-w-[24ch] font-display text-[clamp(1.75rem,3.8vw,2.75rem)] font-extrabold leading-tight tracking-tight">Choose visibility. Build trust separately.</h2>
            <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-[#6F6F6F]">
              A paid plan can change placement or unlock features. Identity verification, profile review, and client judgment remain separate from the purchase itself.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/signup/account" className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:bg-[var(--color-primary-hover)]">
                Create your profile <IconArrowRight size={16} />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary)] transition hover:opacity-75">
                Compare plans <ArrowUpRight size={15} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
