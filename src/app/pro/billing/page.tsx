"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ExternalLink, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { normalizePlanKey } from "@/hooks/usePlanLimits";
import { supabase } from "@/integrations/supabase/client";

type Tier = "free" | "standard" | "pro" | "elite";

const TIER_OPTIONS: Array<{
  tier: Tier;
  title: string;
  price: string;
  description: string;
  features: string[];
  founderPrice?: string | null;
  isFree?: boolean;
  popular?: boolean;
}> = [
  {
    tier: "free",
    title: "Free",
    price: "$0/mo",
    description: "Keep a basic listing and stay visible in the directory.",
    features: [
      "1 photo",
      "Bottom search placement",
      "Available Now not included",
      "1 travel schedule/month",
      "No analytics",
      '"Basic Listing" watermark',
    ],
    isFree: true,
  },
  {
    tier: "standard",
    title: "Standard",
    price: "$39/mo",
    description: "A stronger everyday plan with better placement and light analytics.",
    features: [
      "6 photos",
      "Middle search placement",
      "Available Now (60 min)",
      "3 travel schedules/month",
      "Views analytics",
      "Newsletter chance",
    ],
    founderPrice: "$19.50/mo for 3 months",
  },
  {
    tier: "pro",
    title: "Pro",
    price: "$79/mo",
    description: "Our most popular growth tier for therapists who want top exposure.",
    features: [
      "12 photos + video",
      "Top search placement",
      "Available Now (120 min)",
      "Unlimited travel schedules",
      "Views + clicks analytics",
      "Homepage rotation",
      "Weekly specials",
      "Verified badge",
    ],
    founderPrice: "$39.50/mo for 3 months",
    popular: true,
  },
  {
    tier: "elite",
    title: "Elite",
    price: "$99/mo",
    description: "Everything in Pro plus a second active city for broader reach.",
    features: [
      "12 photos + video",
      "Top search placement",
      "Available Now (120 min)",
      "Unlimited travel schedules",
      "Views + clicks analytics",
      "Homepage rotation",
      "Weekly specials",
      "Verified badge",
      "2 active ads across 2 cities",
    ],
    founderPrice: "$49.50/mo for 3 months",
  },
];

function normalizeTier(value: string | null | undefined): Tier {
  if (value === "standard" || value === "pro" || value === "elite") {
    return value;
  }

  return "free";
}

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
  const handleCheckoutRef = useRef<((tier: Tier) => Promise<void>) | null>(null);
  const handleManageBillingRef = useRef<(() => Promise<void>) | null>(null);

  const currentTier = normalizePlanKey(subscription.plan_key) || normalizeTier(subscription.status) || "free";

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

    if (!autoHandledCheckout.current && user) {
      const checkoutTier = toTier(searchParams.get("checkout"));
      if (checkoutTier) {
        autoHandledCheckout.current = true;
        void handleCheckoutRef.current?.(checkoutTier);
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
  }, [searchParams, user, refreshSubscription, toast]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a plan and continue through Stripe checkout. You can manage renewals anytime in Stripe Portal.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Account: {user?.email || "Not authenticated"} · Current tier: {currentTier}
          </p>
        </div>

        {!subscription.subscribed ? (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Founder deal: 50% off for 3 months</p>
            <p className="mt-1">The first 50 members get discounted paid pricing after the 14-day free trial.</p>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {TIER_OPTIONS.map((option) => {
            const isCurrent = currentTier === option.tier;

            return (
              <section
                key={option.tier}
                className={`rounded-xl border p-5 text-left transition ${
                  isCurrent
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-accent"
                }`}
              >
                <div className="flex items-center gap-2">
                  {option.popular ? <Badge>Most popular</Badge> : null}
                  {isCurrent ? <Badge variant="secondary">Current plan</Badge> : null}
                </div>
                <p className="mt-3 text-sm uppercase tracking-[0.2em] text-muted-foreground">{option.tier}</p>
                <h2 className="mt-2 text-xl font-semibold">{option.title}</h2>
                <p className="mt-1 text-lg font-semibold text-foreground">{option.price}</p>
                {option.founderPrice ? (
                  <p className="mt-1 text-xs font-semibold text-primary">Founder price: {option.founderPrice}</p>
                ) : null}
                {!option.isFree ? (
                  <p className="mt-1 text-xs text-muted-foreground">14-day free trial included</p>
                ) : null}
                <p className="mt-2 text-sm text-muted-foreground">{option.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {option.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>

                <Button
                  type="button"
                  className="mt-6 w-full"
                  variant={option.popular ? "hero" : "outline"}
                  onClick={() => void handleCheckout(option.tier)}
                  disabled={!user || !!checkoutLoading}
                >
                  {checkoutLoading === option.tier ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isCurrent ? "Switch plan" : option.isFree ? "Start free" : "Start free trial"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </section>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={() => void handleManageBilling()} disabled={!user || portalLoading}>
            {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            Manage in Stripe
          </Button>
          {!user ? <p className="text-sm text-muted-foreground">Sign in to start checkout or manage billing.</p> : null}
        </div>
      </div>
    </div>
  );
}
