"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Filter,
  Heart,
  Layers3,
  LocateFixed,
  MapPin,
  MapPinned,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
  Grid2x2,
} from "lucide-react";
import type { CityData } from "@/data/cities";
import {
  applyExploreFilters,
  EXPLORE_DEFAULT_CITY,
  EXPLORE_DEFAULT_PRICE_MAX,
  exploreFiltersToUrl,
  getBaseExploreFilters,
  getCityCoordinates,
  resolveExploreCity,
  type ExploreFilters,
  type ExplorePoint,
  type ExploreProvider,
} from "@/app/_lib/explore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { handleProfileCardTilt, resetProfileCardTilt } from "@/app/_components/profile-card-tilt";
import { CompactTherapistCard } from "@/components/explore/CompactTherapistCard";

type ExplorePageClientProps = {
  cities: CityData[];
  hasExplicitLocation: boolean;
  initialBaseItems: ExploreProvider[];
  initialFilters: ExploreFilters;
  initialInvalidProviderCount: number;
  initialTotal: number;
};

type SwipeState = {
  liked: string[];
  skipped: string[];
  saved: string[];
};

type FilterBooleanKey = "available" | "incall" | "outcall" | "verified" | "featured" | "offers";

const STORAGE_KEY = "mm:explore:filters";
const SESSION_KEY = "mm:explore:session";
const SWIPE_KEY = "mm:explore:swipes";
const PAGE_BATCH = 12;
const FACE_FOCUS_OBJECT_POSITION = "50% 18%";

const FILTER_CHIPS: Array<{ key: FilterBooleanKey; label: string }> = [
  { key: "available", label: "Available Now" },
  { key: "incall", label: "Incall" },
  { key: "outcall", label: "Outcall" },
  { key: "verified", label: "Verified" },
  { key: "featured", label: "Featured" },
  { key: "offers", label: "Offers" },
];

const SORT_OPTIONS = [
  { value: "distance", label: "Distance" },
  { value: "featured", label: "Featured" },
  { value: "price", label: "Starting Price" },
  { value: "reviews", label: "Reviews" },
] as const;

const VIEW_OPTIONS = [
  { value: "grid", label: "Grid", icon: Layers3 },
  { value: "cards", label: "Cards", icon: Grid2x2 },
  { value: "map", label: "Map", icon: MapPinned },
  { value: "swipe", label: "Swipe", icon: Sparkles },
] as const;

