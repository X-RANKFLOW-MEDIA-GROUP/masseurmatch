"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { IconLock } from "@/components/icons";
import { PLANS, PRICE_LOCK } from "@/lib/pricing";

const springConfig = { type: "spring", stiffness: 400, damping: 30 } as const;

export function PricingToggle() {
  const featured = PLANS;

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center lg:mb-16">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Pricing</p>
          <h2 className="mt-3 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight">
            Plans for therapists.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            14-day free trial on all paid tiers · Founder offer: 50% off your first 3 months
          </p>
          {PRICE_LOCK && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <IconLock size={12} />
              Founding member rates are price-locked — your rate never increases while subscribed
            </p>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((plan) => (
            <motion.div
              key={plan.id}
              layout
              transition={springConfig}
              className={`relative rounded-3xl border p-8 ${
                plan.mostPopular
                  ? "scale-[1.02] border-primary ring-2 ring-primary"
                  : "border-border bg-card"
              }`}
            >
              {plan.mostPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}

              <p className="font-display text-2xl font-bold">{plan.name}</p>

              <div className="mt-6 flex items-end gap-1.5">
                <span className="font-display text-5xl font-extrabold leading-none">
                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="mb-1 text-base text-muted-foreground">/mo</span>
                )}
              </div>

              {plan.trialDays > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {plan.trialDays}-day free trial
                </p>
              )}

              {plan.anchor && (
                <p className="mt-2 text-xs italic text-muted-foreground">{plan.anchor}</p>
              )}

              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/signup/plan?selected=${plan.id}`}
                className={`mt-8 flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  plan.mostPopular
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border hover:bg-muted"
                }`}
              >
                {plan.price === 0 ? "Get started free" : `Start ${plan.name}`}
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Need the full comparison?{" "}
          <Link href="/pricing" className="font-semibold text-primary hover:underline">
            See all plans
          </Link>
        </p>
      </div>
    </section>
  );
}
