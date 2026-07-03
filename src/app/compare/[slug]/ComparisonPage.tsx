"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Competitor } from "@/lib/competitors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ComparisonPageProps = {
  competitor: Competitor;
  relatedComparisons: Competitor[];
  targetKeywords: string[];
};

export default function ComparisonPage({
  competitor,
  relatedComparisons,
  targetKeywords,
}: ComparisonPageProps) {
  return (
    <div className="bg-[#fbfaf7] text-text-primary">
      <section className="relative isolate overflow-hidden bg-brand-primary text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(165, 37, 56,0.18),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(47,111,228,0.18),transparent_28%)]" />
        <div className="page-shell relative py-12 sm:py-16">
          <div className="max-w-4xl">
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/72 transition hover:gap-3 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to all comparisons
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge variant="premium" className="border-0 px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                {competitor.badge || competitor.category}
              </Badge>
              <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-medium text-white/70">
                {competitor.category}
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              MasseurMatch vs {competitor.name}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
              {competitor.heroSummary}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" className="rounded-full px-6">
                <Link href="/register">
                  Create free profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="glass" className="rounded-full px-6">
                <Link href="/pricing">Compare MasseurMatch plans</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-brand-accent/12 text-brand-soft">
                  <Search className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-white">Best fit for MasseurMatch</p>
                <p className="mt-2 text-sm leading-6 text-white/68">{competitor.bestForMasseurMatch}</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-brand-accent/12 text-brand-soft">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-white">Best fit for {competitor.name}</p>
                <p className="mt-2 text-sm leading-6 text-white/68">{competitor.bestForCompetitor}</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-brand-accent/12 text-brand-soft">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-white">Bottom line</p>
                <p className="mt-2 text-sm leading-6 text-white/68">{competitor.verdict}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-12 sm:py-16">
        <div className="premium-surface rounded-[32px] border border-border-subtle p-6 shadow-[var(--shadow-md)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-action-secondary">
                Comparison snapshot
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand-primary">
                {competitor.hubHeadline}
              </h2>
              <p className="mt-4 text-sm leading-7 text-text-secondary">
                {competitor.hubDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {targetKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-border-subtle bg-[rgb(var(--color-bg-body-rgb)/0.76)] px-3 py-1 text-xs font-medium text-action-secondary"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 overflow-x-auto rounded-[24px] border border-border-subtle">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-[rgb(var(--color-bg-body-rgb)/0.82)]">
                <tr className="border-b border-border-subtle">
                  <th className="px-5 py-4 text-left font-semibold text-brand-primary">Feature</th>
                  <th className="px-5 py-4 text-left font-semibold text-brand-primary">MasseurMatch</th>
                  <th className="px-5 py-4 text-left font-semibold text-text-secondary">{competitor.name}</th>
                </tr>
              </thead>
              <tbody>
                {competitor.featureRows.map((row, index) => (
                  <tr key={row.feature} className={index % 2 === 0 ? "bg-white" : "bg-[rgb(var(--color-bg-body-rgb)/0.68)]"}>
                    <td className="px-5 py-4 font-medium text-brand-primary">{row.feature}</td>
                    <td className="px-5 py-4 text-text-secondary">{row.masseurmatch}</td>
                    <td className="px-5 py-4 text-text-secondary">{row.competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="page-shell pb-12">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[28px] border border-primary/20 bg-primary/5 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-brand-primary text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-brand-primary">
              Why therapists choose MasseurMatch
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
              {competitor.whyMasseurMatch.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-brand-accent" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="premium-surface rounded-[28px] border border-border-subtle p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-bg-subtle text-brand-secondary">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-brand-primary">
              When {competitor.name} may still fit
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
              {competitor.whenCompetitorFits.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-brand-secondary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="page-shell pb-12 sm:pb-16">
        <div className="premium-surface rounded-[32px] border border-border-subtle p-6 shadow-[var(--shadow-md)] sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-brand-primary">
            Frequently asked questions
          </h2>
          <div className="mt-6 grid gap-3">
            {competitor.faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-[22px] border border-border-subtle bg-[rgb(var(--color-bg-body-rgb)/0.68)] px-5 py-4"
              >
                <summary className="cursor-pointer list-none text-base font-semibold text-brand-primary">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell pb-12">
        <div className="rounded-[32px] border border-border-subtle bg-[linear-gradient(135deg,rgb(var(--color-bg-body-rgb)/0.88)_0%,#ffffff_100%)] p-6 sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-action-secondary">
              Next step
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand-primary">
              {competitor.ctaTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-text-secondary">
              {competitor.ctaBody}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="default" className="rounded-full px-6">
              <Link href="/register">
                Create free profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="page-shell pb-16">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-action-secondary">
              Related comparisons
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-primary">
              Explore adjacent alternatives
            </h2>
          </div>
          <Link
            href="/compare"
            className="hidden items-center gap-2 text-sm font-semibold text-brand-secondary transition hover:gap-3 sm:inline-flex"
          >
            View compare hub
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {relatedComparisons.map((item) => (
            <Link
              key={item.slug}
              href={`/compare/${item.slug}`}
              className="premium-surface group rounded-[26px] border border-border-subtle p-5 shadow-[0_16px_32px_rgb(var(--color-brand-primary-rgb)/0.04)] transition duration-300 hover:-translate-y-1 hover:border-brand-accent/35"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                {item.category}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-brand-primary">
                MasseurMatch vs {item.name}
              </h3>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {item.hubDescription}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary transition group-hover:gap-3">
                Read comparison
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
