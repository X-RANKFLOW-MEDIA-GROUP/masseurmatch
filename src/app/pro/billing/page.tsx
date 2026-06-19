"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";

import { PageSection } from "@/app/_components/primitives";
import { SIGNUP_PLANS, type SignupPlanTier } from "@/app/signup/_lib/plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { normalizePlanKey } from "@/hooks/usePlanLimits";
import { supabase } from "@/integrations/supabase/client";

type Tier = SignupPlanTier;

function toTier(value: string | null): Tier | null {
  if (value === "free" || value === "standard" || value === "pro" || value === "elite") {
    return value;
  }

  return null;
}

function ProBillingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, subscription, refreshSubscription } = useAuth();
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState<Tier | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const autoHandledCheckout = useRef(false);
  const autoHandledPortal = useRef(false);
  const handleCheckoutRef = useRef<((tier: Tier) => Promise<void>) | null>(null);
  const handleManageBillingRef = useRef<(() => Promise<void>) | null>(null);

  const currentTier = normalizePlanKey(subscription.plan_key) || (subscription.subscribed ? "standard" : "free");
  const currentPlan = SIGNUP_PLANS.find((plan) => plan.tier === currentTier) || SIGNUP_PLANS[0];

  const handleCheckout = async (tier: Tier) => {
    if (!user) {
      router.push(`/auth?mode=signup&redirect=${encodeURIComponent(`/pro/billing?checkout=${tier}`)}`);
      return;
    }

    setCheckoutLoading(tier);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan_key: tier, return_path: "/pro/billing" },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
        return;
      }

      if (data?.success) {
        toast({
          title: "Trial started",
          description: "Your free trial is active.",
        });
        await refreshSubscription();
        return;
      }

      throw new Error("Unexpected checkout response.");
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };
  handleCheckoutRef.current = handleCheckout;

  const handleManageBilling = async () => {
    setPortalLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
        return;
      }

      throw new Error("Unexpected customer portal response.");
    } catch (error) {
      toast({
        title: "Portal failed",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };
  handleManageBillingRef.current = handleManageBilling;

  useEffect(() => {
    if (!searchParams) return;

    if (!autoHandledCheckout.current) {
      const checkoutTier = toTier(searchParams.get("checkout"));
      if (checkoutTier) {
        autoHandledCheckout.current = true;
        if (user) {
          void handleCheckoutRef.current?.(checkoutTier);
        } else {
          router.push(`/auth?mode=signup&redirect=${encodeURIComponent(`/pro/billing?checkout=${checkoutTier}`)}`);
        }
      }
    }

    if (!autoHandledPortal.current && user && searchParams.get("portal") === "1") {
      autoHandledPortal.current = true;
      void handleManageBillingRef.current?.();
    }

    if (searchParams.get("success") === "true") {
      toast({
        title: "Checkout complete",
        description: "Your subscription has been updated.",
      });
      void refreshSubscription();
      return;
    }

    if (searchParams.get("canceled") === "true") {
      toast({
        title: "Checkout canceled",
        description: "No changes were made to your billing.",
        variant: "destructive",
      });
    }
  }, [searchParams, user, refreshSubscription, router, toast]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <div className="space-y-8">
        <PageSection
          eyebrow="Billing"
          title="Your subscription"
          description="Manage your plan and billing details."
          actions={
            <>
              <Button type="button" variant="outline" onClick={() => void handleManageBilling()} disabled={!user || portalLoading}>
                {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                Manage in Stripe
              </Button>
              {!user ? <p className="text-sm text-muted-foreground">Sign in to manage billing.</p> : null}
            </>
          }
        />

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge variant="premium">Current Plan</Badge>
              <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-foreground">{currentPlan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{currentPlan.description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-foreground">{currentPlan.priceDisplay}</p>
              {currentPlan.founderPrice ? (
                <p className="mt-1 text-sm text-brand-secondary">{currentPlan.founderPrice}</p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {subscription.subscribed ? "Active" : "Not subscribed"}
              </p>
            </div>
          </div>

          {subscription.trial_end ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Trial ends {new Date(subscription.trial_end).toLocaleDateString()}
            </p>
          ) : null}
        </div>

        <section id="plans" className="space-y-4">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Available plans
          </h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {SIGNUP_PLANS.map((plan) => {
              const isCurrent = currentTier === plan.tier;
              const isBusy = checkoutLoading === plan.tier;

              return (
                <section
                  key={plan.tier}
                  className={`rounded-2xl border p-5 text-left transition ${
                    isCurrent
                      ? "border-brand-secondary/30 bg-brand-secondary/5 shadow-sm"
                      : "border-border bg-white hover:border-brand-secondary/20"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {plan.popular ? <Badge>Most Popular</Badge> : null}
                    {isCurrent ? <Badge variant="secondary">Current</Badge> : null}
                  </div>

                  <h3 className="font-display mt-3 text-xl font-semibold tracking-tight text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{plan.priceDisplay}</p>
                  {plan.founderPrice ? (
                    <p className="mt-1 text-sm font-medium text-brand-secondary">{plan.founderPrice}</p>
                  ) : null}
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.description}</p>

                  <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                    {plan.features.slice(0, 5).map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    type="button"
                    className="mt-5 w-full"
                    variant={plan.popular ? "hero" : "outline"}
                    onClick={() => void handleCheckout(plan.tier)}
                    disabled={!!checkoutLoading}
                  >
                    {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {isCurrent ? "Switch plan" : plan.tier === "free" ? "Start free" : "Start 14-day trial"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </section>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ProBillingPage() {
  return (
    <Suspense>
      <ProBillingPageInner />
    </Suspense>
  );
}
