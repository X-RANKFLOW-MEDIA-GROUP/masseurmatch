"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgePercent,
  Clock,
  Loader2,
  MapPin,
  Plane,
  Plus,
  Save,
  Trash2,
  Zap,
} from "lucide-react";

import { postJson, requestJson } from "@/app/_lib/request";
import { useToast } from "@/hooks/use-toast";

type TravelEntry = {
  city: string;
  state: string;
  start_date: string;
  end_date: string;
};

type Promotion = {
  title: string;
  description: string;
};

type GrowthProfile = {
  id: string;
  subscription_tier: string | null;
  available_now: boolean | null;
  available_now_expires: string | null;
  travel_schedule: unknown;
  promotions: unknown;
};

const TIER_AVAILABLE_NOW_HOURS: Record<string, number | null> = {
  free: null,
  standard: 2,
  pro: 3,
  elite: 4,
};

function normalizeTravel(value: unknown): TravelEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      city: typeof item.city === "string" ? item.city : "",
      state: typeof item.state === "string" ? item.state : "",
      start_date: typeof item.start_date === "string" ? item.start_date : "",
      end_date: typeof item.end_date === "string" ? item.end_date : "",
    }))
    .filter((entry) => entry.city);
}

function normalizePromotions(value: unknown): Promotion[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      description: typeof item.description === "string" ? item.description : "",
    }))
    .filter((entry) => entry.title);
}

