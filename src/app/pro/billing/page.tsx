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

type Tier = SignupPlanTier;
type PaidTier = Exclude<Tier, "free">;

type CheckoutResponse = {
  ok?: boolean;
  approval_url?: string;
  error?: string;
};

type SyncResponse = {
  ok?: boolean;
  plan_key?: string;
  status?: string;
  error?: string;
};

function toTier(value: string | null): Tier | null {
  if (value === "free" || value === "standard" || value === "pro" || value === "elite") return value;
  return null;
}

async function readResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status}).`);
  return body;
}

function ProBillingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, subscription, refreshSubscription } = useAuth();
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState<Tier | null>(null);
  const [syncingPayPal, setSyncingPayPal] = useState(false);
  const autoHandledCheckout = useRef(false);
  const autoHandledPayPalReturn = useRef(false);
  const handleCheckoutRef = useRef<((tier: Tier) => Promise<void>) | null>(null);

  const currentTier = normalizePlanKey(subscription.plan_key) || (subscription.subscribed ? "standard" : "free");
  const currentPlan = SIGNUP_PLANS.find((plan) => plan.tier === currentTier) || SIGNUP_PLANS[0];

  const handleCheckout = async (tier: Tier) => {
    if (!user) {
      router.push(`/auth?mode=signup&redirect=${encodeURIComponent(`/pro/billing?checkout=${tier}`)}`);
      return;
    }

    if (tier === "free") {
      toast({
        title: "Free plan",
        description: subscription.subscribed
          ? "Cancel your paid subscription in PayPal before moving back to Free."
          : "Your account is already eligible for the Free plan.",
      });
      return;
    }

    if (subscription.subscribed) {
      toast({
        title: "Plan change",
        description: "Manage or cancel the current subscription in PayPal before starting a different plan.",
      });
      return;
    }

    setCheckoutLoading(tier);
    try {
      const response = await fetch("/api/paypal/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_key: tier as PaidTier }),
      });
      const data = await readResponse<CheckoutResponse>(response);
      if (!data.approval_url) throw new Error("PayPal did not return an approval URL.");
      window.location.assign(data.approval_url);
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
      setCheckoutLoading(null);
    }
  };
  handleCheckoutRef.current = handleCheckout;

  useEffect(() => {
    if (!searchParams) return;

    if (!autoHandledCheckout.current) {
      const checkoutTier = toTier(searchParams.get("checkout"));
      if (checkoutTier) {
        autoHandledCheckout.current = true;
        if (user) void handleCheckoutRef.current?.(checkoutTier);
        else router.push(`/auth?mode=signup&redirect=${encodeURIComponent(`/pro/billing?checkout=${checkoutTier}`)}`);
      }
    }

    const paypalReturn = searchParams.get("paypal");
    if (!autoHandledPayPalReturn.current && user && paypalReturn === "approved") {
      autoHandledPayPalReturn.current = true;
      setSyncingPayPal(true);
      void fetch("/api/paypal/subscription/sync", { method: "POST" })
        .then((response) => readResponse<SyncResponse>(response))
        .then(async () => {
          await refreshSubscription();
          toast({ title: "Subscription activated", description: "Your PayPal subscription is now connected to MasseurMatch." });
          router.replace("/pro/billing");
        })
        .catch((error) => {
          toast({
            title: "Payment approved, sync pending",
            description: error instanceof Error ? error.message : "Your subscription will be synchronized by the PayPal webhook.",
            variant: "destructive",
          });
        })
        .finally(() => setSyncingPayPal(false));
    }

    if (!autoHandledPayPalReturn.current && paypalReturn === "canceled") {
      autoHandledPayPalReturn.current = true;
      toast({ title: "Checkout canceled", description: "No subscription was activated." });
      router.replace("/pro/billing");
    }
  }, [searchParams, user, refreshSubscription, router, toast]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <div className="space-y-8">
        <PageSection
          eyebrow="Billing"
          title="Your subscription"
          description="MasseurMatch paid memberships are billed through PayPal."
          actions={
            <Button type="button" variant="outline" asChild>
              <a href="https://www.paypal.com/myaccount/autopay/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Manage in PayPal
              </a>
            </Button>
          }
        />

        {syncingPayPal ? (
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-white p-4 text-sm text-muted-foreground shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirming your PayPal subscription...
          </div>
        ) : null}

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge variant="premium">Current Plan</Badge>
              <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-foreground">{currentPlan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{currentPlan.description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-foreground">{currentPlan.priceDisplay}</p>
              <p className="mt-1 text-xs text-muted-foreground">{subscription.subscribed ? "Active" : "Not subscribed"}</p>
            </div>
          </div>

          {subscription.trial_end ? (
            <p className="mt-4 text-sm text-muted-foreground">Trial ends {new Date(subscription.trial_end).toLocaleDateString()}</p>
          ) : null}
        </div>

        <section id="plans" className="space-y-4">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">Available plans</h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {SIGNUP_PLANS.map((plan) => {
              const isCurrent = currentTier === plan.tier;
              const isBusy = checkoutLoading === plan.tier;
              const blockedByExistingSubscription = subscription.subscribed && !isCurrent;

              return (
                <section
                  key={plan.tier}
                  className={`rounded-2xl border p-5 text-left transition ${
                    isCurrent ? "border-brand-secondary/30 bg-brand-secondary/5 shadow-sm" : "border-border bg-white hover:border-brand-secondary/20"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {plan.popular ? <Badge>Most Popular</Badge> : null}
                    {isCurrent ? <Badge variant="secondary">Current</Badge> : null}
                  </div>

                  <h3 className="font-display mt-3 text-xl font-semibold tracking-tight text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{plan.priceDisplay}</p>
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
                    disabled={!!checkoutLoading || isCurrent || blockedByExistingSubscription}
                  >
                    {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {isCurrent ? "Current plan" : plan.tier === "free" ? "Free" : subscription.subscribed ? "Manage current plan first" : "Start 14-day trial"}
                    {!isCurrent && !blockedByExistingSubscription ? <ArrowRight className="h-4 w-4" /> : null}
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
