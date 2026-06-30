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

/**
 * Reads the optional `?selected=` query param and preselects that plan.
 * Isolated in its own Suspense boundary so `useSearchParams()` only opts THIS
 * leaf out of static rendering — the plan grid below still renders server-side
 * with real prices (otherwise SSR shows only the "Loading plans…" fallback).
 */
function PreselectFromQuery() {
  const searchParams = useSearchParams();
  const { setPlan } = useSignup();

  useEffect(() => {
    const preselected = searchParams?.get("selected") as SignupPlanTier | null;
    if (preselected && SIGNUP_PLANS.some((p) => p.tier === preselected)) {
      setPlan(preselected);
    }
  }, [searchParams, setPlan]);

  return null;
}

function SignupPlanPageContent() {
  const router = useRouter();
  const { state, setPlan } = useSignup();
  const { user } = useAuth();

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
    // Extra bottom padding keeps the plan buttons clear of the page footer (and
    // its tel: link) and reserves room for the sticky mobile bar so a tap on a
    // "Continue" button can never land on the footer phone link below it.
    <div className="space-y-8 py-8 pb-32 sm:pb-12">
      <Suspense fallback={null}>
        <PreselectFromQuery />
      </Suspense>
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
              className={[
                plan.popular ? "border-brand-secondary/40 shadow-[0_12px_32px_rgb(var(--color-brand-secondary-rgb)/0.12)]" : "",
                isSelected ? "ring-2 ring-brand-secondary ring-offset-2 border-brand-secondary/50" : "",
                "relative transition-shadow",
              ].filter(Boolean).join(" ")}
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
                  className="relative z-10 mt-auto min-h-11 w-full"
                  onClick={() => handleSelect(plan.tier)}
                  aria-label={`Continue with the ${plan.name} plan`}
                >
                  Continue with {plan.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sticky mobile bar — sits above the floating chat launcher (z-40) and
          footer so its CTA is never blocked or tapped through. */}
      {state.selectedPlanTier && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] sm:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {SIGNUP_PLANS.find((p) => p.tier === state.selectedPlanTier)?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {SIGNUP_PLANS.find((p) => p.tier === state.selectedPlanTier)?.priceDisplay}
              </p>
            </div>
            <Button
              size="sm"
              className="min-h-11 shrink-0"
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

export default function SignupPlanPage() {
  // The plan grid renders server-side (static prices). Only the optional
  // query-param preselect uses useSearchParams, scoped to its own Suspense
  // boundary inside SignupPlanPageContent.
  return <SignupPlanPageContent />;
}
