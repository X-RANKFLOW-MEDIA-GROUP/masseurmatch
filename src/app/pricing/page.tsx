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
    "Compare Free, Standard, Pro, and Elite listing plans, promotional placement, analytics, travel tools, and other provider features.",
  openGraph: {
    title: "MasseurMatch Pricing for Massage Therapists",
    description: "Compare provider listing plans and clearly labeled visibility add-ons.",
    url: "https://www.masseurmatch.com/pricing",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://www.masseurmatch.com/pricing" },
};

const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "MasseurMatch Pricing",
  url: "https://www.masseurmatch.com/pricing",
  mainEntity: SIGNUP_PLANS.map((plan) => ({
    "@type": "Offer",
    name: `${plan.name} Listing`,
    price: String(plan.price),
    priceCurrency: "USD",
    description: plan.description,
  })),
};

const strategyCards = [
  {
    icon: TrendingUp,
    title: "Visibility",
    body: "Paid tiers and promotional placements can increase where and how often an eligible profile appears. They do not guarantee leads, clients, bookings, or revenue.",
  },
  {
    icon: IconShield,
    title: "Trust stays separate",
    body: "Identity verification is earned through the verification workflow. Payment, Featured placement, and subscription tier do not verify identity or professional credentials.",
  },
  {
    icon: IconSpark,
    title: "Add only what you need",
    body: "Optional add-ons can expand visibility, analytics, geo discovery, or other product capabilities when those products are available.",
  },
];

const faqs = [
  {
    q: "Can I start with Free and upgrade later?",
    a: "Yes. You can start with Free and move to another available plan when you want the features and placement included in that tier.",
  },
  {
    q: "Do paid plans include a trial?",
    a: "The current paid tiers show a 14-day trial. The founding-member introductory offer provides 50% off the first three paid months for eligible founding members. The temporary discount ends after those three paid months.",
  },
  {
    q: "What does the founding-member price lock cover?",
    a: "For an eligible founding member, the base subscription rate that applies after the temporary introductory discount stays locked while that same subscription remains continuously active and eligible. The lock does not extend the temporary discount or freeze taxes, separate add-ons, upgrades, or different plans.",
  },
  {
    q: "What do Featured, Boosted, Trending, or Sponsored mean?",
    a: "They are promotional or advertising signals. They do not imply endorsement, identity verification, professional licensing, qualifications, or recommendation by MasseurMatch.",
  },
  {
    q: "What does Identity Verified mean?",
    a: "Identity Verified is separate from paid placement. It means the provider successfully completed MasseurMatch's identity-only review. It does not verify professional licenses, background, qualifications, or service quality.",
  },
  {
    q: "How is provider billing processed?",
    a: "Provider subscription billing is processed through Stripe. MasseurMatch does not store full payment card numbers.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Script id="pricing-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }} />

      <div className="bg-[radial-gradient(circle_at_top,rgba(139,30,45,0.05),transparent_35%),linear-gradient(180deg,#ffffff_0%,#f7f7f7_100%)]">
        <section className="container mx-auto px-4 pb-10 pt-14 sm:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="premium">Pricing</Badge>
            <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Choose the visibility and tools that fit your practice
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              Plans combine listing features, placement, analytics, travel tools, and other provider capabilities.
              Promotional placement is always separate from identity verification and professional credentials.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" variant="hero">
                <Link href="/signup/plan">Choose a plan <IconArrowRight size={16} /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pro/billing#addons">See add-ons</Link>
              </Button>
            </div>

            {PRICE_LOCK ? (
              <p className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-badge-verified-border bg-badge-verified-light px-3.5 py-1.5 text-xs font-semibold text-badge-verified">
                <IconLock size={14} /> Founding-member base-rate lock while the eligible subscription remains active
              </p>
            ) : null}
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-white/92 p-5 text-left shadow-[var(--shadow-md)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Trial</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">14 days on current paid tiers</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Trial terms are shown before purchase.</p>
            </div>
            <div className="rounded-3xl border border-border bg-white/92 p-5 text-left shadow-[var(--shadow-md)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Founder offer</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">50% off first 3 paid months</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">The introductory discount is temporary; the eligible post-promotion base rate is the amount covered by the price lock.</p>
            </div>
            <div className="rounded-3xl border border-border bg-white/92 p-5 text-left shadow-[var(--shadow-md)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Directory model</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">No session commission</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">MasseurMatch does not process massage-session bookings or take a commission from off-platform session payments.</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Base plans</p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Compare current plan features</h2>
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
                    {plan.tier === "free" ? "Start free" : "Start 14-day trial"} <IconArrowRight size={16} />
                  </Link>
                </Button>
              </section>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {strategyCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-border bg-white/92 p-6 shadow-[var(--shadow-md)]">
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
                  <summary className="cursor-pointer list-none text-base font-semibold text-foreground">{item.q}</summary>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-dashed border-border/80 bg-white/70 px-5 py-4">
              <p className="text-sm leading-7 text-muted-foreground">
                Paid plans and paid add-ons are listing, feature, or promotional products. Featured, Boosted,
                Trending, Sponsored, and similar promotional labels do not imply endorsement, identity
                verification, professional licensing, qualifications, or recommendation. Identity Verified is a
                separate identity-only trust signal earned through the verification workflow.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 pt-4">
          <div className="rounded-[2.4rem] border border-brand-secondary/15 bg-[linear-gradient(135deg,rgba(12,28,51,0.98),rgba(18,53,88,0.95))] px-8 py-12 text-white shadow-[var(--shadow-xl)]">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Choose the plan that matches the visibility and tools you need</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/72">
                Upgrade for defined product features and promotional placement, not for promises of clients, bookings, income, or professional endorsement.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg" variant="premium">
                  <Link href="/signup/plan">Choose your plan <IconArrowRight size={16} /></Link>
                </Button>
                <Button asChild size="lg" variant="glass"><Link href="/contact">Talk to us first</Link></Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
