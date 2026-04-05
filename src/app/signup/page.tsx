"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Phone,
  CreditCard,
  ChevronRight,
  MapPin,
  Star,
  Clock,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SIGNUP_PLANS } from "./_lib/plans";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Identity Verified Profiles" },
  { icon: Search, label: "Local Search Visibility" },
  { icon: Phone, label: "Direct Client Contact" },
  { icon: CreditCard, label: "Secure Stripe Powered Billing" },
];

const HOW_IT_WORKS = [
  "Choose your plan",
  "Create your account",
  "Verify your identity",
  "Build your profile",
  "Submit for review",
  "Go live after approval",
];

const WHY_SIGN_UP = [
  { icon: Search, text: "Get found in local search" },
  { icon: Clock, text: "Show availability and service style" },
  { icon: Star, text: "Display your starting price clearly" },
  { icon: ShieldCheck, text: "Build trust with verification" },
  { icon: TrendingUp, text: "Increase visibility with upgraded placement" },
];

export default function SignupEntryPage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="text-center">
        <Badge variant="secondary" className="mb-4">
          For Massage Therapists
        </Badge>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Get Listed on MasseurMatch
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Create your profile, verify your identity, and start getting
          discovered by clients looking for massage services near you.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" variant="hero">
            <Link href="/signup/plan">View Plans</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signup/account">Start Sign Up</Link>
          </Button>
        </div>
      </section>

      {/* Trust strip */}
      <section className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-border/60 bg-bg-subtle/50 px-6 py-5">
        {TRUST_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <item.icon className="h-4 w-4 text-brand-secondary" />
            {item.label}
          </div>
        ))}
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-center font-display text-2xl font-bold tracking-tight text-foreground">
          How Sign Up Works
        </h2>
        <ol className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HOW_IT_WORKS.map((step, idx) => (
            <li key={idx} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-5 py-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-secondary/10 text-xs font-bold text-brand-secondary">
                {idx + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Plan preview */}
      <section>
        <h2 className="text-center font-display text-2xl font-bold tracking-tight text-foreground">
          Choose Your Listing Plan
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Plans built for therapists at every stage.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SIGNUP_PLANS.map((plan) => (
            <Card
              key={plan.tier}
              className={
                plan.popular
                  ? "relative border-brand-secondary/40 shadow-[0_12px_32px_rgb(var(--color-brand-secondary-rgb)/0.12)]"
                  : ""
              }
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardContent className="flex flex-col gap-4 p-6">
                <div>
                  <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-2xl font-bold text-foreground">{plan.priceDisplay}</p>
                  {plan.founderPrice && (
                    <p className="mt-0.5 text-xs text-brand-secondary">{plan.founderPrice}</p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <ul className="space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={plan.popular ? "default" : "outline"} className="mt-auto">
                  <Link href={`/signup/plan?selected=${plan.tier}`}>Select Plan</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why therapists sign up */}
      <section className="text-center">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Why Therapists Sign Up
        </h2>
        <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
          {WHY_SIGN_UP.map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-5 py-4 text-left"
            >
              <item.icon className="h-5 w-5 shrink-0 text-brand-secondary" />
              <span className="text-sm font-medium text-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="rounded-3xl border border-border/60 bg-bg-subtle/50 px-8 py-12 text-center">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Ready to create your profile?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Pick your plan and complete your secure sign up in a few steps.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/signup/plan">
            Continue to Plans <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
