"use client";

import { useEffect, useMemo, useState } from "react";
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

import { ApiError, postJson, requestJson } from "@/app/_lib/request";
import { useToast } from "@/hooks/use-toast";
import { US_CITIES } from "@/data/cities";
import {
  AVAILABLE_NOW_RULES,
  formatDuration,
  normalizeProviderTier,
  TRAVEL_DESTINATION_LIMITS,
  type ProviderTier,
} from "@/lib/provider-product-rules";

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

type GrowthResponse = {
  ok: boolean;
  profile: GrowthProfile;
  limits?: { travel_destinations_per_month: number | null };
};

type AvailableResponse = {
  ok: boolean;
  available_now: boolean;
  expires_at?: string;
  cooldown_until?: string | null;
  duration_minutes?: number;
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

function formatCountdown(expiresAt: string | null, now: number): string | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - now;
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
  return `h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 [color-scheme:light] ${extra}`;
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
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <Icon className="h-5 w-5 text-slate-700" strokeWidth={2.25} />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-slate-950">{title}</h2>
          <p className="mt-0.5 text-sm leading-5 text-slate-600">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      {children}
    </label>
  );
}

function countTripsByMonth(travel: TravelEntry[]) {
  const counts = new Map<string, number>();
  travel.forEach((trip) => {
    const month = trip.start_date?.slice(0, 7);
    if (month) counts.set(month, (counts.get(month) || 0) + 1);
  });
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export default function GrowthPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<ProviderTier>("free");
  const [travelLimit, setTravelLimit] = useState<number | null>(TRAVEL_DESTINATION_LIMITS.free);
  const [availableNow, setAvailableNow] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [travel, setTravel] = useState<TravelEntry[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [savingTravel, setSavingTravel] = useState(false);
  const [savingSpecials, setSavingSpecials] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    requestJson<GrowthResponse>("/api/pro/growth")
      .then((data) => {
        const nextTier = normalizeProviderTier(data.profile.subscription_tier);
        setTier(nextTier);
        setTravelLimit(data.limits?.travel_destinations_per_month ?? TRAVEL_DESTINATION_LIMITS[nextTier]);
        setAvailableNow(Boolean(data.profile.available_now));
        setExpiresAt(data.profile.available_now_expires ?? null);
        setTravel(normalizeTravel(data.profile.travel_schedule));
        setPromotions(normalizePromotions(data.profile.promotions));
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

  const availableRule = AVAILABLE_NOW_RULES[tier];
  const countdown = formatCountdown(expiresAt, now);
  const isLiveNow = availableNow && Boolean(countdown);
  const isCooldown = !availableNow && Boolean(countdown);
  const monthlyCounts = useMemo(() => countTripsByMonth(travel), [travel]);

  async function toggleAvailableNow() {
    if (isCooldown) return;
    setActivating(true);
    try {
      const response = await postJson<AvailableResponse>("/api/pro/available-now", {
        activate: !isLiveNow,
      });
      setAvailableNow(response.available_now);
      setExpiresAt(
        response.available_now
          ? response.expires_at ?? null
          : response.cooldown_until ?? expiresAt,
      );
      toast({
        title: response.available_now ? "You're available now" : "Available Now turned off",
        description: response.available_now
          ? `Your badge remains active for ${formatDuration(response.duration_minutes ?? availableRule.durationMinutes)}.`
          : response.cooldown_until
            ? "The remaining window is now a cooldown. You can activate again when the timer ends."
            : "Your badge is no longer visible.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Try again in a moment.";
      toast({ title: "Could not update availability", description: message, variant: "destructive" });
    } finally {
      setActivating(false);
    }
  }

  function addDestination() {
    setTravel((rows) => [...rows, { city: "", state: "", start_date: "", end_date: "" }]);
  }

  async function saveTravel() {
    setSavingTravel(true);
    try {
      const cleaned = travel
        .map((trip) => ({
          city: trip.city.trim(),
          state: trip.state.trim() || null,
          start_date: trip.start_date,
          end_date: trip.end_date,
        }))
        .filter((trip) => trip.city || trip.start_date || trip.end_date);

      if (cleaned.some((trip) => !trip.city || !trip.start_date || !trip.end_date)) {
        throw new Error("Complete City, Start Date, and End Date for every destination.");
      }

      const response = await postJson<GrowthResponse>("/api/pro/growth", { travel_schedule: cleaned });
      setTravel(normalizeTravel(response.profile.travel_schedule));
      toast({ title: "Travel schedule saved", description: "Your upcoming destinations are now updated." });
    } catch (error) {
      const message = error instanceof ApiError || error instanceof Error ? error.message : "Check the dates and try again.";
      toast({ title: "Could not save travel schedule", description: message, variant: "destructive" });
    } finally {
      setSavingTravel(false);
    }
  }

  async function saveSpecials() {
    setSavingSpecials(true);
    try {
      const cleaned = promotions
        .map((promotion) => ({ title: promotion.title.trim(), description: promotion.description.trim() }))
        .filter((promotion) => promotion.title && promotion.description);
      await postJson("/api/pro/growth", { promotions: cleaned });
      toast({ title: "Specials saved", description: "Your current specials were updated." });
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
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 pb-32 sm:p-6 md:p-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Provider Dashboard</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-950">Growth Tools</h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
          Manage live availability, travel destinations, and profile specials from one place.
        </p>
      </header>

      <Panel icon={Zap} title="Available Now" subtitle="Show a temporary live badge and move higher in local discovery.">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${isLiveNow ? "bg-emerald-100 text-emerald-700" : isCooldown ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"}`}>
                {isCooldown ? <Clock className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-bold text-slate-950">
                  {isLiveNow ? "You're available now" : isCooldown ? "Waiting period active" : "Currently off"}
                </p>
                <p className={`mt-1 text-sm ${isLiveNow ? "text-emerald-700" : isCooldown ? "text-amber-700" : "text-slate-600"}`}>
                  {countdown || `${tier[0].toUpperCase()}${tier.slice(1)} includes ${formatDuration(availableRule.durationMinutes)} per activation.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleAvailableNow}
              disabled={activating || isCooldown}
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-55 ${isLiveNow ? "bg-slate-950 hover:bg-slate-800" : "bg-emerald-500 hover:bg-emerald-600"}`}
            >
              {activating ? <Loader2 className="h-5 w-5 animate-spin" /> : isCooldown ? <Clock className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
              {isLiveNow ? "Turn off" : isCooldown ? "Wait for timer" : "Go live now"}
            </button>
          </div>
        </div>
        <p className="text-sm leading-6 text-slate-600">
          Turning the badge off does not reset the timer. You must wait until the original window ends before activating again.
        </p>
      </Panel>

      <Panel icon={Plane} title="Travel Schedule" subtitle="Add the cities and dates where clients should be able to discover you.">
        <div className="flex flex-col gap-2 rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">{tier[0].toUpperCase() + tier.slice(1)} plan allowance</p>
            <p className="text-sm text-slate-600">
              {travelLimit === null ? "Unlimited destinations each month." : `${travelLimit} destination${travelLimit === 1 ? "" : "s"} per calendar month.`}
            </p>
          </div>
          {monthlyCounts.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
              {monthlyCounts.map(([month, count]) => (
                <span key={month} className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                  {month}: {count}{travelLimit === null ? "" : `/${travelLimit}`}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {travel.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
              No travel destinations yet.
            </p>
          ) : (
            travel.map((entry, index) => (
              <div key={`trip-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_90px_1fr_1fr_auto] lg:items-end">
                  <Field label="City">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                      <input
                        list={`travel-cities-${index}`}
                        className={inputCls("pl-10")}
                        value={entry.city}
                        placeholder="San Antonio"
                        onChange={(event) => {
                          const raw = event.target.value;
                          const match = US_CITIES.find((city) => `${city.name}, ${city.stateCode}` === raw);
                          setTravel((rows) => rows.map((row, rowIndex) => rowIndex === index ? {
                            ...row,
                            city: match?.name ?? raw,
                            state: match?.stateCode ?? row.state,
                          } : row));
                        }}
                      />
                      <datalist id={`travel-cities-${index}`}>
                        {US_CITIES.slice(0, 500).map((city) => (
                          <option key={`${city.slug}-${city.stateCode}`} value={`${city.name}, ${city.stateCode}`} />
                        ))}
                      </datalist>
                    </div>
                  </Field>
                  <Field label="State">
                    <input
                      className={inputCls()}
                      value={entry.state}
                      placeholder="TX"
                      maxLength={2}
                      onChange={(event) => setTravel((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, state: event.target.value.toUpperCase() } : row))}
                    />
                  </Field>
                  <Field label="Start Date">
                    <input
                      type="date"
                      className={inputCls()}
                      value={entry.start_date}
                      onChange={(event) => setTravel((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, start_date: event.target.value } : row))}
                    />
                  </Field>
                  <Field label="End Date">
                    <input
                      type="date"
                      min={entry.start_date || undefined}
                      className={inputCls()}
                      value={entry.end_date}
                      onChange={(event) => setTravel((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, end_date: event.target.value } : row))}
                    />
                  </Field>
                  <button
                    type="button"
                    aria-label="Remove destination"
                    onClick={() => setTravel((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}
                    className="flex h-12 items-center justify-center rounded-xl border border-rose-200 px-4 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button type="button" onClick={addDestination} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 font-semibold text-slate-800 hover:bg-slate-50">
            <Plus className="h-5 w-5" /> Add destination
          </button>
          <button type="button" onClick={saveTravel} disabled={savingTravel} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800 disabled:opacity-50">
            {savingTravel ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save schedule
          </button>
        </div>
      </Panel>

      <Panel icon={BadgePercent} title="Weekly Specials" subtitle="Publish a short, professional offer on your public profile.">
        <div className="space-y-4">
          {promotions.map((promotion, index) => (
            <div key={`promotion-${index}`} className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <Field label="Special title">
                <input className={inputCls()} value={promotion.title} placeholder="Weekday recovery special" onChange={(event) => setPromotions((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, title: event.target.value } : row))} />
              </Field>
              <Field label="Description">
                <textarea className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" value={promotion.description} placeholder="Explain the offer clearly without sexual or misleading language." onChange={(event) => setPromotions((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, description: event.target.value } : row))} />
              </Field>
              <button type="button" onClick={() => setPromotions((rows) => rows.filter((_, rowIndex) => rowIndex !== index))} className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600">
                <Trash2 className="h-4 w-4" /> Remove special
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button type="button" onClick={() => setPromotions((rows) => [...rows, { title: "", description: "" }])} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 font-semibold text-slate-800 hover:bg-slate-50">
            <Plus className="h-5 w-5" /> Add special
          </button>
          <button type="button" onClick={saveSpecials} disabled={savingSpecials} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800 disabled:opacity-50">
            {savingSpecials ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save specials
          </button>
        </div>
      </Panel>
    </div>
  );
}
