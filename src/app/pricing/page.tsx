import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, createPageMetadata } from "@/app/_lib/seo";

type PricingPlan = {
  tier: "free" | "standard" | "pro" | "elite";
  name: string;
  price: string;
  description: string;
  features: string[];
  ctaHref: string;
  ctaLabel: string;
  founderPrice?: string;
  featured?: boolean;
};

type AddOn = {
  name: string;
  price: string;
  description: string;
};

const PLANS: PricingPlan[] = [
  {
    tier: "free",
    name: "Free",
    price: "$0",
    description: "A basic listing for getting discovered without a monthly cost.",
    features: [
      "1 photo",
      "Bottom search placement",
      "Available Now not included",
      "1 travel schedule/month",
      "No analytics",
      '"Basic Listing" watermark',
    ],
    ctaHref: "/register",
    ctaLabel: "Start Free",
  },
  {
    tier: "standard",
    name: "Standard",
    price: "$39",
    description: "A stronger everyday plan with better placement and light analytics.",
    features: [
      "6 photos",
      "Middle search placement",
      "Available Now (60 min)",
      "3 travel schedules/month",
      "Views analytics",
      "Newsletter chance",
    ],
    founderPrice: "$19.50/mo for 3 months",
    ctaHref: "/register",
    ctaLabel: "Choose Standard",
  },
  {
    tier: "pro",
    name: "Pro",
    price: "$79",
    description: "Our most popular growth tier for therapists who want top exposure.",
    features: [
      "12 photos + video",
      "Top search placement",
      "Available Now (120 min)",
      "Unlimited travel schedules",
      "Views + clicks analytics",
      "Homepage rotation",
      "Weekly specials",
      "Verified badge",
    ],
    founderPrice: "$39.50/mo for 3 months",
    featured: true,
    ctaHref: "/register",
    ctaLabel: "Choose Pro",
  },
  {
    tier: "elite",
    name: "Elite",
    price: "$99",
    description: "Everything in Pro plus a second active city for broader reach.",
    features: [
      "12 photos + video",
      "Top search placement",
      "Available Now (120 min)",
      "Unlimited travel schedules",
      "Views + clicks analytics",
      "Homepage rotation",
      "Weekly specials",
      "Verified badge",
      "2 active ads (2 cities)",
    ],
    founderPrice: "$49.50/mo for 3 months",
    ctaHref: "/register",
    ctaLabel: "Choose Elite",
  },
];

const ADD_ONS: AddOn[] = [
  {
    name: "Masseur of the Day",
    price: "$15/day",
    description: "Daily spotlight placement for short-term visibility boosts.",
  },
  {
    name: "Sponsor Profile",
    price: "$99/month",
    description: "Sponsored profile placement for sustained promotion.",
  },
  {
    name: "Extra Travel Schedules",
    price: "$5 each",
    description: "Available for Standard members who need more travel slots.",
  },
  {
    name: "Homepage Banner",
    price: "$120/month",
    description: "Homepage banner placement for broader brand exposure.",
  },
  {
    name: "Credits/Cards",
    price: "Secure communication",
    description: "Planned secure communication add-on for future rollout.",
  },
];

export const metadata: Metadata = createPageMetadata({
  title: "Pricing",
  description: "Compare Free, Standard, Pro, and Elite advertising plans for MasseurMatch, plus upcoming add-ons for extra visibility.",
  path: "/pricing",
  keywords: ["pricing", "therapist plans", "directory advertising", "pro plan", "elite plan"],
});

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "Pricing plans",
          description: "Four public pricing tiers for therapists advertising on MasseurMatch.",
          path: "/pricing",
        })}
      />

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Pricing</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">Four visibility tiers built for therapist growth.</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Compare Free, Standard, Pro, and Elite placements based on media limits, search visibility, Available Now access,
            and how much reach you want across cities.
          </p>
        </div>

        <section className="mt-8 rounded-3xl border border-primary/20 bg-primary/5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <article>
              <h2 className="text-lg font-semibold text-foreground">14-day free trial</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Paid plans start with a 14-day free trial so therapists can test visibility before billing begins.
              </p>
            </article>
            <article>
              <h2 className="text-lg font-semibold text-foreground">Founder deal</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The first 50 members receive 50% off paid plans for the first 3 months after the trial period.
              </p>
            </article>
          </div>
        </section>

        <div className="mt-10 grid gap-5 xl:grid-cols-4">
          {PLANS.map((plan) => (
            <section
              key={plan.name}
              className={`rounded-3xl border p-6 shadow-sm ${plan.featured ? "border-primary bg-primary/5" : "border-border bg-background"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
                {plan.featured ? <Badge>Most Popular</Badge> : null}
              </div>
              <p className="mt-4 text-3xl font-bold text-foreground">{plan.price}<span className="text-sm font-medium text-muted-foreground">/mo</span></p>
              {plan.founderPrice ? (
                <p className="mt-1 text-xs font-semibold text-primary">{plan.founderPrice}</p>
              ) : null}
              {plan.tier !== "free" ? (
                <p className="mt-1 text-xs text-muted-foreground">14-day free trial included</p>
              ) : null}
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full" variant={plan.featured ? "hero" : "outline"}>
                <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
              </Button>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-3xl border border-border bg-secondary/20 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Add-ons</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Informational only for now. Individual Stripe purchase flows can be added next.
              </p>
            </div>
            <Badge variant="outline">Coming Next</Badge>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ADD_ONS.map((addon) => (
              <article key={addon.name} className="rounded-2xl border border-border bg-background p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-foreground">{addon.name}</h3>
                  <Badge variant="secondary">{addon.price}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{addon.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
