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
    "Exactly what orders profiles on MasseurMatch: your plan, then Available Now, then featured status. Plus the six free signals that turn a listing view into a booking. Nothing hidden.",
  path: "/how-ranking-works",
  keywords: [
    "how masseurmatch ranking works",
    "massage directory ranking",
    "massage directory search placement",
    "therapist profile strength",
    "verified massage therapist",
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
      "Yes — and we say so plainly. Your plan is the primary sort key in the directory: Elite, Pro and Standard profiles place above Free ones. That is the visibility a plan buys. What a plan does not do is fake trust — reviews, verification and profile quality are still earned.",
  },
  {
    question: "So what decides my order beyond the plan?",
    answer:
      "Within the same plan tier, two things break the tie: whether you are marked Available Now, and whether your profile is featured. Everything else on this page — reviews, photos, completeness — does not move your slot; it decides whether a client who sees you actually reaches out.",
  },
  {
    question: "Do you verify professional licenses?",
    answer:
      "No. Professional licenses and credentials are self-declared by the provider, and clients can confirm them with the relevant state board. The verification we do perform is identity, through Stripe Identity, available on Pro and Elite and shown with a public verification date.",
  },
  {
    question: "Does MasseurMatch take a commission on bookings?",
    answer:
      "No. Clients contact and pay you directly. MasseurMatch is a directory — we are never in the transaction and never take a cut.",
  },
];

