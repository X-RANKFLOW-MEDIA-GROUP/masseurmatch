"use client";

import { useEffect, useMemo, useState } from "react";
import { DollarSign, Loader2, Plus, Save, Trash2 } from "lucide-react";

import { ApiError, postJson, requestJson } from "@/app/_lib/request";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  isRateWithinLimit,
  MAX_RATE_PER_MINUTE,
  maximumRateForMinutes,
} from "@/lib/provider-product-rules";

type PricingMode = "simple" | "technique" | "ask_me";

type RateRow = {
  id: string;
  mode: PricingMode;
  technique: string;
  minutes: number;
  incall_rate: number | null;
  outcall_rate: number | null;
  incall_ask_me: boolean;
  outcall_ask_me: boolean;
};

type RatesResponse = {
  ok: boolean;
  profile: {
    id: string;
    pricing_sessions: unknown;
    incall_price: number | null;
    outcall_price: number | null;
  };
};

const TECHNIQUES = [
  "Deep Tissue", "Swedish", "Sports Massage", "Relaxation Massage", "Thai Massage",
  "Hot Stone", "Lymphatic Drainage", "Myofascial Release", "Trigger Point",
  "Reflexology", "Prenatal", "Stretch Therapy", "Aromatherapy", "Other",
];

function createRow(mode: PricingMode): RateRow {
  return {
    id: `rate-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    mode,
    technique: "",
    minutes: 60,
    incall_rate: null,
    outcall_rate: null,
    incall_ask_me: mode === "ask_me",
    outcall_ask_me: mode === "ask_me",
  };
}

function parseRows(value: unknown): RateRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item, index) => ({
      id: typeof item.id === "string" ? item.id : `rate-${index + 1}`,
      mode: item.mode === "technique" || item.mode === "ask_me" ? item.mode : "simple",
      technique: typeof item.technique === "string" ? item.technique : "",
      minutes: typeof item.minutes === "number"
        ? item.minutes
        : typeof item.duration === "number"
          ? item.duration
          : 60,
      incall_rate: typeof item.incall_rate === "number"
        ? item.incall_rate
        : typeof item.incall === "number"
          ? item.incall
          : null,
      outcall_rate: typeof item.outcall_rate === "number"
        ? item.outcall_rate
        : typeof item.outcall === "number"
          ? item.outcall
          : null,
      incall_ask_me: item.incall_ask_me === true,
      outcall_ask_me: item.outcall_ask_me === true,
    }));
}

function fieldClass(invalid = false) {
  return `h-12 w-full rounded-xl border bg-white px-4 text-base text-slate-950 outline-none transition focus:ring-2 ${
    invalid
      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
      : "border-slate-300 focus:border-primary focus:ring-primary/10"
  }`;
}

function MoneyField({
  label,
  minutes,
  value,
  askMe,
  onValue,
  onAskMe,
}: {
  label: string;
  minutes: number;
  value: number | null;
  askMe: boolean;
  onValue: (value: number | null) => void;
  onAskMe: (value: boolean) => void;
}) {
  const invalid = !askMe && value !== null && !isRateWithinLimit(minutes, value);
  const maximum = maximumRateForMinutes(minutes);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Checkbox checked={askMe} onCheckedChange={(checked) => onAskMe(checked === true)} />
          Ask Me
        </label>
      </div>
      <div className="relative">
        <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
        <input
          type="number"
          min="0"
          step="1"
          disabled={askMe}
          className={`${fieldClass(invalid)} pl-10 disabled:bg-slate-100 disabled:text-slate-500`}
          value={askMe ? "" : value ?? ""}
          onChange={(event) => onValue(event.target.value === "" ? null : Number(event.target.value))}
          placeholder={askMe ? "Ask Me" : "Enter amount"}
        />
      </div>
      <p className={`text-xs leading-5 ${invalid ? "font-semibold text-rose-700" : "text-slate-500"}`}>
        {invalid
          ? `Above the US$${MAX_RATE_PER_MINUTE.toFixed(2)}/minute limit. Maximum: US$${maximum.toFixed(2)}, or select Ask Me.`
          : askMe
            ? "Clients will contact you for the rate."
            : `Maximum numeric price for ${minutes || 0} minutes: US$${maximum.toFixed(2)}.`}
      </p>
    </div>
  );
}

export default function ProviderRatesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<PricingMode>("simple");
  const [rows, setRows] = useState<RateRow[]>([createRow("simple")]);

  useEffect(() => {
    requestJson<RatesResponse>("/api/pro/rates")
      .then((response) => {
        const parsed = parseRows(response.profile.pricing_sessions);
        if (parsed.length) {
          setRows(parsed);
          setMode(parsed[0].mode);
          return;
        }

        const fallback = createRow("simple");
        fallback.incall_rate = response.profile.incall_price;
        fallback.outcall_rate = response.profile.outcall_price;
        setRows([fallback]);
      })
      .catch((error) => {
        toast({
          title: "Could not load rates",
          description: error instanceof Error ? error.message : "Reload the page and try again.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const hasInvalidRows = useMemo(() => rows.some((row) => {
    if (!Number.isFinite(row.minutes) || row.minutes <= 0) return true;
    if (mode === "technique" && !row.technique.trim()) return true;
    if (!row.incall_ask_me && (row.incall_rate === null || !isRateWithinLimit(row.minutes, row.incall_rate))) return true;
    if (!row.outcall_ask_me && (row.outcall_rate === null || !isRateWithinLimit(row.minutes, row.outcall_rate))) return true;
    return false;
  }), [mode, rows]);

  function changeMode(nextMode: PricingMode) {
    setMode(nextMode);
    if (nextMode === "ask_me") {
      setRows([createRow("ask_me")]);
      return;
    }
    setRows((current) => (current.length ? current : [createRow(nextMode)]).map((row) => ({
      ...row,
      mode: nextMode,
      technique: nextMode === "technique" ? row.technique : "",
      incall_ask_me: false,
      outcall_ask_me: false,
    })));
  }

  function updateRow(id: string, patch: Partial<RateRow>) {
    setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  }

  async function saveRates() {
    if (hasInvalidRows && mode !== "ask_me") {
      toast({
        title: "Review your rates",
        description: "Complete every row and correct prices above US$3.33 per minute.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await postJson<RatesResponse>("/api/pro/rates", {
        mode,
        sessions: rows.map((row) => ({ ...row, mode })),
      });
      const saved = parseRows(response.profile.pricing_sessions);
      if (saved.length) setRows(saved);
      toast({ title: "Rates saved", description: "Your public profile pricing has been updated." });
    } catch (error) {
      toast({
        title: "Could not save rates",
        description: error instanceof ApiError || error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-[55vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 pb-32 sm:p-6 md:p-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Profile</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-950">Rates</h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
          Choose the structure that represents your practice. Minutes and prices are flexible. Numeric prices may not exceed US$3.33 per minute.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Rate format</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {([
            ["simple", "One Simple Rate", "Use when sessions combine techniques and pricing is based on total time."],
            ["technique", "Rates by Technique", "Use when each massage technique has its own pricing."],
            ["ask_me", "Ask Me", "Publish no numeric price and ask clients to contact you."],
          ] as const).map(([value, title, description]) => (
            <button
              key={value}
              type="button"
              onClick={() => changeMode(value)}
              className={`rounded-2xl border p-4 text-left transition ${
                mode === value
                  ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                  : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <p className="font-bold text-slate-950">{title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
            </button>
          ))}
        </div>
      </section>

      {mode === "ask_me" ? (
        <section className="rounded-3xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="text-xl font-bold text-slate-950">Public display: Ask Me</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Incall and Outcall will both display “Ask Me.” Clients must contact you directly for a quote.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          {rows.map((row, index) => (
            <div key={row.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Rate {index + 1}</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-950">
                    {mode === "technique" ? row.technique || "Choose technique" : `${row.minutes || 0}-minute session`}
                  </h2>
                </div>
                {rows.length > 1 && (
                  <button type="button" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))} className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50" aria-label="Remove rate">
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {mode === "technique" && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">Technique</label>
                    <select className={fieldClass(!row.technique.trim())} value={row.technique} onChange={(event) => updateRow(row.id, { technique: event.target.value })}>
                      <option value="">Select technique</option>
                      {TECHNIQUES.map((technique) => <option key={technique} value={technique}>{technique}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Minutes</label>
                  <input type="number" min="1" max="600" className={fieldClass(row.minutes <= 0)} value={row.minutes || ""} onChange={(event) => updateRow(row.id, { minutes: Number(event.target.value) || 0 })} placeholder="60" />
                  <p className="text-xs text-slate-500">Enter any session duration.</p>
                </div>

                <MoneyField
                  label="Incall"
                  minutes={row.minutes}
                  value={row.incall_rate}
                  askMe={row.incall_ask_me}
                  onValue={(value) => updateRow(row.id, { incall_rate: value })}
                  onAskMe={(value) => updateRow(row.id, { incall_ask_me: value, ...(value ? { incall_rate: null } : {}) })}
                />

                <MoneyField
                  label="Outcall"
                  minutes={row.minutes}
                  value={row.outcall_rate}
                  askMe={row.outcall_ask_me}
                  onValue={(value) => updateRow(row.id, { outcall_rate: value })}
                  onAskMe={(value) => updateRow(row.id, { outcall_ask_me: value, ...(value ? { outcall_rate: null } : {}) })}
                />
              </div>
            </div>
          ))}

          <button type="button" onClick={() => setRows((current) => [...current, createRow(mode)])} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-400 bg-white px-5 font-semibold text-slate-800 hover:border-primary hover:text-primary">
            <Plus className="h-5 w-5" /> Add another {mode === "technique" ? "technique" : "session length"}
          </button>
        </section>
      )}

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button type="button" onClick={saveRates} disabled={saving || (mode !== "ask_me" && hasInvalidRows)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-7 font-bold text-white shadow-xl hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Save rates
        </button>
      </div>
    </div>
  );
}
