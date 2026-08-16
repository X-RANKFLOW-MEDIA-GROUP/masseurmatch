import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { CheckCircle2, TrendingUp } from "lucide-react";

import { IconArrowRight, IconLock, IconShield, IconSpark } from "@/components/icons";
import { SIGNUP_PLANS } from "@/app/signup/_lib/plans";
import { PRICE_LOCK } from "@/lib/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing | Provider Listing Plans - MasseurMatch",
  description:
    "Compare MasseurMatch Free, Standard, Pro, and Elite provider listing plans, including visibility, profile, analytics, travel, and AI features.",
  openGraph: {
    title: "MasseurMatch Pricing for Massage Therapists",
    description: "Compare Free, Standard, Pro, and Elite provider listing plans.",
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
    title: "Defined visibility benefits",
    body: "Paid plans can increase eligible placement and unlock additional provider tools, but they do not guarantee views, leads, clients, bookings, or revenue.",
  },
  {
    icon: IconShield,
    title: "Trust stays separate",
    body: "Subscription tier and paid placement do not verify identity, licensing, qualifications, background, service quality, or safety. Identity verification is a separate identity-only process.",
  },
  {
    icon: IconSpark,
    title: "No session commission",
    body: "MasseurMatch is a directory. Clients contact independent providers directly, and MasseurMatch does not process or take a commission from massage-session payments.",
  },
];

const faqs = [
  {
    q: "Can I start with Free and upgrade later?",
    a: "Yes. Start with Free and move to Standard, Pro, or Elite when you want the additional features and placement included in that plan.",
  },
  {
    q: "Do paid plans include a trial?",
    a: "The current paid tiers include a 14-day trial. The billing terms shown during PayPal checkout control the subscription you approve.",
  },
  {
    q: "How does the founding-member offer work?",
    a: "Eligible founding members receive the introductory offer shown during signup. The temporary discount and any base-rate protection are governed by the offer terms presented with the subscription.",
  },
  {
    q: "Does paying for Pro or Elite verify me?",
    a: "No. Payment and identity verification are separate. An Identity Verified signal confirms only that the provider completed MasseurMatch's identity-review process. It does not verify professional licensing, qualifications, background, or service quality.",
  },
  {
    q: "How is provider subscription billing processed?",
    a: "Paid provider subscriptions are processed through PayPal. Available payment methods are shown by PayPal at checkout. MasseurMatch does not store full payment card or bank account numbers.",
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
              Choose the plan that fits your practice
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              Compare the current provider listing plans by profile features, directory placement, analytics,
              travel tools, and other included capabilities. Pay only after your profile passes review.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" variant="hero">
                <Link href="/signup/plan">
                  Choose a plan
                  <IconArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Questions before joining?</Link>
              </Button>
            </div>

            {PRICE_LOCK ? (
              <p className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-badge-verified-border bg-badge-verified-light px-3.5 py-1.5 text-xs font-semibold text-badge-verified">
                <IconLock size={14} />
                Eligible founding-member base-rate protection applies while the qualifying subscription remains active
              </p>
            ) : null}
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-white/92 p-5 text-left shadow-[var(--shadow-md)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Review first</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">No paid-plan charge before approval</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Complete your profile and verification first. If your selected paid plan is approved, you activate it through PayPal before the listing becomes public.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-white/92 p-5 text-left shadow-[var(--shadow-md)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Trial</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">14 days on current paid tiers</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Trial and renewal details are shown before you approve the PayPal subscription.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-white/92 p-5 text-left shadow-[var(--shadow-md)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Billing</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">Processed through PayPal</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                MasseurMatch processes provider subscription access, not payments between clients and independent providers.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Provider plans</p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Compare current plan features
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Free keeps the entry barrier low. Standard, Pro, and Elite add defined profile, placement, analytics,
              travel, and AI capabilities according to the plan selected.
            </p>
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
                    {plan.tier === "free" ? "Start free" : "Start application"}
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
                Paid plans are listing and feature products. Subscription tier or promotional placement does not
                imply endorsement, identity verification, professional licensing, qualifications, or recommendation
                by MasseurMatch. Identity Verified is a separate identity-only trust signal.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 pt-4">
          <div className="rounded-[2.4rem] border border-brand-secondary/15 bg-[linear-gradient(135deg,rgba(12,28,51,0.98),rgba(18,53,88,0.95))] px-8 py-12 text-white shadow-[var(--shadow-xl)]">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Build your profile first. Pay only after approval.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/72">
                Choose your preferred plan, complete verification and profile review, then activate a paid subscription through PayPal if your approved plan requires payment.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg" variant="premium">
                  <Link href="/signup/plan">
                    Start your application
                    <IconArrowRight size={16} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="glass">
                  <Link href="/contact">Contact support</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
