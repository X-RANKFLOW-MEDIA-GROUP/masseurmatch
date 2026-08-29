"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageCircle, ShieldCheck, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PreferencesResponse = {
  preferences?: {
    imessage_profile_assistant_enabled?: boolean;
    phone_e164?: string | null;
  };
  migrationPending?: boolean;
  error?: string;
};

export function KnottyImessageOptInCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [phone, setPhone] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadPreferences = async () => {
      try {
        const response = await fetch("/api/notifications/preferences", { cache: "no-store" });
        const body = (await response.json().catch(() => null)) as PreferencesResponse | null;
        if (!response.ok) throw new Error(body?.error || "Could not load iMessage preferences.");
        if (!active) return;

        setEnabled(Boolean(body?.preferences?.imessage_profile_assistant_enabled));
        setPhone(body?.preferences?.phone_e164 ?? "");
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Could not load iMessage preferences.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadPreferences();
    return () => {
      active = false;
    };
  }, []);

  const savePreference = async (nextEnabled: boolean) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imessageProfileAssistantEnabled: nextEnabled,
          phoneE164: phone || null,
        }),
      });
      const body = (await response.json().catch(() => null)) as PreferencesResponse | null;

      if (!response.ok) {
        throw new Error(body?.error || "Could not update iMessage preferences.");
      }
      if (body?.migrationPending) {
        throw new Error("Knotty via iMessage is not ready in this environment yet.");
      }

      setEnabled(Boolean(body?.preferences?.imessage_profile_assistant_enabled));
      setPhone(body?.preferences?.phone_e164 ?? phone);
      setConsentChecked(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update iMessage preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Knotty iMessage assistant">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading Knotty iMessage settings…
        </div>
      </section>
    );
  }

  if (enabled) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm" aria-label="Knotty iMessage assistant enabled">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Knotty via iMessage</p>
              <h2 className="mt-1 font-display text-lg font-semibold text-emerald-950">Profile assistance is enabled</h2>
              <p className="mt-1 text-sm leading-6 text-emerald-800">
                Knotty can guide you through profile updates by iMessage. Secure sign in is always required before profile changes are saved.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/pro/settings">Manage settings</Link>
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => void savePreference(false)}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Turn off
            </Button>
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#E7D5D7] bg-gradient-to-r from-[#FFF8F6] via-white to-[#FFF8EF] p-5 shadow-sm" aria-label="Enable Knotty Profile Assistant via iMessage">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:items-start">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8B1E2D] text-white shadow-sm">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B1E2D]">Optional profile help</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-slate-950">Finish your profile with Knotty on iMessage</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Get guided help one field at a time when your provider profile needs attention. Knotty will never ask for your password in iMessage.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Secure sign in before writes</span>
              <span className="inline-flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" /> Reply STOP anytime</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label htmlFor="knotty-imessage-phone" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Mobile phone
          </label>
          <Input
            id="knotty-imessage-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+15551234567"
            className="mt-2"
            autoComplete="tel"
          />

          <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs leading-5 text-slate-600">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(event) => setConsentChecked(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300"
            />
            <span>
              I agree to receive iMessages from Knotty about my MasseurMatch provider profile. Secure sign in is required before Knotty can save profile changes. Reply STOP anytime.
            </span>
          </label>

          {error ? <p className="mt-3 text-xs leading-5 text-red-700">{error}</p> : null}

          <Button
            type="button"
            className="mt-4 w-full bg-[#8B1E2D] hover:bg-[#741824]"
            disabled={saving || !consentChecked || !phone.trim()}
            onClick={() => void savePreference(true)}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}
            Enable Knotty via iMessage
          </Button>
          <p className="mt-2 text-center text-[11px] leading-4 text-slate-400">
            This permission is separate from SMS and marketing notifications.
          </p>
        </div>
      </div>
    </section>
  );
}
