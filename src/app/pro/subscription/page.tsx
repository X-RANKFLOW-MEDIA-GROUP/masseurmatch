"use client";

import Link from "next/link";
import { Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS } from "@/lib/pricing";

const SUBSCRIPTION_TIERS = PLANS.map((plan) => ({
  id: plan.id,
  name: plan.name,
  price: plan.price === 0 ? "$0" : `$${plan.price}`,
  period: plan.price === 0 ? "Forever" : "per month",
  description:
    plan.id === "free"
      ? "Get started with basic visibility"
      : plan.id === "standard"
        ? "A stronger everyday plan with better placement"
        : plan.id === "pro"
          ? "Maximum visibility and features"
          : "Premium placement across cities",
  features: [...plan.features],
  cta: plan.price === 0 ? "Current Plan" : `Upgrade to ${plan.name}`,
  highlighted: plan.mostPopular ?? false,
  isFree: plan.price === 0,
}));

export default function SubscriptionPage() {
  const { subscription } = useAuth();
  const currentPlanKey = subscription.plan_key ?? "free";

  return (
    <main className="mx-auto max-w-7xl space-y-10 p-6 py-12 md:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900">
          Choose Your Plan
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Scale your visibility with MasseurMatch premium subscriptions.
        </p>
        {!subscription.loading && subscription.subscribed && (
          <p className="mt-2 text-sm text-slate-500">
            You are currently on the{" "}
            <strong className="text-slate-800">{subscription.plan_name}</strong> plan.{" "}
            <Link href="/pro/billing" className="text-brand-secondary underline">
              Manage billing
            </Link>
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const isCurrent = tier.id === currentPlanKey;
          return (
            <Card
              key={tier.id}
              className={`flex flex-col ${
                tier.highlighted
                  ? "ring-2 ring-red-600 shadow-lg lg:scale-105"
                  : "border-slate-200"
              } ${isCurrent ? "ring-2 ring-brand-secondary" : ""}`}
            >
              <CardHeader>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">{tier.price}</span>
                    <span className="text-slate-600">{tier.period}</span>
                  </div>
                </div>

                <div className="mb-8 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {isCurrent ? (
                  <Button disabled className="w-full bg-slate-200 text-slate-700">
                    Current Plan
                  </Button>
                ) : tier.isFree ? (
                  <Button disabled variant="outline" className="w-full">
                    Free
                  </Button>
                ) : (
                  <Button
                    asChild
                    className={`w-full ${
                      tier.highlighted
                        ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <Link href="/pro/billing">
                      <CreditCard className="mr-2 h-4 w-4" />
                      {tier.cta}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Questions?</h2>
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 font-semibold text-slate-900">Can I upgrade or downgrade anytime?</h3>
            <p className="text-sm text-slate-600">
              Yes. Changes take effect at the start of your next billing cycle. Unused time is prorated.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-slate-900">What payment methods do you accept?</h3>
            <p className="text-sm text-slate-600">
              All major credit cards through Stripe. Your payment info is encrypted and secure.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-slate-900">Can I cancel anytime?</h3>
            <p className="text-sm text-slate-600">
              Yes. Cancel at any time and you keep access through the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-slate-900">Need help choosing?</h3>
            <p className="text-sm text-slate-600">
              Email us at{" "}
              <a href="mailto:support@masseurmatch.com" className="text-brand-secondary underline">
                support@masseurmatch.com
              </a>{" "}
              and we&apos;ll help you pick the right plan.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
