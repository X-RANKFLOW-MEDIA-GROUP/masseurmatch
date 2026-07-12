import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Camera,
  Clock,
  Coins,
  Eye,
  ListChecks,
  Lock,
  RefreshCw,
  ShieldCheck,
  Star,
  type LucideIcon,
} from "lucide-react";

import { IconArrowRight } from "@/components/icons";
import { RankingLedger } from "@/components/marketing/RankingLedger";
import { RankingSimulator } from "@/components/marketing/RankingSimulator";
import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, createPageMetadata } from "@/app/_lib/seo";
import { RANKING_SIGNALS } from "@/lib/ranking-signals";

export const metadata: Metadata = createPageMetadata({
  title: "How Ranking Works — What Moves a Profile on MasseurMatch",
  description:
    "MasseurMatch ranks therapist profiles on six earned signals. What you pay changes how widely your profile is shown — never your score. Here is the full breakdown, in public.",
  path: "/how-ranking-works",
  keywords: [
    "how masseurmatch ranking works",
    "massage directory ranking",
    "no pay to win directory",
    "therapist profile score",
    "verified massage therapist ranking",
    "massage directory paid placement",
  ],
});

const SIGNAL_ICONS: Record<string, LucideIcon> = {
  license: ShieldCheck,
  reviews: Star,
  completeness: ListChecks,
  photos: Camera,
  response: Clock,
  activity: RefreshCw,
};

const FAQ_ITEMS = [
  {
    question: "Can I pay to rank higher on MasseurMatch?",
    answer:
      "No. A profile's score comes only from six earned signals — verified license, client reviews, profile completeness, photo quality, response time, and recent activity. No plan, at any price, adds a point to that score.",
  },
  {
    question: "Then what does a paid plan actually change?",
    answer:
      "Visibility. Your plan sets which placement tier your profile appears in and unlocks premium tools like more photos, analytics, a verified badge, and Knotty AI. It changes how many people see your profile — not the score that ranks you within your tier.",
  },
  {
    question: "Does MasseurMatch take a commission on bookings?",
    answer:
      "No. Clients contact and pay you directly. MasseurMatch is a directory — we are never in the transaction and never take a cut.",
  },
  {
    question: "Do you ever write, sell, or remove reviews?",
    answer:
      "No. We do not write reviews, sell reviews, or delete a bad one because a therapist upgraded their plan. Reviews are a client signal, weighted with recent reviews counting for more than old ones.",
  },
];

// The honest counterpart to "what we won't do" — scoped to what money can't buy.
const CANNOT_BUY = [
  {
    icon: Coins,
    title: "A higher score",
    body: "The six signals are earned. No plan, at any price, adds a single point to your profile score.",
  },
  {
    icon: Lock,
    title: "A commission on your work",
    body: "We are not in the booking. The client contacts you, pays you, and we never touch the money.",
  },
  {
    icon: Star,
    title: "Review manipulation",
    body: "We do not write reviews, sell reviews, or delete a bad one because you upgraded your plan.",
  },
  {
    icon: RefreshCw,
    title: "Silent changes",
    body: "If a weight on this page changes, this page changes on the same day, and it says what changed.",
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
        {/* ── Hero + ledger ─────────────────────────────────────────────── */}
        <section className="border-b border-[#E8E8E8] px-4 pb-16 pt-24 sm:px-6 lg:pt-28">
          <div className="mx-auto max-w-[960px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-primary)]">
              How ranking works
            </p>
            <h1 className="mt-5 max-w-[18ch] font-display text-[clamp(2.375rem,6.4vw,4.25rem)] font-extrabold leading-[1.02] tracking-tight">
              Six earned signals set your score. Your money is not one of them.
            </h1>
            <p className="mt-6 max-w-[58ch] text-[19px] leading-relaxed text-[#6F6F6F]">
              Every profile on MasseurMatch gets a score out of 100 from six signals you{" "}
              <strong className="font-semibold text-[#111111]">earn, not buy</strong>. Your plan
              decides how widely that profile is shown — but inside every tier,{" "}
              <strong className="font-semibold text-[#111111]">
                what you pay us is weighted at zero
              </strong>
              . Here is the whole picture, in public.
            </p>

            <RankingLedger />
            <p className="mt-5 max-w-[70ch] font-mono text-[12px] leading-relaxed text-[#6F6F6F]">
              Illustrative weighting — the exact numbers are tuned over time. What is fixed is that
              these six earned signals are the only inputs to your score, and price is never one of
              them. Standard, Pro and Elite are scored by the same function.
            </p>
          </div>
        </section>

        {/* ── Transparency band: what a plan actually changes ───────────── */}
        <section className="border-b border-[#E8E8E8] bg-[#111111] px-4 py-14 sm:px-6">
          <div className="mx-auto flex max-w-[960px] flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08]">
              <Eye size={20} strokeWidth={2.25} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-primary)]">
                So we are clear
              </p>
              <h2 className="mt-2 font-display text-[clamp(1.375rem,3vw,1.875rem)] font-extrabold leading-tight tracking-tight text-white">
                What your plan does change: visibility, not score.
              </h2>
              <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-white/60">
                A higher plan places your profile in a more prominent search tier and unlocks
                premium tools — more photos, analytics, a verified badge, Knotty AI. That is reach:
                how many people see you. It does not add a point to your score, and two profiles in
                the same tier are ordered only by the six signals above.{" "}
                <Link
                  href="/pricing"
                  className="font-semibold text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
                >
                  See what each plan includes
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* ── Simulator ─────────────────────────────────────────────────── */}
        <section className="border-b border-[#E8E8E8] bg-[#FAFAFA] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[960px]">
            <h2 className="font-display text-[clamp(1.625rem,3.6vw,2.375rem)] font-extrabold leading-tight tracking-tight">
              Turn the signals on. Watch the score.
            </h2>
            <p className="mt-3 max-w-[54ch] text-[#6F6F6F]">
              This is the real weighting. Switch a signal on and see what it is worth. The last one
              does not switch on, because it does not exist.
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
              {RANKING_SIGNALS.map((signal, i) => {
                const Icon = SIGNAL_ICONS[signal.key] ?? ShieldCheck;
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

        {/* ── What your money can't buy ─────────────────────────────────── */}
        <section className="bg-[#111111] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[960px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Stated here so you can hold us to it
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.625rem,3.6vw,2.375rem)] font-extrabold leading-tight tracking-tight text-white">
              What your money cannot buy.
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-white/[0.06] sm:grid-cols-2">
              {CANNOT_BUY.map(({ icon: Icon, title, body }) => (
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
            <h2 className="max-w-[20ch] font-display text-[clamp(1.75rem,3.8vw,2.75rem)] font-extrabold leading-tight tracking-tight">
              The formula is public. Now go score well on it.
            </h2>
            <p className="mt-4 max-w-[48ch] text-[17px] leading-relaxed text-[#6F6F6F]">
              A few minutes to set up: your license number, three photos, your rates. Every one of
              them moves your score — none of them costs extra.
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