function formatCountdown(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return null;
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const target = new Date(expiresAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${hours > 0 ? `${hours}h ` : ""}${minutes}m left · until ${target}`;
}

function inputCls(extra = "") {
  return `w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 ${extra}`;
}

function Panel({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof Plane;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <Icon className="h-4 w-4 text-slate-600" strokeWidth={2.25} />
        </div>
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </section>
  );
}

export default function GrowthPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string>("free");
  const [availableNow, setAvailableNow] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const [travel, setTravel] = useState<TravelEntry[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [savingTravel, setSavingTravel] = useState(false);
  const [savingSpecials, setSavingSpecials] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    requestJson<{ ok: boolean; profile: GrowthProfile }>("/api/pro/growth")
      .then((data) => {
        const p = data.profile;
        setTier((p.subscription_tier || "free").toLowerCase());
        setAvailableNow(Boolean(p.available_now));
        setExpiresAt(p.available_now_expires ?? null);
        setTravel(normalizeTravel(p.travel_schedule));
        setPromotions(normalizePromotions(p.promotions));
      })
      .catch(() => {
        toast({
          title: "Could not load growth tools",
          description: "Reload the page in a moment.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const availableHours = TIER_AVAILABLE_NOW_HOURS[tier] ?? null;
  // `now` ticks every 30s so the countdown stays fresh.
  void now;
  const countdown = formatCountdown(expiresAt);
  const isLiveNow = availableNow && Boolean(countdown);

  async function toggleAvailableNow() {
    if (availableHours === null) {
      toast({
        title: "Available Now requires a paid plan",
        description: "Upgrade to Standard, Pro, or Elite to broadcast live availability.",
        variant: "destructive",
      });
      return;
    }
    setActivating(true);
    try {
      const res = await postJson<{ ok: boolean; available_now: boolean; expires_at?: string }>(
        "/api/pro/available-now",
        { activate: !isLiveNow },
      );
      setAvailableNow(res.available_now);
      setExpiresAt(res.available_now ? res.expires_at ?? null : null);
      toast({
        title: res.available_now ? "You're live" : "Available Now turned off",
        description: res.available_now
          ? `Clients see your 'Available Now' badge for the next ${availableHours} hours.`
          : "Your profile no longer shows the live availability badge.",
      });
    } catch (error) {
      toast({
        title: "Could not update availability",
        description: error instanceof Error ? error.message : "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setActivating(false);
    }
  }

  async function saveTravel() {
    setSavingTravel(true);
    try {
      const cleaned = travel
        .map((t) => ({
          city: t.city.trim(),
          state: t.state.trim() || null,
          start_date: t.start_date,
          end_date: t.end_date,
        }))
        .filter((t) => t.city && t.start_date && t.end_date);
      await postJson("/api/pro/growth", { travel_schedule: cleaned });
      toast({ title: "Travel schedule saved", description: "Clients in those cities can now find you." });
    } catch (error) {
      toast({
        title: "Could not save travel schedule",
        description: error instanceof Error ? error.message : "Check the dates and try again.",
        variant: "destructive",
      });
    } finally {
      setSavingTravel(false);
    }
  }

  async function saveSpecials() {
    setSavingSpecials(true);
    try {
      const cleaned = promotions
        .map((p) => ({ title: p.title.trim(), description: p.description.trim() }))
        .filter((p) => p.title && p.description);
      await postJson("/api/pro/growth", { promotions: cleaned });
      toast({ title: "Specials saved", description: "Your deals now show on your public listing." });
    } catch (error) {
      toast({
        title: "Could not save specials",
        description: error instanceof Error ? error.message : "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSavingSpecials(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-32 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Growth Tools</h1>
        <p className="mt-1 text-sm text-slate-500">
          Boost your visibility — go live now, post travel dates, and run weekly specials.
        </p>
      </div>

      {/* Available Now with expiry */}
      <Panel icon={Zap} title="Available Now" subtitle="Pin your profile to the top of local search with a live badge">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${
                isLiveNow ? "bg-emerald-500/15 text-emerald-600" : "bg-slate-200 text-slate-500"
              }`}
            >
              <Zap className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {isLiveNow ? "You're available now" : "Currently not broadcasting"}
              </p>
              {isLiveNow && countdown ? (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-700">
                  <Clock className="h-3.5 w-3.5" strokeWidth={2.25} />
                  {countdown}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-slate-500">
                  {availableHours === null
                    ? "Available on Standard, Pro, and Elite plans."
                    : `Activating broadcasts for ${availableHours} hours on your ${tier} plan.`}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={toggleAvailableNow}
            disabled={activating || availableHours === null}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
              isLiveNow
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
          >
            {activating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" strokeWidth={2.25} />
            )}
            {isLiveNow ? "Turn off" : "Go live now"}
          </button>
        </div>
      </Panel>

      {/* Travel Schedule */}
      <Panel icon={Plane} title="Travel Schedule" subtitle="List cities you're visiting so clients there can find you">
        <div className="space-y-3">
          {travel.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No trips yet. Add a destination to appear in those cities.
            </p>
          ) : (
            travel.map((entry, index) => (
              <div
                key={`trip-${index}`}
                className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_90px_1fr_1fr_auto]"
              >
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" strokeWidth={2.25} />
                  <input
                    className={inputCls("pl-9")}
                    value={entry.city}
                    placeholder="City"
                    onChange={(e) =>
                      setTravel((rows) => rows.map((r, i) => (i === index ? { ...r, city: e.target.value } : r)))
                    }
                  />
                </div>
                <input
                  className={inputCls()}
                  value={entry.state}
                  placeholder="State"
                  maxLength={2}
                  onChange={(e) =>
                    setTravel((rows) =>
                      rows.map((r, i) => (i === index ? { ...r, state: e.target.value.toUpperCase() } : r)),
                    )
                  }
                />
                <input
                  type="date"
                  className={inputCls()}
                  value={entry.start_date}
                  onChange={(e) =>
                    setTravel((rows) => rows.map((r, i) => (i === index ? { ...r, start_date: e.target.value } : r)))
                  }
                />
                <input
                  type="date"
                  className={inputCls()}
                  value={entry.end_date}
                  onChange={(e) =>
                    setTravel((rows) => rows.map((r, i) => (i === index ? { ...r, end_date: e.target.value } : r)))
                  }
                />
                <button
                  type="button"
                  aria-label="Remove trip"
                  onClick={() => setTravel((rows) => rows.filter((_, i) => i !== index))}
                  className="flex items-center justify-center rounded-xl border border-rose-200 px-3 text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2.25} />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() =>
              setTravel((rows) => [...rows, { city: "", state: "", start_date: "", end_date: "" }])
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Add destination
          </button>
          <button
            type="button"
            onClick={saveTravel}
            disabled={savingTravel}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            {savingTravel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" strokeWidth={2.25} />}
            Save schedule
          </button>
        </div>
      </Panel>

      {/* Weekly Specials */}
      <Panel
        icon={BadgePercent}
        title="Weekly Specials"
        subtitle="Post limited-time deals shown as 'Massage Deals' on your listing"
      >
        <div className="space-y-3">
          {promotions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No specials yet. Add a deal to stand out in search.
            </p>
          ) : (
            promotions.map((promo, index) => (
              <div key={`promo-${index}`} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <input
                    className={inputCls()}
                    value={promo.title}
                    placeholder="Offer title — e.g. 20% off 90-min sessions this week"
                    maxLength={120}
                    onChange={(e) =>
                      setPromotions((rows) =>
                        rows.map((r, i) => (i === index ? { ...r, title: e.target.value } : r)),
                      )
                    }
                  />
                  <button
                    type="button"
                    aria-label="Remove special"
                    onClick={() => setPromotions((rows) => rows.filter((_, i) => i !== index))}
                    className="flex shrink-0 items-center justify-center rounded-xl border border-rose-200 px-3 py-2.5 text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2.25} />
                  </button>
                </div>
                <textarea
                  className={inputCls("min-h-[72px] resize-none")}
                  value={promo.description}
                  placeholder="Describe the deal, who it's for, and how to claim it."
                  maxLength={400}
                  onChange={(e) =>
                    setPromotions((rows) =>
                      rows.map((r, i) => (i === index ? { ...r, description: e.target.value } : r)),
                    )
                  }
                />
              </div>
            ))
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPromotions((rows) => [...rows, { title: "", description: "" }])}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Add special
          </button>
          <button
            type="button"
            onClick={saveSpecials}
            disabled={savingSpecials}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            {savingSpecials ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" strokeWidth={2.25} />
            )}
            Save specials
          </button>
        </div>
      </Panel>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-xs text-slate-400"
      >
        Travel cities and specials appear on your public profile after your next review pass.
      </motion.p>
    </div>
  );
}
