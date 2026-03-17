import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, createPageMetadata } from "@/app/_lib/seo";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    description: "A basic directory listing for therapists getting started.",
    features: ["Directory presence", "Basic contact path", "Single-city visibility"],
    ctaHref: "/register",
    ctaLabel: "Start free",
  },
  {
    name: "Standard",
    price: "$39",
    description: "A stronger profile with better presentation and search positioning.",
    features: ["More photos", "Better search placement", "Profile performance visibility"],
    ctaHref: "/register",
    ctaLabel: "Choose Standard",
  },
  {
    name: "Pro",
    price: "$79",
    description: "For therapists who want more reach, more profile depth, and stronger conversion signals.",
    features: ["Expanded media", "Higher placement", "Advanced profile tools"],
    featured: true,
    ctaHref: "/register",
    ctaLabel: "Choose Pro",
  },
  {
    name: "Elite",
    price: "$99",
    description: "Premium visibility for therapists competing in deeper city markets.",
    features: ["Featured placement", "Cross-city reach", "Priority discovery surfaces"],
    ctaHref: "/register",
    ctaLabel: "Choose Elite",
  },
  {
    name: "Platinum",
    price: "Custom",
    description: "A concierge plan for flagship profiles, multi-market expansion, and launch support.",
    features: ["White-glove setup", "Launch support", "Premium market positioning"],
    ctaHref: "/contact",
    ctaLabel: "Contact sales",
  },
];

export const metadata: Metadata = createPageMetadata({
  title: "Pricing",
  description: "Compare MasseurMatch plans from Free through Platinum and choose the profile visibility level that fits your market.",
  path: "/pricing",
  keywords: ["pricing", "therapist plans", "directory advertising", "platinum plan"],
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
          description: "Five public pricing tiers for therapists advertising on MasseurMatch.",
          path: "/pricing",
        })}
      />

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Pricing</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">Five visibility tiers from Free through Platinum.</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            MasseurMatch pricing is structured around profile strength, city reach, and how much help a therapist wants with growth.
            Start simple or move into a premium tier built for denser markets.
          </p>
        </div>

        <div className="mt-10 grid gap-5 xl:grid-cols-5">
          {PLANS.map((plan) => (
            <section
              key={plan.name}
              className={`rounded-3xl border p-6 shadow-sm ${plan.featured ? "border-primary bg-primary/5" : "border-border bg-background"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
                {plan.featured ? <Badge>Most popular</Badge> : null}
              </div>
              <p className="mt-4 text-3xl font-bold text-foreground">{plan.price}<span className="text-sm font-medium text-muted-foreground">{plan.price === "Custom" ? "" : "/mo"}</span></p>
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
          <h2 className="text-2xl font-semibold text-foreground">Plan notes</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <article>
              <h3 className="font-semibold text-foreground">Trials and promos</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Paid checkout supports promotion codes and trial-based acquisition flows.</p>
            </article>
            <article>
              <h3 className="font-semibold text-foreground">Direct contact model</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">MasseurMatch supports discovery and profile visibility. Therapists and clients connect directly.</p>
            </article>
            <article>
              <h3 className="font-semibold text-foreground">Need a custom rollout?</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Use Platinum when you want launch help, stronger positioning, or multi-market support.</p>
            </article>
          </div>
        </section>
      </div>
    </>
  );
}