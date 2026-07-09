import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { CheckCircle2, TrendingUp } from "lucide-react";

import { ProviderGrowthMarketplace } from "@/app/_components/provider-growth-marketplace";
import { IconArrowRight, IconLock, IconShield, IconSpark } from "@/components/icons";
import { SIGNUP_PLANS } from "@/app/signup/_lib/plans";
import { PRICE_LOCK } from "@/lib/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing | Listing Plans & Growth Add-Ons - MasseurMatch",
  description:
    "Compare Free, Standard, Pro, and Elite listing plans plus stackable visibility boosts, trust upgrades, geo discovery, and premium exposure add-ons.",
  openGraph: {
    title: "MasseurMatch Pricing for Massage Therapists",
    description:
      "Base listing plans plus market-aligned add-ons for visibility, trust, geo discovery, and premium exposure.",
    url: "https://masseurmatch.com/pricing",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://masseurmatch.com/pricing" },
};

const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "MasseurMatch Pricing",
  url: "https://masseurmatch.com/pricing",
  mainEntity: SIGNUP_PLANS.map((plan) => ({
    "@type": "Offer",
    name: `${plan.name} Listing`,
    price: String(plan.price),
    priceCurrency: "USD",
    description: plan.description,
    eligibleCustomerType: "https://schema.org/BusinessEntityType",
  })),
};

const strategyCards = [
  {
    icon: TrendingUp,
    title: "Visibility first",
    body: "Low-ticket boosts make it easy to buy fast, while mid-ticket placements capture therapists ready for a bigger demand push.",
  },
  {
    icon: IconShield,
    title: "Trust converts",
    body: "Verification credentials and proof badges improve first-contact conversion and support higher pricing confidence.",
  },
  {
    icon: IconSpark,
    title: "Stack for margin",
    body: "Recurring analytics and geo tools create software-style revenue, while scarce premium slots protect higher-margin inventory.",
  },
];

