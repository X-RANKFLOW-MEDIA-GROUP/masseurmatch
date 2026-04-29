"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, ExternalLink, Loader2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

import { PageSection, Surface } from "@/app/_components/primitives";
import { ProviderGrowthMarketplace } from "@/app/_components/provider-growth-marketplace";
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

export default function ProBillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, subscription, refreshSubscription } = useAuth();
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState<Tier | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const autoHandledCheckout = useRef(false);
  const autoHandledPortal = useRef(false);
  const autoHandledAddon = useRef(false);
  const handleCheckoutRef = useRef<((tier: Tier) => Promise<void>) | null>(null);
  const handleManageBillingRef = useRef<(() => Promise<void>) | null>(null);
  const handleAddonCheckoutRef = useRef<((addonSlug: string) => Promise<void>) | null>(null);

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

  const handleAddonCheckout = async (addonSlug: string) => {
    try {
      const response = await fetch("/api/stripe/addon-checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ addonSlug }),
      });
      const payload = (await response.json()) as { ok?: boolean; url?: string; error?: string };
      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || "Could not start add-on checkout.");
      }
      window.open(payload.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast({
        title: "Add-on checkout failed",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    }
  };
  handleAddonCheckoutRef.current = handleAddonCheckout;

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

    if (!autoHandledAddon.current && user) {
      const addonSlug = searchParams.get("addon");
      if (addonSlug) {
        autoHandledAddon.current = true;
        void handleAddonCheckoutRef.current?.(addonSlug);
      }
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

    if (searchParams.get("addon_success") === "true") {
      toast({
        title: "Add-on activated",
        description: "Stripe checkout completed and your add-on is now being processed.",
      });
    }

    if (searchParams.get("addon_canceled") === "true") {
      toast({
        title: "Add-on checkout canceled",
        description: "No add-on charges were made.",
      });
    }
  }, [searchParams, user, refreshSubscription, router, toast]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="space-y-8">
        <PageSection
          eyebrow="Billing & Growth"
          title="Plans, billing, and stackable growth add-ons"
          description="Choose your base listing plan, then layer in targeted boosts, trust upgrades, geo visibility, and premium exposure from one place."
          actions={
            <>
              <Button type="button" variant="outline" onClick={() => void handleManageBilling()} disabled={!user || portalLoading}>
                {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                Manage in Stripe
              </Button>
              {!user ? <p className="text-sm text-muted-foreground">Sign in to start checkout or manage billing.</p> : null}
            </>
          }
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr),minmax(320px,0.75fr)]">
          <Surface className="rounded-[2rem] border-brand-secondary/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,249,252,0.92))]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge variant="premium">Current Plan</Badge>
                <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight text-foreground">{currentPlan.name}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {currentPlan.description}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-border bg-white/92 px-5 py-4 text-right shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Account</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{user?.email || "Not authenticated"}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Status: {subscription.subscribed ? "Subscribed" : "Not subscribed"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.6rem] border border-border bg-white/88 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Price</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{currentPlan.priceDisplay}</p>
                {currentPlan.founderPrice ? (
                  <p className="mt-2 text-sm text-brand-secondary">{currentPlan.founderPrice}</p>
                ) : null}
              </div>
              <div className="rounded-[1.6rem] border border-border bg-white/88 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Trial</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {subscription.trial_end ? new Date(subscription.trial_end).toLocaleDateString() : "14 days"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">Paid tiers include a 14-day free trial.</p>
              </div>
              <div className="rounded-[1.6rem] border border-border bg-white/88 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Focus</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {currentTier === "free" ? "Foundation" : currentTier === "standard" ? "Consistency" : currentTier === "pro" ? "Growth" : "Scale"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use add-ons to stack extra visibility without waiting for a full plan change.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                Impact preview shown on every add-on
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sky-800">
                <TrendingUp className="h-4 w-4" />
                Duration and placement always visible
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-amber-800">
                <Sparkles className="h-4 w-4" />
                Premium slots stay capped for scarcity
              </div>
            </div>
          </Surface>

          <Surface className="rounded-[2rem] border-brand-secondary/15 bg-[linear-gradient(180deg,rgba(12,28,51,0.98),rgba(18,53,88,0.95))] text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/58">Conversion Rules</p>
            <h2 className="font-display mt-4 text-2xl font-semibold tracking-tight">How this catalog is built to convert</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-white/74">
              <li>Lead with fast, low-friction boosts between $10 and $22 to drive impulse revenue.</li>
              <li>Use mid-ticket featured placements to capture therapists ready for a bigger visibility push.</li>
              <li>Anchor recurring value with trust, geo, and analytics products that stack month over month.</li>
              <li>Protect premium margins with limited-inventory placements and bundle recommendations.</li>
            </ul>

            {!subscription.subscribed ? (
              <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/6 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/58">Founder Deal</p>
                <p className="mt-2 text-lg font-semibold text-white">50% off for the first 3 months after trial</p>
                <p className="mt-2 text-sm text-white/70">
                  The first 50 members keep the lower paid rate after their 14-day free trial.
                </p>
              </div>
            ) : null}
          </Surface>
        </div>

        <section id="plans" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Base plans</p>
              <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-foreground">
                Pick the right foundation, then stack add-ons on top
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {SIGNUP_PLANS.map((plan) => {
              const isCurrent = currentTier === plan.tier;
              const isBusy = checkoutLoading === plan.tier;

              return (
                <section
                  key={plan.tier}
                  className={`rounded-[1.9rem] border p-5 text-left transition ${
                    isCurrent
                      ? "border-brand-secondary/30 bg-brand-secondary/5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
                      : "border-border bg-white/92 hover:border-brand-secondary/20 hover:bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {plan.popular ? <Badge>Most Popular</Badge> : null}
                    {isCurrent ? <Badge variant="secondary">Current plan</Badge> : null}
                  </div>

                  <p className="mt-4 text-sm uppercase tracking-[0.18em] text-muted-foreground">{plan.tier}</p>
                  <h3 className="font-display mt-2 text-2xl font-semibold tracking-tight text-foreground">{plan.name}</h3>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{plan.priceDisplay}</p>
                  {plan.founderPrice ? (
                    <p className="mt-2 text-sm font-medium text-brand-secondary">{plan.founderPrice}</p>
                  ) : null}
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.description}</p>

                  <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    type="button"
                    className="mt-6 w-full"
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

        <ProviderGrowthMarketplace source="billing" currentPlan={currentTier} />
      </div>
    </div>
  );
}