function formatCurrency(value: number | null) {
  if (typeof value !== "number") {
    return "Price on request";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function isZip(value: string) {
  return /^\d{5}$/.test(value.trim());
}

function getVerificationLabel(provider: ExploreProvider) {
  if (provider.verifiedStatus === "elite") {
    return "Verified Elite";
  }

  if (provider.verifiedStatus === "verified") {
    return "Verified";
  }

  return "Directory";
}

function getCompactVerificationLabel(provider: ExploreProvider) {
  if (provider.verifiedStatus === "elite") {
    return "Elite";
  }

  if (provider.verifiedStatus === "verified") {
    return "Verified";
  }

  return "Directory";
}

function getServiceModes(provider: ExploreProvider) {
  return [provider.incall ? "Incall" : null, provider.outcall ? "Outcall" : null].filter(
    (value): value is string => Boolean(value),
  );
}

function getPriceFloor(providers: ExploreProvider[]) {
  const prices = providers
    .map((provider) => provider.priceFrom)
    .filter((value): value is number => typeof value === "number");

  return prices.length ? Math.min(...prices) : null;
}

function trackExploreEvent(name: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("mm:explore-event", {
      detail: { name, payload },
    }),
  );

  (window as typeof window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer?.push({
    event: name,
    ...payload,
  });

  (window as typeof window & {
    gtag?: (...args: unknown[]) => void;
    hj?: (...args: unknown[]) => void;
  }).gtag?.("event", name, payload);

  (window as typeof window & {
    hj?: (...args: unknown[]) => void;
  }).hj?.("event", name);
}

function DecisionOverlay({ provider }: { provider: ExploreProvider }) {
  const summaryItems = [
    typeof provider.distance === "number" ? `${provider.distance.toFixed(1)} mi` : null,
    typeof provider.priceFrom === "number" ? `Starting at ${formatCurrency(provider.priceFrom)}` : "Price on request",
  ].filter((value): value is string => Boolean(value));

  return (
    <div className="profile-card-overlay">
      <div className="profile-card-summary">
        <span className={provider.availableNow ? "live-dot" : "h-2.5 w-2.5 rounded-full bg-white/45"} />
        <strong>{provider.availableNow ? "Available Now" : "Book Today"}</strong>
        {summaryItems.map((item) => (
          <span key={`${provider.id}-${item}`} className="contents">
            <span className="profile-card-dot" />
            <span>{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function getDisplayTrustSignals(provider: ExploreProvider) {
  const filteredSignals = provider.trustSignals.filter(
    (signal) =>
      !/^verified$/i.test(signal) &&
      !/^available now$/i.test(signal) &&
      !/\byears?\b/i.test(signal) &&
      !/\breviews?\b/i.test(signal),
  );

  if (provider.featured) {
    filteredSignals.unshift("Featured");
  }

  return Array.from(new Set(filteredSignals)).slice(0, 3);
}

function TrustPills({
  provider,
  inverse = false,
}: {
  provider: ExploreProvider;
  inverse?: boolean;
}) {
  const signals = getDisplayTrustSignals(provider);

  if (signals.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {signals.map((signal) => (
        <span
          key={`${provider.id}-${signal}`}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
            inverse
              ? "border border-white/18 bg-white/12 text-white/88 backdrop-blur-xl"
              : "border border-border-subtle bg-white/76 text-brand-secondary shadow-[inset_0_1px_0_rgb(255_255_255/_0.86)]",
          )}
        >
          {signal}
        </span>
      ))}
    </div>
  );
}

function ServiceModeSummary({
  provider,
  inverse = false,
}: {
  provider: ExploreProvider;
  inverse?: boolean;
}) {
  const modes = getServiceModes(provider);

  if (modes.length === 0 && !provider.offers) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {modes.map((mode) => (
        <span
          key={`${provider.id}-${mode}`}
          className={cn(
            "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]",
            inverse
              ? "border border-white/18 bg-white/12 text-white/88 backdrop-blur-xl"
              : "border border-border-subtle bg-white/82 text-text-secondary shadow-[inset_0_1px_0_rgb(255_255_255/_0.9)]",
          )}
        >
          {mode}
        </span>
      ))}
      {provider.offers ? (
        <span
          className={cn(
            "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]",
            inverse
              ? "border border-white/18 bg-[rgb(var(--color-brand-soft-accent-rgb)/0.22)] text-white"
              : "border border-[rgb(var(--color-brand-soft-accent-rgb)/0.4)] bg-[rgb(var(--color-brand-soft-accent-rgb)/0.16)] text-brand-primary",
          )}
        >
          Offer
        </span>
      ) : null}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition",
        active
          ? "border-action-secondary/20 bg-[rgb(var(--color-brand-secondary-rgb)/0.12)] text-brand-secondary shadow-[0_12px_28px_rgb(var(--color-brand-secondary-rgb)/0.12)]"
          : "border-border-subtle bg-white/82 text-text-secondary hover:border-action-secondary/18 hover:text-text-primary",
      )}
    >
      {label}
    </button>
  );
}

function ViewToggle({
  value,
  onChange,
}: {
  value: ExploreFilters["view"];
  onChange: (next: ExploreFilters["view"]) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-border-subtle bg-white/90 p-1 shadow-[0_12px_30px_rgb(var(--color-brand-primary-rgb)/0.06)]">
      {VIEW_OPTIONS.map((item) => {
        const Icon = item.icon;
        const active = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition",
              active
                ? "bg-action-secondary text-white shadow-[0_14px_28px_rgb(var(--color-brand-secondary-rgb)/0.24)]"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function ProviderCard({
  provider,
  onOpen,
  onSelect,
}: {
  provider: ExploreProvider;
  onOpen: (provider: ExploreProvider) => void;
  onSelect: (providerId: string) => void;
}) {
  const serviceModes = getServiceModes(provider);
  const tertiaryLabel =
    provider.reviewCount > 0 ? "Reviews" : provider.profileViews > 0 ? "Views" : "Trust";
  const tertiaryValue =
    provider.reviewCount > 0
      ? `${provider.reviewCount}`
      : provider.profileViews > 0
        ? `${provider.profileViews}`
        : getVerificationLabel(provider);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onMouseEnter={() => onSelect(provider.id)}
      onFocusCapture={() => onSelect(provider.id)}
      className="h-full"
    >
      <article
        onMouseMove={handleProfileCardTilt}
        onMouseLeave={(event) => resetProfileCardTilt(event.currentTarget)}
        className={cn(
          "profile-card-glass group flex h-full flex-col",
          provider.featured && "ring-1 ring-[rgb(var(--color-brand-soft-accent-rgb)/0.28)]",
        )}
      >
        <div className="profile-card-media">
          <div className="relative aspect-[5/6] overflow-hidden rounded-[1.45rem] sm:aspect-[4/5]">
            <Image
              src={provider.photoUrl}
              alt={`${provider.name} in ${provider.neighborhood}`}
              width={960}
              height={1200}
              className="profile-card-image h-full w-full object-cover"
              style={{ objectPosition: FACE_FOCUS_OBJECT_POSITION }}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.24),transparent_28%),linear-gradient(180deg,rgba(11,31,58,0.04)_0%,rgba(11,31,58,0.2)_48%,rgba(11,31,58,0.82)_100%)]" />
            <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3 profile-card-plane-soft">
              <div className="flex flex-wrap gap-2">
                {provider.verifiedStatus !== "directory" ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/18 bg-white/14 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-xl sm:px-3 sm:text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="sm:hidden">{getCompactVerificationLabel(provider)}</span>
                    <span className="hidden sm:inline">{getVerificationLabel(provider)}</span>
                  </span>
                ) : null}
                {provider.featured ? (
                  <span className="rounded-full border border-white/18 bg-[rgb(var(--color-brand-secondary-rgb)/0.42)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-xl sm:px-3 sm:text-[11px]">
                    Featured
                  </span>
                ) : null}
              </div>
              {provider.reviewCount > 0 ? (
                <span className="shrink-0 rounded-full border border-white/18 bg-white/14 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-xl sm:px-3 sm:text-[11px]">
                  {provider.reviewCount} reviews
                </span>
              ) : null}
            </div>

            <div className="absolute inset-x-4 bottom-4 profile-card-plane-strong">
              <div className="rounded-[1.5rem] border border-white/16 bg-[linear-gradient(135deg,rgba(9,24,45,0.88),rgba(20,59,108,0.68))] p-3.5 text-white shadow-[0_20px_48px_rgba(11,31,58,0.26)] backdrop-blur-2xl sm:p-4">
                <div className="flex flex-wrap items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/88 sm:text-[10px]">
                  <span className={provider.availableNow ? "live-dot" : "h-2.5 w-2.5 rounded-full bg-white/45"} />
                  <span>{provider.availableNow ? "Available now" : "Book today"}</span>
                  {typeof provider.distance === "number" ? (
                    <>
                      <span className="h-1 w-1 rounded-full bg-white/45" />
                      <span>{provider.distance.toFixed(1)} mi</span>
                    </>
                  ) : null}
                </div>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/72 sm:text-[10px]">
                      Starting from
                    </p>
                    <p className="mt-1 font-display text-[2rem] leading-none tracking-[-0.05em] text-white sm:text-[2.1rem]">
                      {typeof provider.priceFrom === "number" ? formatCurrency(provider.priceFrom) : "Request"}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/16 bg-white/10 px-3 py-2 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/72 sm:text-[10px]">Session</p>
                    <p className="mt-1 flex items-center justify-end gap-1.5 text-sm font-semibold text-white">
                      <Clock3 className="h-3.5 w-3.5" />
                      {provider.sessionDurationMinutes} min
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card-plane relative mx-2 -mt-8 rounded-[1.6rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,246,250,0.92))] p-5 shadow-[0_24px_48px_rgb(var(--color-brand-primary-rgb)/0.1)] backdrop-blur-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-secondary">
            {provider.specialty}
          </p>

          <div className="mt-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-[2rem] leading-[0.95] tracking-[-0.05em] text-text-primary">
                {provider.name}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-secondary" />
                  {provider.neighborhood}
                </span>
                <span className="rounded-full border border-border-subtle bg-white/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  {provider.yearsExperience
                    ? `${provider.yearsExperience} years experience`
                    : "Experience on profile"}
                </span>
              </div>
            </div>

            <div className="shrink-0 rounded-[1.15rem] border border-border-subtle bg-white/78 px-3 py-2 text-right shadow-[inset_0_1px_0_rgb(255_255_255/_0.9)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">Trust</p>
              <p className="mt-1 text-xs font-semibold text-brand-secondary">{getVerificationLabel(provider)}</p>
            </div>
          </div>

          <ServiceModeSummary provider={provider} />
          <p className="mt-4 line-clamp-3 text-[15px] leading-6 text-text-secondary">{provider.bio}</p>
        </div>

        <div className="profile-card-plane mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.35rem] border border-white/60 bg-white/68 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/_0.84)] backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">City</p>
            <p className="mt-2 text-sm font-semibold text-text-primary">{provider.city}</p>
          </div>
          <div className="rounded-[1.35rem] border border-white/60 bg-white/68 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/_0.84)] backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Service</p>
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {serviceModes.length > 0 ? serviceModes.join(" / ") : "See profile"}
            </p>
          </div>
          <div className="rounded-[1.35rem] border border-white/60 bg-white/68 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/_0.84)] backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">{tertiaryLabel}</p>
            <p className="mt-2 text-sm font-semibold text-text-primary">{tertiaryValue}</p>
          </div>
        </div>

        <div className="profile-card-plane-strong mt-5 flex flex-col items-stretch gap-3 rounded-[1.45rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.62))] p-4 shadow-[inset_0_1px_0_rgb(255_255_255/_0.84)] sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              {provider.offerText ? "Current Offer" : "Profile Snapshot"}
            </p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              {provider.offerText || "Photo, pricing, trust signals, and contact path stay readable at a glance."}
            </p>
          </div>
          <Link
            href={provider.profilePath}
            onClick={() => onOpen(provider)}
            className="profile-card-cta w-full justify-center gap-2 px-5 text-sm uppercase tracking-[0.12em] sm:w-auto"
          >
            View Profile
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </motion.div>
  );
}

