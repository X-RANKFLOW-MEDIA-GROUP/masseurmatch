"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSignup } from "../_lib/signup-context";
import { useAuth } from "@/contexts/AuthContext";
import { SIGNUP_PLANS, type SignupPlanTier } from "../_lib/plans";

function SignupPlanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, setPlan } = useSignup();
  const { user } = useAuth();

  // Auto-select from query param
  useEffect(() => {
    const preselected = searchParams?.get("selected") as SignupPlanTier | null;
    if (preselected && SIGNUP_PLANS.some((p) => p.tier === preselected)) {
      setPlan(preselected);
    }
  }, [searchParams, setPlan]);

  function handleSelect(tier: SignupPlanTier) {
    setPlan(tier);

    if (user) {
      // Already authenticated — skip account creation
      router.push("/signup/verify");
    } else {
      router.push("/signup/account");
    }
  }

  return (
    <div className="space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Choose Your Listing Plan
        </h1>
        <p className="mt-3 text-muted-foreground">
          Select the plan that fits your visibility and growth goals.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SIGNUP_PLANS.map((plan) => {
          const isSelected = state.selectedPlanTier === plan.tier;
          return (
            <Card
              key={plan.tier}
              className={
                plan.popular
                  ? "relative border-brand-secondary/40 shadow-[0_12px_32px_rgb(var(--color-brand-secondary-rgb)/0.12)]"
                  : isSelected
                    ? "border-brand-secondary/30"
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
                  <h2 className="font-display text-lg font-semibold">{plan.name}</h2>
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
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="mt-auto"
                  onClick={() => handleSelect(plan.tier)}
                >
                  Continue with {plan.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sticky mobile bar */}
      {state.selectedPlanTier && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-4 backdrop-blur sm:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {SIGNUP_PLANS.find((p) => p.tier === state.selectedPlanTier)?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {SIGNUP_PLANS.find((p) => p.tier === state.selectedPlanTier)?.priceDisplay}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleSelect(state.selectedPlanTier!)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SignupPlanFallback() {
  return (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Choose Your Listing Plan
        </h1>
        <p className="mt-3 text-muted-foreground">
          Loading available plan options...
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-3xl border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}

export default function SignupPlanPage() {
  return (
    <Suspense fallback={<SignupPlanFallback />}>
      <SignupPlanPageContent />
    </Suspense>
  );
}
