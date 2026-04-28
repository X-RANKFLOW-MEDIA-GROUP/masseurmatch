import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { Surface } from "@/app/_components/primitives";
import {
  PROVIDER_GROWTH_ADDON_CATEGORIES,
  PROVIDER_GROWTH_BUNDLES,
  PROVIDER_GROWTH_HERO_ADDONS,
  isAddonIncludedInPlan,
  type GrowthAddon,
  type GrowthAddonCategoryId,
  type GrowthAddonPlanTier,
} from "@/app/_lib/provider-growth-addons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MarketplaceSource = "billing" | "pricing";

const CATEGORY_STYLES: Record<
  GrowthAddonCategoryId,
  {
    glow: string;
    accent: string;
    softText: string;
    border: string;
  }
> = {
  visibility: {
    glow: "from-amber-100 via-orange-50 to-white",
    accent: "bg-amber-500/10 text-amber-900",
    softText: "text-amber-700",
    border: "border-amber-200/80",
  },
  trust: {
    glow: "from-sky-100 via-cyan-50 to-white",
    accent: "bg-sky-500/10 text-sky-900",
    softText: "text-sky-700",
    border: "border-sky-200/80",
  },
  geo: {
    glow: "from-emerald-100 via-teal-50 to-white",
    accent: "bg-emerald-500/10 text-emerald-900",
    softText: "text-emerald-700",
    border: "border-emerald-200/80",
  },
  analytics: {
    glow: "from-indigo-100 via-slate-50 to-white",
    accent: "bg-indigo-500/10 text-indigo-900",
    softText: "text-indigo-700",
    border: "border-indigo-200/80",
  },
  premium: {
    glow: "from-rose-100 via-pink-50 to-white",
    accent: "bg-rose-500/10 text-rose-900",
    softText: "text-rose-700",
    border: "border-rose-200/80",
  },
};

function getAddonAction(
  addon: GrowthAddon,
  source: MarketplaceSource,
  currentPlan: GrowthAddonPlanTier,
) {
  if (addon.includedIn) {
    if (source === "billing" && isAddonIncludedInPlan(addon, currentPlan)) {
      return {
        href: "#plans",
        label: "Included in your plan",
      };
    }

    return source === "billing"
      ? {
          href: "?checkout=pro",
          label: "Upgrade to Pro",
        }
      : {
          href: "/signup/plan?selected=pro",
          label: "Upgrade to Pro",
        };
  }

  if (source === "billing") {
    return {
      href: `/pro/billing?addon=${encodeURIComponent(addon.slug)}`,
      label: "Activate in Stripe",
    };
  }

  return {
    href: "/pro/billing#addons",
    label: "Open add-ons",
  };
}

function AddonMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-white/85 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function AddonCard({
  addon,
  source,
  currentPlan,
}: {
  addon: GrowthAddon;
  source: MarketplaceSource;
  currentPlan: GrowthAddonPlanTier;
}) {
  const styles = CATEGORY_STYLES[addon.categoryId];
  const action = getAddonAction(addon, source, currentPlan);
  const isIncluded = isAddonIncludedInPlan(addon, currentPlan);

  return (
    <div
      className={cn(
        "rounded-[1.8rem] border bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur",
        styles.border,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={cn("border-transparent", styles.accent)}>
          {addon.priceLabel}
        </Badge>
        {addon.cadence ? (
          <Badge variant="secondary">
            {addon.cadence === "one-time"
              ? "One-time"
              : addon.cadence === "recurring"
                ? "Recurring"
                : addon.cadence === "usage"
                  ? "Usage-based"
                  : "Included"}
          </Badge>
        ) : null}
      </div>

      <div className="mt-4">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">{addon.name}</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{addon.description}</p>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-border/60 bg-slate-950/[0.03] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Impact Preview</p>
        <p className="mt-2 text-sm font-medium leading-6 text-foreground">{addon.impactPreview}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <AddonMetric label="Duration" value={addon.duration} />
        <AddonMetric label="Placement" value={addon.placement} />
        <AddonMetric label="Best Stack" value={addon.bestResults.replace("Best results: ", "")} />
      </div>

      {addon.scarcityNote ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border/80 bg-white/70 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Limited Inventory</p>
          <p className={cn("mt-2 text-sm font-medium", styles.softText)}>{addon.scarcityNote}</p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-muted-foreground">{addon.bestResults}</p>
        <Button asChild variant={isIncluded ? "outline" : "hero"}>
          <Link href={action.href}>
            {action.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function ProviderGrowthMarketplace({
  source,
  currentPlan = null,
  className,
}: {
  source: MarketplaceSource;
  currentPlan?: GrowthAddonPlanTier;
  className?: string;
}) {
  return (
    <section id="addons" className={cn("space-y-8", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <Badge variant="premium">Stackable Add-Ons</Badge>
          <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Revenue-focused upgrades built to stack
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Every add-on below shows the impact preview, duration, placement, and best bundle so therapists can buy
            faster with less hesitation. The catalog mixes low-ticket impulse buys, recurring SaaS-style tools, and
            limited premium inventory for higher-margin exposure.
          </p>
        </div>

        <Surface className="max-w-md rounded-[1.7rem] border-brand-secondary/15 bg-[linear-gradient(180deg,rgba(244,180,0,0.08),rgba(255,255,255,0.96))] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Pricing Strategy</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
            <li>Low ticket impulse buys from $6 to $22</li>
            <li>Mid-ticket visibility boosters from $29 to $59</li>
            <li>Recurring revenue from analytics, geo, and trust layers</li>
            <li>Scarcity-driven premium placements with capped supply</li>
          </ul>
        </Surface>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {PROVIDER_GROWTH_ADDON_CATEGORIES.map((category) => {
          const styles = CATEGORY_STYLES[category.id];

          return (
            <Surface
              key={category.id}
              className={cn(
                "overflow-hidden rounded-[2rem] border bg-gradient-to-br p-0",
                styles.border,
                styles.glow,
              )}
            >
              <div className="border-b border-white/70 px-6 py-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className={cn("border-transparent", styles.accent)}>
                    {category.eyebrow}
                  </Badge>
                  <Badge variant="secondary">{category.revenueNote}</Badge>
                </div>
                <h3 className="font-display mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  {category.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{category.description}</p>
              </div>

              <div className="space-y-5 px-6 py-6">
                {category.addons.map((addon) => (
                  <AddonCard key={addon.slug} addon={addon} source={source} currentPlan={currentPlan} />
                ))}
              </div>
            </Surface>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-brand-secondary" />
          <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">Recommended bundles</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {PROVIDER_GROWTH_BUNDLES.map((bundle) => (
            <div
              key={bundle.slug}
              className="rounded-[1.8rem] border border-border bg-white/92 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline">{bundle.audience}</Badge>
                <p className="text-sm font-semibold text-foreground">{bundle.priceLabel}</p>
              </div>
              <h4 className="font-display mt-4 text-xl font-semibold text-foreground">{bundle.name}</h4>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{bundle.summary}</p>
              <p className="mt-4 text-sm font-medium text-foreground">{bundle.outcome}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {bundle.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProviderGrowthQuickPicks() {
  return (
    <Surface className="overflow-hidden rounded-[2rem] border-brand-secondary/20 bg-[linear-gradient(135deg,rgba(12,28,51,0.96),rgba(21,73,122,0.92))] p-0 text-white">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)]">
        <div className="border-b border-white/10 px-6 py-6 lg:border-b-0 lg:border-r">
          <Badge className="bg-white/12 text-white hover:bg-white/12">Boost Revenue</Badge>
          <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight">
            Quick wins for your next visibility push
          </h2>
          <p className="mt-4 text-sm leading-6 text-white/72">
            Lead with low-friction boosts that therapists can stack fast: a 24-hour Explore push, a local city
            spotlight, or a travel launch when entering a new market.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="premium">
              <Link href="/pro/billing#addons">
                Explore add-ons
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="glass">
              <Link href="/pro/billing">Manage plan</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
          {PROVIDER_GROWTH_HERO_ADDONS.map((addon) => (
            <div key={addon.slug} className="rounded-[1.6rem] border border-white/12 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/58">{addon.priceLabel}</p>
              <h3 className="mt-3 text-lg font-semibold text-white">{addon.name}</h3>
              <p className="mt-3 text-sm leading-6 text-white/72">{addon.impactPreview}</p>
              <div className="mt-4 space-y-2 text-sm text-white/86">
                <p>Duration: {addon.duration}</p>
                <p>Placement: {addon.placement}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Surface>
  );
}