function SwipeDeck({
  providers,
  swipeState,
  onAction,
  onOpen,
}: {
  providers: ExploreProvider[];
  swipeState: SwipeState;
  onAction: (provider: ExploreProvider, action: "like" | "skip" | "save") => void;
  onOpen: (provider: ExploreProvider) => void;
}) {
  const stack = providers.filter(
    (provider) =>
      !swipeState.liked.includes(provider.id) &&
      !swipeState.skipped.includes(provider.id) &&
      !swipeState.saved.includes(provider.id),
  );

  const front = stack[0] || null;

  return (
    <div className="relative mx-auto flex h-[calc(100vh-190px)] w-full max-w-[420px] flex-col md:h-[760px]">
      <div className="relative flex-1">
        <AnimatePresence mode="popLayout">
          {stack.slice(0, 3).reverse().map((provider, index) => {
            const depth = stack.slice(0, 3).length - index - 1;
            return (
              <motion.div
                key={provider.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.96, y: 14 }}
                animate={{ opacity: 1, scale: 1 - depth * 0.03, y: depth * 10 }}
                exit={{ opacity: 0, x: 260, rotate: 14, transition: { duration: 0.25 } }}
              >
                <article className="relative h-full overflow-hidden rounded-[32px] border border-border-subtle bg-white shadow-[0_32px_80px_rgb(var(--color-brand-primary-rgb)/0.16)]">
                  <div className="absolute inset-0">
                    <Image
                      src={provider.photoUrl}
                      alt={provider.name}
                      fill
                      className="object-cover"
                      style={{ objectPosition: FACE_FOCUS_OBJECT_POSITION }}
                      sizes="(max-width: 768px) 100vw, 420px"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(180deg,rgba(11,31,58,0.05)_0%,rgba(11,31,58,0.16)_42%,rgba(11,31,58,0.82)_100%)]" />
                  </div>
                  <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
                    {provider.verifiedStatus !== "directory" ? (
                      <span className="rounded-full border border-white/18 bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-xl">
                        {getVerificationLabel(provider)}
                      </span>
                    ) : null}
                    {provider.offers ? (
                      <span className="rounded-full border border-white/18 bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-xl">
                        Offer
                      </span>
                    ) : null}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <DecisionOverlay provider={provider} />
                    <div className="pt-16">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-3xl font-semibold">{provider.name}</h2>
                          <p className="mt-1 text-sm text-white/78">{provider.neighborhood}</p>
                          <TrustPills provider={provider} inverse />
                        </div>
                        <button
                          type="button"
                          onClick={() => onAction(provider, "save")}
                          className="rounded-full border border-white/20 bg-white/10 p-3 backdrop-blur-xl transition hover:bg-white/18"
                          aria-label={`Save ${provider.name}`}
                        >
                          <Star className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="mt-2 text-base font-medium">{provider.specialty}</p>
                      <ServiceModeSummary provider={provider} inverse />
                      <div className="mt-6 flex gap-3">
                        <button
                          type="button"
                          onClick={() => onAction(provider, "skip")}
                          className="inline-flex flex-1 items-center justify-center rounded-full border border-white/16 bg-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] backdrop-blur-xl transition hover:bg-white/18"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Skip
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction(provider, "like")}
                          className="inline-flex flex-1 items-center justify-center rounded-full bg-[rgb(var(--color-action-primary-rgb)/0.92)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] shadow-[0_20px_48px_rgb(var(--color-action-primary-rgb)/0.24)] transition hover:bg-[rgb(var(--color-action-primary-hover-rgb)/0.96)]"
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          Interested
                        </button>
                      </div>
                      <Button asChild variant="glass" className="mt-3 h-11 w-full rounded-full">
                        <Link href={provider.profilePath} onClick={() => onOpen(provider)}>
                          Open Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!front ? (
          <div className="flex h-full flex-col items-center justify-center rounded-[32px] border border-dashed border-border-strong bg-white/84 p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">Swipe complete</p>
            <h2 className="mt-3 text-2xl font-semibold text-text-primary">You cleared this stack.</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-text-secondary">
              Change filters, switch back to Grid, or restore saved providers to keep exploring.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SidebarFilters({
  draft,
  onDraftChange,
  onReset,
  onApply,
  compact = false,
}: {
  draft: ExploreFilters;
  onDraftChange: (next: ExploreFilters) => void;
  onReset: () => void;
  onApply: () => void;
  compact?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="space-y-6 overflow-y-auto pb-28">
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-text-muted">Radius</h3>
            <span className="text-sm font-semibold text-brand-secondary">{draft.radius} mi</span>
          </div>
          <div className="mt-4">
            <Slider
              value={[draft.radius]}
              min={5}
              max={100}
              step={5}
              onValueChange={(value) => onDraftChange({ ...draft, radius: value[0] || draft.radius })}
            />
          </div>
        </section>

        <section className="grid gap-3">
          {FILTER_CHIPS.map((chip) => (
            <label
              key={chip.key}
              className="flex items-center justify-between rounded-[20px] border border-border-subtle bg-white/82 px-4 py-3 text-sm text-text-secondary shadow-[inset_0_1px_0_rgb(255_255_255/_0.92)]"
            >
              <span>{chip.label}</span>
              <Checkbox
                checked={draft[chip.key]}
                onCheckedChange={(checked) =>
                  onDraftChange({ ...draft, [chip.key]: Boolean(checked) } as ExploreFilters)
                }
              />
            </label>
          ))}
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-text-muted">Starting Price</h3>
            <span className="text-sm font-semibold text-brand-secondary">
              ${draft.priceMin} - ${draft.priceMax}
            </span>
          </div>
          <div className="mt-4">
            <Slider
              value={[draft.priceMin, draft.priceMax]}
              min={0}
              max={EXPLORE_DEFAULT_PRICE_MAX}
              step={5}
              onValueChange={(value) =>
                onDraftChange({
                  ...draft,
                  priceMin: Math.min(value[0] || 0, value[1] || EXPLORE_DEFAULT_PRICE_MAX),
                  priceMax: Math.max(value[0] || 0, value[1] || EXPLORE_DEFAULT_PRICE_MAX),
                })
              }
            />
          </div>
        </section>
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 flex gap-3 border-t border-border-subtle bg-white/94 p-4 backdrop-blur-2xl",
          compact ? "sticky" : "",
        )}
      >
        <Button variant="outline" className="flex-1 rounded-full" onClick={onReset}>
          Reset
        </Button>
        <Button className="flex-1 rounded-full" onClick={onApply}>
          Apply
        </Button>
      </div>
    </div>
  );
}

function MapCanvas({
  providers,
  selectedProviderId,
  onSelect,
  onOpen,
}: {
  providers: ExploreProvider[];
  selectedProviderId: string | null;
  onSelect: (providerId: string) => void;
  onOpen: (provider: ExploreProvider) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const selected = providers.find((provider) => provider.id === selectedProviderId) || providers[0] || null;

  useEffect(() => {
    let disposed = false;

    const mountMap = async () => {
      if (!containerRef.current || mapRef.current) {
        return;
      }

      const L = await import("leaflet");
      if (disposed || !containerRef.current) {
        return;
      }

      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapRef.current);
    };

    void mountMap();

    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let disposed = false;

    const renderMarkers = async () => {
      const map = mapRef.current;
      if (!map) {
        return;
      }

      const L = await import("leaflet");
      if (disposed) {
        return;
      }

      if (layerRef.current) {
        layerRef.current.remove();
      }

      layerRef.current = L.layerGroup().addTo(map);

      const grouped =
        providers.length > 18
          ? Array.from(
              providers.reduce<Map<string, ExploreProvider[]>>((accumulator, provider) => {
                const key = `${provider.latitude.toFixed(2)}:${provider.longitude.toFixed(2)}`;
                const current = accumulator.get(key) || [];
                current.push(provider);
                accumulator.set(key, current);
                return accumulator;
              }, new Map()),
            )
          : providers.map((provider) => [provider.id, [provider]] as const);

      grouped.forEach(([, group]) => {
        const anchor = group[0];
        const active = group.some((provider) => provider.id === selectedProviderId);
        const icon = L.divIcon({
          className: "",
          html:
            group.length > 1
              ? `<div class="explore-map-cluster ${active ? "is-active" : ""}">${group.length}</div>`
              : `<div class="explore-map-marker ${active ? "is-active" : ""}">${anchor.availableNow ? "<span class='pulse'></span>" : ""}<span class='dot'></span></div>`,
          iconSize: group.length > 1 ? [46, 46] : [30, 30],
          iconAnchor: group.length > 1 ? [23, 23] : [15, 15],
        });

        const marker = L.marker([anchor.latitude, anchor.longitude], { icon });
        marker.on("click", () => {
          onSelect(anchor.id);
          trackExploreEvent("explore_map_pin_click", {
            provider_id: anchor.id,
            provider_name: anchor.name,
          });
        });
        marker.addTo(layerRef.current);
      });

      if (providers.length > 0) {
        const bounds = L.latLngBounds(providers.map((provider) => [provider.latitude, provider.longitude]));
        map.fitBounds(bounds.pad(0.18), { animate: false, maxZoom: providers.length === 1 ? 13 : 11 });
      } else {
        const dallas = getCityCoordinates(EXPLORE_DEFAULT_CITY);
        map.setView([dallas.latitude, dallas.longitude], 10);
      }
    };

    void renderMarkers();

    return () => {
      disposed = true;
    };
  }, [providers, selectedProviderId, onSelect]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-border-subtle bg-white/90 shadow-[0_26px_60px_rgb(var(--color-brand-primary-rgb)/0.08)]">
      <div ref={containerRef} className="h-full min-h-[420px] w-full md:min-h-[680px]" />

      {selected ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[500] md:inset-x-auto md:bottom-6 md:left-6 md:w-[320px]">
          <article className="pointer-events-auto overflow-hidden rounded-[24px] border border-white/40 bg-white/92 shadow-[0_24px_56px_rgba(11,31,58,0.18)] backdrop-blur-2xl">
            <div className="relative aspect-[16/9]">
              <Image
                src={selected.photoUrl}
                alt={selected.name}
                fill
                className="object-cover"
                style={{ objectPosition: FACE_FOCUS_OBJECT_POSITION }}
                sizes="320px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,31,58,0.46)] to-transparent" />
              <DecisionOverlay provider={selected} />
            </div>
            <div className="space-y-3 p-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{selected.name}</h3>
                <p className="text-sm text-text-secondary">{selected.neighborhood}</p>
              </div>
              <TrustPills provider={selected} />
              <p className="line-clamp-1 text-sm text-text-muted">{selected.specialty}</p>
              <ServiceModeSummary provider={selected} />
              <Button asChild size="sm" className="w-full rounded-full">
                <Link href={selected.profilePath} onClick={() => onOpen(selected)}>
                  View Profile
                </Link>
              </Button>
            </div>
          </article>
        </div>
      ) : null}
    </div>
  );
}

export default function ExplorePageClient({
  cities,
  hasExplicitLocation,
  initialBaseItems,
  initialFilters,
  initialInvalidProviderCount,
  initialTotal,
}: ExplorePageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [locationInput, setLocationInput] = useState(initialFilters.zip || initialFilters.city);
  const [baseProviders, setBaseProviders] = useState(initialBaseItems);
  const [visibleCount, setVisibleCount] = useState(Math.max(PAGE_BATCH, Math.min(initialTotal, PAGE_BATCH)));
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(initialBaseItems[0]?.id || null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [swipeState, setSwipeState] = useState<SwipeState>({ liked: [], skipped: [], saved: [] });
  const [compareSelection, setCompareSelection] = useState<ExploreProvider[]>([]);
  const [geoOrigin, setGeoOrigin] = useState<ExplorePoint | null>(null);
  const [invalidProviderCount, setInvalidProviderCount] = useState(initialInvalidProviderCount);
  const [serverLoading, setServerLoading] = useState(false);
  const [usingDetectedLocation, setUsingDetectedLocation] = useState(!hasExplicitLocation);
  const [isPending, startTransition] = useTransition();
  const impressionRef = useRef(new Set<string>());
  const listSentinelRef = useRef<HTMLDivElement | null>(null);
  const baseFetchKeyRef = useRef(`${initialFilters.city}|${initialFilters.zip}|${initialFilters.radius}`);
  const restoreHandledRef = useRef(false);
  const deferredLocationInput = useDeferredValue(locationInput);
  const { city: geoCity, requestLocation, denied: geoDenied } = useGeolocation({
    autoLocate: true,
    storageKey: "mm:explore:location-city",
  });

  const applyFilters = useCallback((next: ExploreFilters) => {
    setFilters(next);
    setDraftFilters(next);
  }, []);

  const fetchBaseProviders = useCallback(async (nextFilters: ExploreFilters) => {
    setServerLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("city", nextFilters.city);
      params.set("radius", String(nextFilters.radius));
      if (nextFilters.zip) {
        params.set("zip", nextFilters.zip);
      }
      params.set("pageSize", "60");

      const response = await fetch(`/api/providers?${params.toString()}`, {
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        ok: boolean;
        items: ExploreProvider[];
        meta?: {
          invalid_provider_count?: number;
        };
      };

      if (payload.ok) {
        setBaseProviders(payload.items);
        setInvalidProviderCount(payload.meta?.invalid_provider_count || 0);
      }
    } finally {
      setServerLoading(false);
    }
  }, []);

  const requestPreciseLocation = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return null;
    }

    return new Promise<ExplorePoint | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        () => resolve(null),
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 300_000,
        },
      );
    });
  }, []);

  const restoreState = useCallback(() => {
    if (typeof window === "undefined" || restoreHandledRef.current) {
      return;
    }

    restoreHandledRef.current = true;

    try {
      const storedFilters = window.localStorage.getItem(STORAGE_KEY);
      const storedSwipe = window.sessionStorage.getItem(SWIPE_KEY);
      const storedSession = window.sessionStorage.getItem(SESSION_KEY);

      if (!hasExplicitLocation && storedFilters) {
        const parsed = JSON.parse(storedFilters) as ExploreFilters;
        applyFilters(parsed);
        setLocationInput(parsed.zip || parsed.city);
      }

      if (storedSwipe) {
        setSwipeState(JSON.parse(storedSwipe) as SwipeState);
      }

      if (storedSession) {
        const parsed = JSON.parse(storedSession) as {
          path: string;
          scrollY: number;
          restorePending?: boolean;
        };

        if (parsed.restorePending && parsed.path === `${pathname}?${exploreFiltersToUrl(filters)}`) {
          window.setTimeout(() => {
            window.scrollTo({ top: parsed.scrollY || 0, behavior: "auto" });
            window.sessionStorage.setItem(
              SESSION_KEY,
              JSON.stringify({ ...parsed, restorePending: false }),
            );
          }, 40);
        }
      }
    } catch {
      // Ignore storage corruption and continue with server state.
    }
  }, [applyFilters, filters, hasExplicitLocation, pathname]);

  useEffect(() => {
    restoreState();
  }, [restoreState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    window.sessionStorage.setItem(SWIPE_KEY, JSON.stringify(swipeState));
  }, [filters, swipeState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleScroll = () => {
      window.sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          path: `${pathname}?${exploreFiltersToUrl(filters)}`,
          scrollY: window.scrollY,
          restorePending: false,
        }),
      );
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [filters, pathname]);

  useEffect(() => {
    const query = exploreFiltersToUrl(filters);
    const basePath = pathname || "/explore";
    const nextUrl = query ? `${basePath}?${query}` : basePath;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }, [filters, pathname, router]);

  useEffect(() => {
    const trimmed = deferredLocationInput.trim();
    if (!trimmed) {
      // Only clear the city when the user explicitly emptied the input. When the
      // location was auto-detected (geolocation), `locationInput` can momentarily
      // be empty while the deferred value trails behind `setLocationInput`, and
      // resetting here would fight the geoCity effect and cause an infinite
      // update loop (React error #185).
      if (!usingDetectedLocation && (filters.city !== EXPLORE_DEFAULT_CITY || filters.zip)) {
        applyFilters({ ...filters, city: EXPLORE_DEFAULT_CITY, zip: "" });
      }
      return;
    }

    const nextZip = isZip(trimmed) ? trimmed : "";
    const nextCity = resolveExploreCity(nextZip ? filters.city : trimmed, nextZip);
    if (nextCity === filters.city && nextZip === filters.zip) {
      return;
    }

    applyFilters({ ...filters, city: nextCity, zip: nextZip });
  }, [applyFilters, deferredLocationInput, filters, usingDetectedLocation]);

  useEffect(() => {
    if (hasExplicitLocation || typeof window === "undefined") {
      return;
    }

    const firstVisitKey = "mm:explore:first-location-attempt";
    if (window.localStorage.getItem(firstVisitKey)) {
      return;
    }

    window.localStorage.setItem(firstVisitKey, "1");
    void requestLocation(false);
  }, [hasExplicitLocation, requestLocation]);

  useEffect(() => {
    if (!geoCity || hasExplicitLocation || !usingDetectedLocation) {
      return;
    }

    const nextCity = resolveExploreCity(geoCity.name, "");
    if (nextCity === filters.city) {
      return;
    }

    applyFilters({ ...filters, city: nextCity, zip: "" });
    setLocationInput(nextCity);
  }, [applyFilters, filters, geoCity, hasExplicitLocation, usingDetectedLocation]);

  useEffect(() => {
    let cancelled = false;

    const hydrateGeolocation = async () => {
      const precise = await requestPreciseLocation();
      if (!cancelled && precise) {
        setGeoOrigin(precise);
      }
    };

    void hydrateGeolocation();

    return () => {
      cancelled = true;
    };
  }, [requestPreciseLocation]);

  useEffect(() => {
    const baseKey = `${filters.city}|${filters.zip}|${filters.radius}`;
    if (baseFetchKeyRef.current === baseKey) {
      return;
    }

    baseFetchKeyRef.current = baseKey;
    const timer = window.setTimeout(() => {
      void fetchBaseProviders(getBaseExploreFilters(filters));
    }, 240);

    return () => window.clearTimeout(timer);
  }, [fetchBaseProviders, filters]);

  const providers = useMemo(
    () => applyExploreFilters(baseProviders, filters, geoOrigin || undefined),
    [baseProviders, filters, geoOrigin],
  );

  const visibleProviders = useMemo(
    () => providers.slice(0, visibleCount),
    [providers, visibleCount],
  );

  const availableNowCount = useMemo(
    () => providers.filter((provider) => provider.availableNow).length,
    [providers],
  );

  const averageDistance = useMemo(() => {
    const distances = providers
      .map((provider) => provider.distance)
      .filter((value): value is number => typeof value === "number");
    if (distances.length === 0) {
      return null;
    }

    return Number((distances.reduce((sum, value) => sum + value, 0) / distances.length).toFixed(1));
  }, [providers]);

  const priceFloor = useMemo(() => getPriceFloor(providers), [providers]);

  useEffect(() => {
    setVisibleCount(Math.max(PAGE_BATCH, Math.min(providers.length, PAGE_BATCH)));
    setSelectedProviderId((current) =>
      providers.some((provider) => provider.id === current) ? current : providers[0]?.id || null,
    );
  }, [providers]);

  useEffect(() => {
    visibleProviders.forEach((provider) => {
      if (!impressionRef.current.has(provider.id)) {
        impressionRef.current.add(provider.id);
        trackExploreEvent("explore_card_impression", {
          provider_id: provider.id,
          provider_name: provider.name,
          view: filters.view,
        });
      }
    });
  }, [filters.view, visibleProviders]);

  useEffect(() => {
    if (!listSentinelRef.current || filters.view !== "grid") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((current) => Math.min(providers.length, current + PAGE_BATCH));
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(listSentinelRef.current);
    return () => observer.disconnect();
  }, [filters.view, providers.length]);

  useEffect(() => {
    if (typeof window === "undefined" || filters.view !== "swipe") {
      return;
    }

    const remaining = providers.filter(
      (provider) =>
        !swipeState.liked.includes(provider.id) &&
        !swipeState.skipped.includes(provider.id) &&
        !swipeState.saved.includes(provider.id),
    );

    remaining.slice(1, 4).forEach((provider) => {
      const image = new window.Image();
      image.src = provider.photoUrl;
    });
  }, [filters.view, providers, swipeState]);

  const handleToggleChip = useCallback(
    (key: FilterBooleanKey) => {
      const next = { ...filters, [key]: !filters[key] } as ExploreFilters;
      applyFilters(next);
      trackExploreEvent("explore_filter_toggle", {
        filter: key,
        active: next[key],
      });
    },
    [applyFilters, filters],
  );

  const handleSortChange = useCallback(
    (sort: ExploreFilters["sort"]) => {
      applyFilters({ ...filters, sort });
      trackExploreEvent("explore_sort_change", {
        sort,
      });
    },
    [applyFilters, filters],
  );

  const handleViewChange = useCallback(
    (view: ExploreFilters["view"]) => {
      applyFilters({ ...filters, view });
      trackExploreEvent("explore_view_change", {
        view,
      });
    },
    [applyFilters, filters],
  );

  const handleProfileOpen = useCallback(
    (provider: ExploreProvider) => {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            path: `${pathname}?${exploreFiltersToUrl(filters)}`,
            scrollY: window.scrollY,
            restorePending: true,
          }),
        );
      }

      trackExploreEvent("explore_profile_open", {
        provider_id: provider.id,
        provider_name: provider.name,
        view: filters.view,
      });
    },
    [filters, pathname],
  );

  const handleUseMyLocation = useCallback(async () => {
    const [resolvedCity, precise] = await Promise.all([
      requestLocation(true),
      requestPreciseLocation(),
    ]);

    if (precise) {
      setGeoOrigin(precise);
    }

    if (resolvedCity) {
      setUsingDetectedLocation(true);
      setLocationInput(resolvedCity.name);
      applyFilters({ ...filters, city: resolvedCity.name, zip: "" });
      trackExploreEvent("explore_location_used", {
        city: resolvedCity.name,
      });
    }
  }, [applyFilters, filters, requestLocation, requestPreciseLocation]);

  const handleSwipeAction = useCallback(
    (provider: ExploreProvider, action: "like" | "skip" | "save") => {
      setSwipeState((current) => {
        const key = action === "like" ? "liked" : action === "save" ? "saved" : "skipped";
        return {
          ...current,
          [key]: Array.from(new Set([...current[key], provider.id])),
        };
      });

      trackExploreEvent("explore_swipe_action", {
        provider_id: provider.id,
        provider_name: provider.name,
        action,
      });

    },
    [],
  );

  const handleToggleCompare = useCallback((provider: ExploreProvider) => {
    setCompareSelection((current) => {
      const exists = current.some((item) => item.id === provider.id);
      if (exists) {
        return current.filter((item) => item.id !== provider.id);
      }

      if (current.length >= 3) {
        return [...current.slice(1), provider];
      }

      return [...current, provider];
    });
  }, []);

  const compareHref = compareSelection.length >= 2
    ? `/compare?ids=${compareSelection.map((provider) => provider.id).join(",")}`
    : "#";

  const handleSidebarReset = useCallback(() => {
    const reset = { ...initialFilters, city: filters.city, zip: filters.zip, radius: filters.radius };
    setDraftFilters(reset);
  }, [filters.city, filters.radius, filters.zip, initialFilters]);

  const handleSidebarApply = useCallback(() => {
    applyFilters(draftFilters);
    setMobileFiltersOpen(false);
  }, [applyFilters, draftFilters]);

  const selectedProvider =
    providers.find((provider) => provider.id === selectedProviderId) || providers[0] || null;

  return (
    <main className="explore-shell relative overflow-hidden pb-20">
      <div className="site-ambient-glow site-ambient-glow-left" />
      <div className="site-ambient-glow site-ambient-glow-right" />

      <div className="page-shell pt-8 md:pt-10">
        <section className="hero-panel premium-fade-up overflow-hidden rounded-[36px] border border-border-subtle/80 px-6 py-7 md:px-8 md:py-9">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr),minmax(320px,420px)]">
            <div>
              <span className="eyebrow-chip">Premium Local Discovery Engine</span>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-text-primary md:text-6xl">
                Explore by the signals that actually convert.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary md:text-lg">
                Available now, distance, and starting price stay visible across Grid, Map, and Swipe so users can make a decision in seconds instead of digging through generic directory cards.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-border-subtle bg-white/84 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                  Sorts by distance by default
                </span>
                <span className="rounded-full border border-border-subtle bg-white/84 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                  Grid, map, and swipe ready
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[28px] border border-white/40 bg-white/78 p-5 shadow-[0_20px_40px_rgb(var(--color-brand-primary-rgb)/0.08)] backdrop-blur-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Available Now</p>
                <p className="mt-3 text-3xl font-semibold text-text-primary">{availableNowCount}</p>
                <p className="mt-2 text-sm text-text-secondary">Profiles with live visibility right now.</p>
              </div>
              <div className="rounded-[28px] border border-white/40 bg-white/78 p-5 shadow-[0_20px_40px_rgb(var(--color-brand-primary-rgb)/0.08)] backdrop-blur-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Average Distance</p>
                <p className="mt-3 text-3xl font-semibold text-text-primary">
                  {averageDistance ? `${averageDistance} mi` : "Near you"}
                </p>
                <p className="mt-2 text-sm text-text-secondary">Re-sorted when location is available.</p>
              </div>
              <div className="rounded-[28px] border border-white/40 bg-white/78 p-5 shadow-[0_20px_40px_rgb(var(--color-brand-primary-rgb)/0.08)] backdrop-blur-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Starting Price</p>
                <p className="mt-3 text-3xl font-semibold text-text-primary">
                  {priceFloor ? formatCurrency(priceFloor) : "Request"}
                </p>
                <p className="mt-2 text-sm text-text-secondary">Visible on every primary card surface.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[30px] border border-border-subtle/90 bg-white/88 p-4 shadow-[0_24px_60px_rgb(var(--color-brand-primary-rgb)/0.06)] backdrop-blur-2xl md:p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(220px,320px),minmax(220px,280px),1fr,auto,auto]">
            <div className="rounded-[22px] border border-border-subtle bg-[rgb(var(--color-bg-body-rgb)/0.76)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">City or ZIP</p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  value={locationInput}
                  onChange={(event) => {
                    setUsingDetectedLocation(false);
                    setLocationInput(event.target.value);
                  }}
                  list="explore-city-options"
                  placeholder="City or ZIP code"
                  className="w-full bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={() => void handleUseMyLocation()}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-white/90 text-brand-secondary transition hover:text-brand-deep"
                  aria-label="Use my location"
                >
                  <LocateFixed className="h-4 w-4" />
                </button>
              </div>
              <datalist id="explore-city-options">
                {cities.map((city) => (
                  <option key={city.slug} value={city.name} />
                ))}
              </datalist>
            </div>

            <div className="rounded-[22px] border border-border-subtle bg-[rgb(var(--color-bg-body-rgb)/0.76)] px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">Radius</p>
                <span className="text-sm font-semibold text-brand-secondary">{filters.radius} mi</span>
              </div>
              <div className="mt-4">
                <Slider
                  value={[filters.radius]}
                  min={5}
                  max={100}
                  step={5}
                  onValueChange={(value) => applyFilters({ ...filters, radius: value[0] || filters.radius })}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTER_CHIPS.map((chip) => (
                <FilterChip
                  key={chip.key}
                  label={chip.label}
                  active={filters[chip.key]}
                  onClick={() => handleToggleChip(chip.key)}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={filters.sort}
                onValueChange={(value) => handleSortChange(value as ExploreFilters["sort"])}
              >
                <SelectTrigger className="h-12 rounded-full border-border-subtle bg-white/90 px-4" aria-label="Sort by">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="h-12 rounded-full px-5 md:hidden"
                onClick={() => {
                  setDraftFilters(filters);
                  setMobileFiltersOpen(true);
                }}
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            <div className="flex justify-end">
              <ViewToggle
                value={filters.view}
                onChange={handleViewChange}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[300px,minmax(0,1fr)]">
          <aside className="relative hidden lg:block">
            <div className="sticky top-[98px] overflow-hidden rounded-[32px] border border-border-subtle bg-white/88 p-6 shadow-[0_28px_64px_rgb(var(--color-brand-primary-rgb)/0.07)] backdrop-blur-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Filters</p>
                  <h2 className="mt-2 text-2xl font-semibold text-text-primary">Refine fast</h2>
                </div>
                <SlidersHorizontal className="h-5 w-5 text-brand-secondary" />
              </div>

              <SidebarFilters
                draft={draftFilters}
                onDraftChange={setDraftFilters}
                onReset={handleSidebarReset}
                onApply={handleSidebarApply}
              />
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Results</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-text-primary">
                  {providers.length} providers near {filters.city}
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  Decision layer standardized around availability, distance, and starting price.
                  {(serverLoading || isPending) ? " Updating..." : ""}
                </p>
                {invalidProviderCount > 0 ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                    {invalidProviderCount} incomplete {invalidProviderCount === 1 ? "profile" : "profiles"} hidden until neighborhood, experience, and starting price are complete.
                  </p>
                ) : null}
                {geoDenied ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">
                      Location permission denied — showing an approximate city fallback.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => void requestLocation(true)}
                    >
                      Retry location
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setLocationInput(filters.city);
                    setSwipeState({ liked: [], skipped: [], saved: [] });
                    applyFilters({
                      ...initialFilters,
                      city: filters.city,
                      zip: filters.zip,
                      radius: filters.radius,
                    });
                    trackExploreEvent("explore_reset", { city: filters.city });
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>

            {providers.length === 0 ? (
              <div className="mt-6 rounded-[30px] border border-dashed border-border-strong bg-white/82 p-10 text-center shadow-[0_20px_50px_rgb(var(--color-brand-primary-rgb)/0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">No Results</p>
                <h3 className="mt-3 text-2xl font-semibold text-text-primary">Nothing matches these filters yet.</h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-secondary">
                  Broaden the radius, turn off one of the quick chips, or switch to Swipe to restart discovery with a wider conversion funnel.
                </p>
              </div>
            ) : null}

            {providers.length > 0 && filters.view === "grid" ? (
              <>
                <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                  {visibleProviders.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      onOpen={handleProfileOpen}
                      onSelect={setSelectedProviderId}
                    />
                  ))}

                  {(serverLoading || isPending) ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="h-[640px] rounded-[28px] border border-border-subtle bg-white/80 p-3 shadow-[0_24px_56px_rgb(var(--color-brand-primary-rgb)/0.05)]"
                      >
                        <div className="shimmer h-full rounded-[24px]" />
                      </div>
                    ))
                  ) : null}
                </div>
                <div ref={listSentinelRef} className="h-12" />
              </>
            ) : null}

            {providers.length > 0 && filters.view === "cards" ? (
              <>
                <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {visibleProviders.map((provider) => (
                    <CompactTherapistCard
                      key={provider.id}
                      provider={provider}
                      onOpen={handleProfileOpen}
                    />
                  ))}

                  {(serverLoading || isPending) ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="aspect-[3/4] rounded-xl border border-slate-200 bg-slate-100 animate-pulse"
                      />
                    ))
                  ) : null}
                </div>
                <div ref={listSentinelRef} className="h-12" />
              </>
            ) : null}

            {providers.length > 0 && filters.view === "map" ? (
              <div className="mt-6">
                <div className="fixed inset-x-0 bottom-0 top-[75px] z-40 bg-[rgb(var(--color-bg-body-rgb)/0.92)] px-4 pb-4 pt-4 md:static md:inset-auto md:h-[720px] md:bg-transparent md:p-0">
                  <div className="mb-3 flex items-center justify-between md:hidden">
                    <span className="rounded-full border border-border-subtle bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                      Map View
                    </span>
                    <ViewToggle value={filters.view} onChange={handleViewChange} />
                  </div>
                  <MapCanvas
                    providers={providers}
                    selectedProviderId={selectedProviderId}
                    onSelect={setSelectedProviderId}
                    onOpen={handleProfileOpen}
                  />
                </div>
              </div>
            ) : null}

            {providers.length > 0 && filters.view === "swipe" ? (
              <div className="mt-6">
                <SwipeDeck
                  providers={providers}
                  swipeState={swipeState}
                  onAction={handleSwipeAction}
                  onOpen={handleProfileOpen}
                />
              </div>
            ) : null}

            {selectedProvider && filters.view === "grid" ? (
              <div className="mt-8 rounded-[30px] border border-border-subtle bg-white/88 p-5 shadow-[0_24px_60px_rgb(var(--color-brand-primary-rgb)/0.06)] backdrop-blur-2xl md:hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Current Highlight</p>
                <h3 className="mt-3 text-xl font-semibold text-text-primary">{selectedProvider.name}</h3>
                <p className="mt-2 text-sm text-text-secondary">{selectedProvider.overlaySummary}</p>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {compareSelection.length > 0 ? (
        <div className="fixed bottom-4 left-1/2 z-50 w-[min(720px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-border-subtle bg-white/95 p-3 shadow-2xl backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-text-secondary">
              Compare queue: {compareSelection.map((provider) => provider.name).join(" • ")}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCompareSelection([])}>Clear</Button>
              <Button size="sm" asChild disabled={compareSelection.length < 2}>
                <Link
                  href={compareHref}
                  onClick={compareSelection.length < 2 ? (e) => e.preventDefault() : undefined}
                >
                  Compare {compareSelection.length} profiles
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent
          side="bottom"
          className="h-[88vh] rounded-t-[32px] border-none bg-[rgb(var(--color-bg-body-rgb))] p-0"
        >
          <div className="relative flex h-full flex-col">
            <div className="border-b border-border-subtle px-5 py-5">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Quick, visible, and thumb-friendly controls for Explore.
                </SheetDescription>
              </SheetHeader>
            </div>

            <div className="relative flex-1 overflow-hidden px-5 py-5">
              <div className="space-y-6">
                {/* Standard Sidebar Filters */}
                <SidebarFilters
                  draft={draftFilters}
                  onDraftChange={setDraftFilters}
                  onReset={handleSidebarReset}
                  onApply={handleSidebarApply}
                  compact
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}
