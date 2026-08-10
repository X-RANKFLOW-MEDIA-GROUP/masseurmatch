"use client";

import { useEffect, useState } from "react";
import { BadgePercent, Loader2, Plane, Plus, Save, Trash2, Zap } from "lucide-react";

import { postJson, requestJson } from "@/app/_lib/request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { US_CITIES, formatCityLabel } from "@/data/cities";

type TravelEntry = { city: string; state: string; start_date: string; end_date: string };
type Promotion = { title: string; description: string };
type GrowthProfile = {
  subscription_tier: string | null;
  available_now: boolean | null;
  available_now_expires: string | null;
  travel_schedule: unknown;
  promotions: unknown;
};

const TIER_HOURS: Record<string, number | null> = { free: null, standard: 1, pro: 2, elite: 3 };

function normalizeTravel(value: unknown): TravelEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      city: typeof item.city === "string" ? item.city : "",
      state: typeof item.state === "string" ? item.state : "",
      start_date: typeof item.start_date === "string" ? item.start_date : "",
      end_date: typeof item.end_date === "string" ? item.end_date : "",
    }))
    .filter((item) => item.city);
}

function normalizePromotions(value: unknown): Promotion[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      description: typeof item.description === "string" ? item.description : "",
    }))
    .filter((item) => item.title || item.description);
}