// Honest promises we can actually keep.
const WONT_DO = [
  {
    icon: CreditCard,
    title: "Hide what a plan buys",
    body: "A higher plan buys placement, and this page says so. No dark patterns, no pretending the ordering is something it is not.",
  },
  {
    icon: Star,
    title: "Manipulate reviews",
    body: "We do not write reviews, sell reviews, or delete a bad one because a therapist upgraded their plan.",
  },
  {
    icon: ShieldCheck,
    title: "Fake verification",
    body: "The verified badge means a real Stripe Identity check — nothing else. We never claim to vet licenses we do not actually vet.",
  },
  {
    icon: RefreshCw,
    title: "Change this quietly",
    body: "If the ordering on this page changes, this page changes on the same day, and it says what changed.",
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
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="border-b border-[#E8E8E8] px-4 pb-14 pt-24 sm:px-6 lg:pt-28">
          <div className="mx-auto max-w-[960px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-primary)]">
              How ranking works
            </p>
            <h1 className="mt-5 max-w-[20ch] font-display text-[clamp(2.375rem,6.4vw,4.25rem)] font-extrabold leading-[1.02] tracking-tight">
              What moves your profile up. Nothing hidden.
            </h1>
            <p className="mt-6 max-w-[60ch] text-[19px] leading-relaxed text-[#6F6F6F]">
              Two different things are going on, and it is worth keeping them apart. One is{" "}
              <strong className="font-semibold text-[#111111]">where you appear</strong> in the
              results. The other is{" "}
              <strong className="font-semibold text-[#111111]">whether a client picks you</strong>{" "}
              once they see you. Here is exactly how each one works, in public.
            </p>
          </div>
        </section>

        {/* ── Placement order (the real ordering) ────────────────────────── */}
        <section className="border-b border-[#E8E8E8] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[960px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Where you appear
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.625rem,3.6vw,2.375rem)] font-extrabold leading-tight tracking-tight">
              Results are ordered by three things, in this order.
            </h2>
            <p className="mt-3 max-w-[56ch] text-[#6F6F6F]">
              We are not going to pretend a paid plan does nothing. It is the first tiebreaker — the
              honest trade for keeping the directory free for clients and taking zero commission from
              you.
            </p>

            <ol className="mt-10 border-t border-[#E8E8E8]">
              {PLACEMENT_FACTORS.map((factor, i) => {
                const Icon = PLACEMENT_ICONS[factor.key] ?? CreditCard;
                return (
                  <li
                    key={factor.key}
                    className="grid grid-cols-[auto_1fr] items-start gap-5 border-b border-[#E8E8E8] py-6 sm:gap-6"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[13px] font-semibold text-[var(--color-primary)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EDEE]">
                        <Icon size={19} strokeWidth={2.25} className="text-[var(--color-primary)]" />
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-[19px] font-bold tracking-tight">
                        {factor.label}
                      </h3>
                      <p className="mt-1.5 max-w-[62ch] leading-relaxed text-[#6F6F6F]">
                        {factor.note}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-6 text-[15px] text-[#6F6F6F]">
              <Link
                href="/pricing"
                className="font-semibold text-[var(--color-primary)] underline underline-offset-4 transition hover:opacity-75"
              >
                See exactly what each plan includes
              </Link>{" "}
              — the placement tier is listed right on it.
            </p>
          </div>
        </section>

        {/* ── Profile strength (what wins the client) ────────────────────── */}
        <section className="border-b border-[#E8E8E8] bg-[#FAFAFA] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[960px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Why a client picks you
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.625rem,3.6vw,2.375rem)] font-extrabold leading-tight tracking-tight">
              Six free signals turn a look into a booking.
            </h2>
            <p className="mt-3 max-w-[58ch] text-[#6F6F6F]">
              These do not move your slot in the results — a client still has to open your profile.
              What they decide is what happens next. Every one of them is free, and every one is fully
              in your control.
            </p>

            <RankingLedger />
            <p className="mt-5 max-w-[70ch] font-mono text-[12px] leading-relaxed text-[#6F6F6F]">
              Illustrative weighting to show relative influence — not a search-ranking formula.
              Search position is set by the three factors above; the signals here are what earn the
              contact once you are seen.
            </p>
          </div>
        </section>

        {/* ── Simulator ─────────────────────────────────────────────────── */}
        <section className="border-b border-[#E8E8E8] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[960px]">
            <h2 className="font-display text-[clamp(1.625rem,3.6vw,2.375rem)] font-extrabold leading-tight tracking-tight">
              Build the profile. Watch the strength.
            </h2>
            <p className="mt-3 max-w-[54ch] text-[#6F6F6F]">
              Turn each signal on and see how much closer it gets a client to reaching out. This is
              profile strength — not your position in search, which your plan and availability set.
            </p>
            <RankingSimulator />
          </div>
        </section>

        {/* ── Signal detail ─────────────────────────────────────────────── */}
        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[960px]">
            <h2 className="font-display text-[clamp(1.625rem,3.6vw,2.375rem)] font-extrabold leading-tight tracking-tight">
              What each signal actually measures.
            </h2>
            <p className="mt-3 max-w-[54ch] text-[#6F6F6F]">
              And exactly what you can do about it. Nothing here requires spending a dollar.
            </p>

            <div className="mt-10 border-t border-[#E8E8E8]">
              {STRENGTH_SIGNALS.map((signal, i) => {
                const Icon = STRENGTH_ICONS[signal.key] ?? ShieldCheck;
                return (
                  <div
                    key={signal.key}
                    className="grid grid-cols-[auto_1fr] gap-5 border-b border-[#E8E8E8] py-7 sm:gap-6"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <span className="font-mono text-[13px] font-semibold text-[var(--color-primary)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EDEE]">
                        <Icon size={19} strokeWidth={2.25} className="text-[var(--color-primary)]" />
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-[21px] font-bold tracking-tight">
                        {signal.label}
                      </h3>
                      <p className="mt-2 max-w-[64ch] leading-relaxed text-[#6F6F6F]">
                        {signal.blurb}
                      </p>
                      <p className="mt-3 border-l-2 border-[var(--color-primary)] pl-3 font-mono text-[13px] leading-relaxed text-[#111111]">
                        Do this: {signal.action}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── What we won't do ──────────────────────────────────────────── */}
        <section className="bg-[#111111] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[960px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Stated here so you can hold us to it
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.625rem,3.6vw,2.375rem)] font-extrabold leading-tight tracking-tight text-white">
              What we will not do.
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-white/[0.06] sm:grid-cols-2">
              {WONT_DO.map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-[#1A1A1A] p-7">
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} strokeWidth={2.25} className="text-[var(--color-primary)]" />
                    <span className="font-mono text-[13px] uppercase tracking-[0.1em] text-white/70">
                      {title}
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/60">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section className="border-b border-[#E8E8E8] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[720px]">
            <h2 className="font-display text-[clamp(1.5rem,2.5vw,2rem)] font-extrabold tracking-tight">
              Straight answers.
            </h2>
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

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[960px]">
            <h2 className="max-w-[22ch] font-display text-[clamp(1.75rem,3.8vw,2.75rem)] font-extrabold leading-tight tracking-tight">
              Pick your visibility. Then earn the rest.
            </h2>
            <p className="mt-4 max-w-[50ch] text-[17px] leading-relaxed text-[#6F6F6F]">
              A few minutes to set up: your details, three photos, your rates. Your plan sets where you
              appear — everything else on this page is free and up to you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:bg-[var(--color-primary-hover)]"
              >
                Create your profile
                <IconArrowRight size={16} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary)] transition hover:opacity-75"
              >
                Compare plans
                <ArrowUpRight size={15} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
