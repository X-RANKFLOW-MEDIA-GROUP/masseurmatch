import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Scale } from "lucide-react";

import { IconArrowRight, IconSearch, IconShield } from "@/components/icons";
import { JsonLd } from "@/app/_components/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  COMPARISON_HUB_INTRO,
  competitorsByTier,
  getCompetitorTierLabel,
} from "@/lib/competitors";

export const metadata: Metadata = createPageMetadata({
  title: "MasseurMatch vs Competitors",
  description:
    "Compare MasseurMatch against the main massage directory competitors, organized by tier, with statically generated pages built for SEO in 2026.",
  path: "/compare",
  keywords: competitorsByTier.flatMap((competitor) => [
    `MasseurMatch vs ${competitor.name}`,
    `${competitor.name} alternative`,
  ]),
});

const tierIntro: Record<1 | 2 | 3, string> = {
  1: "The two names therapists mention first when comparing niche directory visibility and brand positioning.",
  2: "Secondary directory alternatives that still matter when evaluating where to place and prioritize a public profile.",
  3: "Long-tail niche and boutique competitors that are often used as supporting channels rather than the main brand destination.",
};

const groupedCompetitors = [1, 2, 3].map((tier) => ({
  tier,
  label: getCompetitorTierLabel(tier as 1 | 2 | 3),
  description: tierIntro[tier as 1 | 2 | 3],
  items: competitorsByTier.filter((competitor) => competitor.tier === tier),
}));

export default function CompareHubPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "MasseurMatch comparison hub",
          description: COMPARISON_HUB_INTRO,
          path: "/compare",
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: "MasseurMatch competitor comparison pages",
          path: "/compare",
          items: competitorsByTier.map((competitor) => ({
            name: `MasseurMatch vs ${competitor.name}`,
            path: `/compare/${competitor.slug}`,
          })),
        })}
      />

      <div className="bg-[#fbfaf7] text-text-primary">
        <section className="relative isolate overflow-hidden bg-brand-primary text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(165, 37, 56,0.18),transparent_26%),radial-gradient(circle_at_78%_18%,rgba(47,111,228,0.18),transparent_30%)]" />
          <div className="page-shell relative py-14 sm:py-18">
            <div className="max-w-4xl">
              <Badge variant="premium" className="border-0 px-4 py-2 text-[11px] tracking-[0.22em]">
                SEO comparison hub
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                MasseurMatch vs the main competitors
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
                {COMPARISON_HUB_INTRO}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="hero" className="rounded-full px-6">
                  <Link href="/register">
                    Create free profile
                    <IconArrowRight size={16} />
                  </Link>
                </Button>
                <Button asChild variant="glass" className="rounded-full px-6">
                  <Link href="/pricing">Compare plans</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {[
                  {
                    icon: IconSearch,
                    title: "Search-first structure",
                    body: "Each comparison page targets high-intent alternative queries and stays linked back into the main directory.",
                  },
                  {
                    icon: IconShield,
                    title: "Cleaner positioning",
                    body: "The pages emphasize trust, premium presentation, and a more professional public profile strategy.",
                  },
                  {
                    icon: Scale,
                    title: "Single source of truth",
                    body: "Competitor data, metadata, and JSON-LD are all generated from one dataset so expansion stays consistent.",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-brand-accent/12 text-brand-soft">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="mt-4 text-base font-semibold text-white">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-white/66">{item.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell py-14 sm:py-16">
          <div className="space-y-12">
            {groupedCompetitors.map((group) => (
              <section key={group.label}>
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-action-secondary">
                    {group.label}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand-primary">
                    {group.items.length} comparison pages in {group.label.toLowerCase()}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{group.description}</p>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {group.items.map((competitor) => (
                    <Link
                      key={competitor.slug}
                      href={`/compare/${competitor.slug}`}
                      className="premium-surface group rounded-[28px] border border-border-subtle p-6 shadow-[0_16px_36px_rgb(var(--color-brand-primary-rgb)/0.04)] transition duration-300 hover:-translate-y-1 hover:border-brand-accent/35"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant={competitor.tier === 1 ? "premium" : "outline"} className="border-0">
                          {group.label}
                        </Badge>
                        <span className="text-xs font-medium uppercase tracking-[0.18em] text-text-muted">
                          {competitor.category}
                        </span>
                      </div>
                      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-brand-primary">
                        MasseurMatch vs {competitor.name}
                      </h3>
                      <p className="mt-3 text-sm font-medium text-action-secondary">
                        {competitor.hubHeadline}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-text-secondary">
                        {competitor.hubDescription}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary transition group-hover:gap-3">
                        Read comparison
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
