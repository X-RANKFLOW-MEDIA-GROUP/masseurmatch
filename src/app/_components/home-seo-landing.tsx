import Link from "next/link";
import { BookOpenText, ChevronRight, Scale } from "lucide-react";
import type { GuideArticle } from "@/app/guides/data";
import type { Competitor } from "@/lib/competitors";
import { US_CITIES } from "@/data/cities";

type HomeSeoLandingProps = {
  comparisonLinks: Competitor[];
  guides: GuideArticle[];
};

export function HomeSeoLanding({ comparisonLinks, guides }: HomeSeoLandingProps) {
  return (
    <section className="page-shell py-10 sm:py-12">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">

        {/* Comparison hub */}
        <div className="rounded-[2rem] border border-border bg-card p-7 shadow-[0_18px_42px_rgba(26,26,26,0.18)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-primary/10 text-primary">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Comparison hub</p>
              <h2 className="mt-1 text-2xl font-semibold text-foreground">
                Capture competitor searches before users leave.
              </h2>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            Comparison pages are one of the fastest ways to win high-intent traffic from users already evaluating
            alternatives. Each page links back into city, safety, pricing, and registration flows so search intent
            becomes a full-site entry point.
          </p>
          <div className="mt-6 space-y-3">
            {comparisonLinks.map((competitor) => (
              <Link
                key={competitor.slug}
                href={`/compare/${competitor.slug}`}
                className="group flex items-start justify-between gap-4 rounded-[1.4rem] border border-border bg-white/5 px-4 py-4 transition hover:border-primary/40"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    MasseurMatch vs {competitor.name}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {competitor.hubHeadline}
                  </p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>

        {/* Guides */}
        <div className="rounded-[2rem] border border-border bg-card p-7 shadow-[0_18px_42px_rgba(26,26,26,0.18)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-primary/10 text-primary">
              <BookOpenText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Guides</p>
              <h2 className="mt-1 text-2xl font-semibold text-foreground">
                Helpful content that feeds city and service pages.
              </h2>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-text-secondary">
            Guides help capture earlier research queries while still routing visitors back into city pages,
            session-type pages, and trust content. That gives Google and Bing more topical context without
            turning the site into thin SEO filler.
          </p>
          <div className="mt-6 space-y-3">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group flex items-start justify-between gap-4 rounded-[1.4rem] border border-border bg-white/5 px-4 py-4 transition hover:border-primary/40"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{guide.h1}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{guide.description}</p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