const faqs = [
  {
    q: "Can I start with Free and upgrade later?",
    a: "Yes. Start with Free, then move into Standard, Pro, or Elite whenever you want stronger placement and richer profile tools.",
  },
  {
    q: "Do paid plans include a trial?",
    a: "Yes. Paid tiers include a 14-day free trial, and the first 50 members keep the founder discount for the first 3 months after trial.",
  },
  {
    q: "How do the add-ons work?",
    a: "Add-ons are stackable upgrades for visibility, trust, geo discovery, analytics, and premium exposure. Each add-on clearly shows its impact preview, duration, placement, and best bundle so it is easy to compare before purchase.",
  },
  {
    q: "What does Featured, Boosted, or Trending mean?",
    a: "Those are paid advertising placements and labels. They do not imply endorsement, credential verification, or recommendation by MasseurMatch.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept major credit and debit cards through Stripe for listing plans, and provider billing is managed securely through Stripe.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Script
        id="pricing-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />

      <div className="bg-[radial-gradient(circle_at_top,rgba(139,30,45,0.05),transparent_35%),linear-gradient(180deg,#ffffff_0%,#f7f7f7_100%)]">
        <section className="container mx-auto px-4 pb-10 pt-14 sm:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="premium">Pricing</Badge>
            <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Plans and add-ons built for maximum visibility and conversion
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              Start with a base listing, then stack market-aligned boosts, credibility layers, geo targeting, and
              limited premium exposure to increase demand without forcing every therapist into the same plan.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" variant="hero">
                <Link href="/signup/plan">
                  Choose a plan
                  <IconArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pro/billing#addons">See add-ons</Link>
              </Button>
            </div>

            {PRICE_LOCK && (
              <p className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-badge-verified-border bg-badge-verified-light px-3.5 py-1.5 text-xs font-semibold text-badge-verified">
                <IconLock size={14} />
                Founding-member price lock — your rate never increases while subscribed
              </p>
            )}
          </div>

          {/* Market anchoring strip */}
          <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-badge-promo-border/60 bg-badge-promo-light/70 px-6 py-4">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-badge-promo">How we compare</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-foreground">$300–$375</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Legacy directories · one city</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs font-medium text-amber-700">vs. MasseurMatch Elite</p>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">$99</p>
                <p className="mt-0.5 text-xs text-muted-foreground">3 cities + AI + Demand Radar</p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-white/92 p-5 text-left shadow-[var(--shadow-md)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Trial</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">14 days on paid tiers</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Let therapists experience the visibility lift before the first paid cycle starts.</p>
            </div>
            <div className="rounded-3xl border border-border bg-white/92 p-5 text-left shadow-[var(--shadow-md)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Founder offer</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">50% off first 3 months</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">A strong pricing anchor that improves early conversion without discounting the full catalog long term.</p>
            </div>
            <div className="rounded-3xl border border-border bg-white/92 p-5 text-left shadow-[var(--shadow-md)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Monetization mix</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">$6 to $59 add-ons</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Low-ticket impulse buys, recurring SaaS upgrades, and premium scarce inventory are all designed to stack.</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Base plans</p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Choose the right plan foundation
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Free and Standard keep the barrier low. Pro and Elite give therapists the stronger media, placement,
                and analytics foundation that makes the add-on catalog even more effective.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {SIGNUP_PLANS.map((plan) => (
              <section
                key={plan.tier}
                className={`rounded-[1.9rem] border p-5 text-left shadow-[var(--shadow-md)] ${
                  plan.popular
                    ? "border-brand-secondary/25 bg-[linear-gradient(180deg,rgba(241,248,255,0.95),rgba(255,255,255,0.98))]"
                    : "border-border bg-white/92"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {plan.popular ? <Badge>Most Popular</Badge> : null}
                  <Badge variant="secondary">{plan.tier === "free" ? "No trial needed" : "14-day free trial"}</Badge>
                </div>

                <p className="mt-4 text-sm uppercase tracking-[0.18em] text-muted-foreground">{plan.tier}</p>
                <h3 className="font-display mt-2 text-2xl font-semibold tracking-tight text-foreground">{plan.name}</h3>
                <p className="mt-2 text-3xl font-semibold text-foreground">{plan.priceDisplay}</p>
                {plan.founderPrice ? <p className="mt-2 text-sm font-medium text-brand-secondary">{plan.founderPrice}</p> : null}
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.description}</p>

                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-badge-verified" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild className="mt-6 w-full" variant={plan.popular ? "hero" : "outline"}>
                  <Link href={`/signup/plan?selected=${plan.tier}`}>
                    {plan.tier === "free" ? "Start free" : "Start 14-day trial"}
                    <IconArrowRight size={16} />
                  </Link>
                </Button>
              </section>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {strategyCards.map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border border-border bg-white/92 p-6 shadow-[var(--shadow-md)]"
              >
                <card.icon className="h-5 w-5 text-brand-secondary" />
                <h3 className="font-display mt-4 text-2xl font-semibold tracking-tight text-foreground">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <ProviderGrowthMarketplace source="pricing" />
        </section>

        <section className="container mx-auto px-4 py-10">
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-white/92 p-8 shadow-[var(--shadow-md)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">FAQ</p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-foreground">Pricing questions</h2>
            <div className="mt-6 space-y-4">
              {faqs.map((item) => (
                <details key={item.q} className="rounded-[1.4rem] border border-border/80 bg-slate-950/[0.02] px-5 py-4">
                  <summary className="cursor-pointer list-none text-base font-semibold text-foreground">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-dashed border-border/80 bg-white/70 px-5 py-4">
              <p className="text-sm leading-7 text-muted-foreground">
                All plans and add-ons are advertising products. Featured placement, boosted visibility, verified labels,
                and similar signals do not imply endorsement, qualification, or recommendation by MasseurMatch.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 pt-4">
          <div className="rounded-[2.4rem] border border-brand-secondary/15 bg-[linear-gradient(135deg,rgba(12,28,51,0.98),rgba(18,53,88,0.95))] px-8 py-12 text-white shadow-[var(--shadow-xl)]">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Start with the right plan and add only the upgrades that move revenue
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/72">
                Keep entry friction low with Free or Standard, then use Pro, Elite, and stackable add-ons to scale
                visibility, trust, and premium exposure as demand grows.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg" variant="premium">
                  <Link href="/signup/plan">
                    Choose your plan
                    <IconArrowRight size={16} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="glass">
                  <Link href="/contact">Talk to us first</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
