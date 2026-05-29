"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

type Cycle = "monthly" | "yearly";

const PLANS = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    description: "Get started with a basic presence",
    badge: null,
    featured: false,
    features: ["Basic profile listing", "1 city listing", "Contact form"],
    cta: "Get started",
    ctaHref: "/signup",
    filled: false,
  },
  {
    id: "verified",
    name: "Verified",
    monthly: 49,
    yearly: 39,
    description: "Grow your practice with verified trust signals",
    badge: "Most Popular",
    featured: true,
    features: [
      "Verified badge on profile",
      "Multi-city listings",
      "Priority search placement",
      "Analytics dashboard",
    ],
    cta: "Start Verified",
    ctaHref: "/pricing",
    filled: true,
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 99,
    yearly: 79,
    description: "Maximum visibility for established therapists",
    badge: null,
    featured: false,
    features: [
      "Everything in Verified",
      "Featured homepage placement",
      "Hotel & travel listings",
      "Premium support",
      "Custom profile URL",
    ],
    cta: "Go Pro",
    ctaHref: "/pricing",
    filled: false,
  },
] as const;

const springConfig = { type: "spring", stiffness: 400, damping: 30 } as const;

export function PricingToggle() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center lg:mb-16">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Pricing</p>
          <h2 className="mt-3 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight">
            Plans for therapists.
          </h2>
        </div>

        {/* Billing-cycle toggle */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex rounded-full bg-muted p-1">
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className="relative rounded-full px-5 py-2 text-sm font-semibold"
              >
                {cycle === c && (
                  <motion.span
                    layoutId="pricing-toggle"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={springConfig}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    cycle === c ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {c === "monthly" ? "Monthly" : "Yearly — Save 20%"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const price = cycle === "monthly" ? plan.monthly : plan.yearly;
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl border p-8 ${
                  plan.featured
                    ? "scale-[1.02] border-primary ring-2 ring-primary"
                    : "border-border bg-card"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <p className="font-display text-2xl font-bold">{plan.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

                <div className="mt-6 flex items-end gap-1.5">
                  <span className="font-display text-5xl font-extrabold leading-none">
                    {price === 0 ? "Free" : `$${price}`}
                  </span>
                  {price > 0 && (
                    <span className="mb-1 text-base text-muted-foreground">/mo</span>
                  )}
                </div>
                {cycle === "yearly" && price > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Billed annually &mdash; ${price * 12}/yr
                  </p>
                )}

                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`mt-8 flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    plan.filled
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
