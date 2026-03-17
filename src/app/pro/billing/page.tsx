"use client";

import { useEffect, useState } from "react";

import { updateBillingTier } from "@/app/_lib/mutations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Tier = "free" | "standard" | "pro" | "elite";

const TIER_OPTIONS: Array<{
  tier: Tier;
  title: string;
  description: string;
}> = [
  {
    tier: "free",
    title: "Free",
    description: "Keep a basic listing and stay visible in the directory.",
  },
  {
    tier: "standard",
    title: "Standard",
    description: "A stronger profile presence for therapists ready to level up.",
  },
  {
    tier: "pro",
    title: "Pro",
    description: "Priority placement and a more competitive storefront.",
  },
  {
    tier: "elite",
    title: "Elite",
    description: "Top-tier visibility for premium providers and featured placement.",
  },
];

function normalizeTier(value: string | null | undefined): Tier {
  if (value === "standard" || value === "pro" || value === "elite") {
    return value;
  }

  return "free";
}

export default function ProBillingPage() {
  const { user, subscription, refreshSubscription } = useAuth();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<Tier>("free");
  const [savedTier, setSavedTier] = useState<Tier>("free");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const currentTier = normalizeTier(subscription.plan_key || subscription.status);
    setSelectedTier(currentTier);
    setSavedTier(currentTier);
  }, [subscription.plan_key, subscription.status]);

  const handleSave = async () => {
    setSaving(true);

    try {
      await updateBillingTier({
        tier: selectedTier,
      });

      setSavedTier(selectedTier);
      await refreshSubscription().catch(() => null);
      toast({
        title: "Billing tier updated",
        description: `Your profile tier is now set to ${selectedTier}.`,
      });
    } catch (error) {
      toast({
        title: "Could not update billing tier",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose the tier you want this account to use and save it through the new billing API.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Account: {user?.email || "Not authenticated"} · Saved tier: {savedTier}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {TIER_OPTIONS.map((option) => {
            const isSelected = selectedTier === option.tier;

            return (
              <button
                key={option.tier}
                type="button"
                onClick={() => setSelectedTier(option.tier)}
                className={`rounded-xl border p-5 text-left transition ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-accent"
                }`}
              >
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{option.tier}</p>
                <h2 className="mt-2 text-xl font-semibold">{option.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{option.description}</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={() => void handleSave()} disabled={saving || !user}>
            {saving ? "Saving..." : `Save ${selectedTier} tier`}
          </Button>
          <Button type="button" variant="outline" disabled={saving} onClick={() => setSelectedTier(savedTier)}>
            Reset selection
          </Button>
          {!user ? <p className="text-sm text-muted-foreground">Sign in to update your tier.</p> : null}
        </div>
      </div>
    </div>
  );
}