function Panel({ icon: Icon, title, subtitle, children }: { icon: typeof Plane; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white"><Icon className="h-4 w-4" /></div>
        <div><h2 className="font-display text-base font-semibold text-slate-900">{title}</h2><p className="text-xs text-slate-500">{subtitle}</p></div>
      </header>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}

export default function GrowthPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState("free");
  const [availableNow, setAvailableNow] = useState(false);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [travel, setTravel] = useState<TravelEntry[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [savingTravel, setSavingTravel] = useState(false);
  const [savingPromotions, setSavingPromotions] = useState(false);

  useEffect(() => {
    requestJson<{ ok: boolean; profile: GrowthProfile }>("/api/pro/growth")
      .then(({ profile }) => {
        setTier((profile.subscription_tier || "free").toLowerCase());
        setAvailableNow(Boolean(profile.available_now && (!profile.available_now_expires || new Date(profile.available_now_expires) > new Date())));
        setTravel(normalizeTravel(profile.travel_schedule));
        setPromotions(normalizePromotions(profile.promotions));
      })
      .catch((error) => toast({ title: "Could not load growth tools", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  async function toggleAvailable() {
    const hours = TIER_HOURS[tier] ?? null;
    if (hours === null && !availableNow) {
      toast({ title: "Available Now requires a paid plan", description: "Standard, Pro, or Elite is required.", variant: "destructive" });
      return;
    }
    setAvailableLoading(true);
    try {
      const response = await postJson<{ available_now: boolean }>("/api/pro/available-now", { activate: !availableNow });
      setAvailableNow(response.available_now);
      toast({ title: response.available_now ? "Available Now is active" : "Available Now is off", description: response.available_now ? `Your live badge is active for ${hours} hour${hours === 1 ? "" : "s"}.` : "The live badge was removed." });
    } catch (error) {
      toast({ title: "Could not update availability", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" });
    } finally {
      setAvailableLoading(false);
    }
  }

  async function saveTravel() {
    const cleaned = travel.map((trip) => ({ ...trip, city: trip.city.trim(), state: trip.state.trim().toUpperCase() }));
    if (cleaned.some((trip) => !trip.city || !trip.start_date || !trip.end_date)) {
      toast({ title: "Complete every trip", description: "Destination, arrival date, and departure date are required.", variant: "destructive" });
      return;
    }
    if (cleaned.some((trip) => trip.end_date < trip.start_date)) {
      toast({ title: "Check travel dates", description: "Departure cannot be before arrival.", variant: "destructive" });
      return;
    }
    setSavingTravel(true);
    try {
      await postJson("/api/pro/growth", { travel_schedule: cleaned });
      setTravel(cleaned);
      toast({ title: "Travel schedule saved", description: "Your profile is now refreshed for each destination city and its discovery pages." });
    } catch (error) {
      toast({ title: "Could not save travel", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" });
    } finally {
      setSavingTravel(false);
    }
  }

  async function savePromotions() {
    setSavingPromotions(true);
    try {
      const cleaned = promotions.map((item) => ({ title: item.title.trim(), description: item.description.trim() })).filter((item) => item.title && item.description);
      await postJson("/api/pro/growth", { promotions: cleaned });
      setPromotions(cleaned);
      toast({ title: "Specials saved" });
    } catch (error) {
      toast({ title: "Could not save specials", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" });
    } finally {
      setSavingPromotions(false);
    }
  }

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 pb-32 md:p-8">
      <header><h1 className="font-display text-2xl font-semibold text-slate-900">Visibility & Travel</h1><p className="mt-1 text-sm text-slate-500">Manage live availability, destination visibility, and specials independently.</p></header>

      <Panel icon={Zap} title="Available Now" subtitle="Independent live badge; it does not disable your travel or mobile settings">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-semibold text-slate-900">{availableNow ? "Live now" : "Not live"}</p><p className="mt-1 text-xs text-slate-500">{TIER_HOURS[tier] ? `${tier} plan: ${TIER_HOURS[tier]} hour live window.` : "Upgrade to activate the live badge."}</p></div>
          <Button onClick={toggleAvailable} disabled={availableLoading}>{availableLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}{availableNow ? "Turn off" : "Go live"}</Button>
        </div>
      </Panel>

      <Panel icon={Plane} title="Travel Schedule" subtitle="Your profile appears in destination discovery during the active/upcoming travel window">
        <div className="space-y-4">
          {travel.map((entry, index) => (
            <div key={`travel-${index}`} className="rounded-xl border border-slate-200 p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5"><Label htmlFor={`city-${index}`}>Destination city</Label><Input id={`city-${index}`} list={`cities-${index}`} value={entry.city} placeholder="Miami" onChange={(e) => {
                  const raw = e.target.value;
                  const match = US_CITIES.find((city) => formatCityLabel(city.name, city.stateCode) === raw);
                  setTravel((rows) => rows.map((row, i) => i === index ? { ...row, city: match ? match.name : raw, state: match ? match.stateCode : row.state } : row));
                }} /><datalist id={`cities-${index}`}>{US_CITIES.slice(0, 200).map((city) => <option key={`${city.slug}-${city.stateCode}`} value={formatCityLabel(city.name, city.stateCode)} />)}</datalist></div>
                <div className="space-y-1.5"><Label htmlFor={`state-${index}`}>State</Label><Input id={`state-${index}`} value={entry.state} maxLength={2} placeholder="FL" onChange={(e) => setTravel((rows) => rows.map((row, i) => i === index ? { ...row, state: e.target.value.toUpperCase() } : row))} /></div>
                <div className="space-y-1.5"><Label htmlFor={`arrival-${index}`}>Arrival date</Label><Input id={`arrival-${index}`} type="date" value={entry.start_date} onChange={(e) => setTravel((rows) => rows.map((row, i) => i === index ? { ...row, start_date: e.target.value } : row))} /></div>
                <div className="space-y-1.5"><Label htmlFor={`departure-${index}`}>Departure date</Label><Input id={`departure-${index}`} type="date" min={entry.start_date || undefined} value={entry.end_date} onChange={(e) => setTravel((rows) => rows.map((row, i) => i === index ? { ...row, end_date: e.target.value } : row))} /></div>
              </div>
              <button type="button" className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-rose-600" onClick={() => setTravel((rows) => rows.filter((_, i) => i !== index))}><Trash2 className="h-3.5 w-3.5" /> Remove trip</button>
            </div>
          ))}
          {travel.length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">No travel dates yet.</p> : null}
        </div>
        <div className="flex flex-wrap justify-between gap-3"><Button variant="outline" onClick={() => setTravel((rows) => [...rows, { city: "", state: "", start_date: "", end_date: "" }])}><Plus className="mr-2 h-4 w-4" />Add destination</Button><Button onClick={saveTravel} disabled={savingTravel}>{savingTravel ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save travel</Button></div>
      </Panel>

      <Panel icon={BadgePercent} title="Weekly Specials" subtitle="Optional promotion copy shown on your public listing">
        <div className="space-y-3">{promotions.map((item, index) => <div key={`promo-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_1.5fr_auto]"><Input value={item.title} placeholder="Offer title" onChange={(e) => setPromotions((rows) => rows.map((row, i) => i === index ? { ...row, title: e.target.value } : row))} /><Input value={item.description} placeholder="Offer details" onChange={(e) => setPromotions((rows) => rows.map((row, i) => i === index ? { ...row, description: e.target.value } : row))} /><Button variant="ghost" size="icon" onClick={() => setPromotions((rows) => rows.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button></div>)}</div>
        <div className="flex flex-wrap justify-between gap-3"><Button variant="outline" onClick={() => setPromotions((rows) => [...rows, { title: "", description: "" }])}><Plus className="mr-2 h-4 w-4" />Add special</Button><Button onClick={savePromotions} disabled={savingPromotions}>{savingPromotions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save specials</Button></div>
      </Panel>
    </main>
  );
}
