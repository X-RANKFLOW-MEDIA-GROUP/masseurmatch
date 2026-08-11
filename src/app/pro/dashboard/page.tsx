"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Car, Eye, EyeOff, Loader2, Plane, Settings, Zap } from "lucide-react";

import { postJson, requestJson } from "@/app/_lib/request";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type TravelEntry = { city?: string; state?: string; start_date?: string; end_date?: string };
type DashboardProfile = {
  id?: string;
  display_name?: string | null;
  full_name?: string | null;
  city?: string | null;
  subscription_tier?: string | null;
  available_now?: boolean | null;
  available_now_expires?: string | null;
  travel_schedule?: unknown;
  visibility_status?: string | null;
  is_active?: boolean | null;
};

function normalizeTravel(value: unknown): TravelEntry[] {
  return Array.isArray(value) ? (value.filter((item) => item && typeof item === "object") as TravelEntry[]) : [];
}

function isTravelCurrentOrUpcoming(trips: TravelEntry[]) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  return trips.some((trip) => Boolean(trip.city && trip.end_date && trip.end_date >= today));
}

function StatusCard({
  title,
  description,
  icon: Icon,
  active,
  children,
}: {
  title: string;
  description: string;
  icon: typeof Zap;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
          </div>
        </div>
        {typeof active === "boolean" ? (
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
            {active ? "ON" : "OFF"}
          </span>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function ProDashboardPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function refresh() {
    const growth = await requestJson<{ ok: boolean; profile: DashboardProfile }>("/api/pro/growth");
    setProfile(growth.profile);
  }

  useEffect(() => {
    refresh()
      .catch((error) => toast({ title: "Could not load dashboard", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const trips = useMemo(() => normalizeTravel(profile?.travel_schedule), [profile?.travel_schedule]);
  const traveling = isTravelCurrentOrUpcoming(trips);
  const availableNow = Boolean(
    profile?.available_now &&
      (!profile.available_now_expires || new Date(profile.available_now_expires).getTime() > Date.now()),
  );
  const visible = profile?.is_active !== false && profile?.visibility_status !== "hidden";
  const displayName = profile?.display_name || profile?.full_name || "Your profile";

  async function toggleAvailableNow() {
    setSaving("available");
    try {
      await postJson("/api/pro/available-now", { activate: !availableNow });
      await refresh();
      toast({ title: availableNow ? "Available Now turned off" : "Available Now activated" });
    } catch (error) {
      toast({ title: "Could not update Available Now", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  }

  async function toggleVisibility() {
    setSaving("visibility");
    try {
      await postJson("/api/pro/availability", { status: visible ? "hidden" : "available" });
      await refresh();
      toast({ title: visible ? "Profile hidden" : "Profile visible" });
    } catch (error) {
      toast({ title: "Could not update profile visibility", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <div className="flex min-h-[55vh] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 pb-28 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Provider dashboard</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900">{displayName}</h1>
          <p className="mt-1 text-sm text-slate-500">Visibility tools are independent. Turning one on no longer turns the others off.</p>
        </div>
        <Button asChild variant="outline"><Link href="/pro/listing"><Settings className="mr-2 h-4 w-4" />Edit listing</Link></Button>
      </header>

      {!visible ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Your profile is OFF and hidden from public discovery. Available Now, travel, and mobile settings remain saved but are not publicly discoverable until visibility is turned back on.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <StatusCard
          icon={Zap}
          title="Available Now"
          active={availableNow}
          description="Temporary live badge. This can be active at the same time as travel and mobile service."
        >
          <Button onClick={toggleAvailableNow} disabled={saving === "available"}>
            {saving === "available" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            {availableNow ? "Turn off live badge" : "Activate Available Now"}
          </Button>
        </StatusCard>

        <StatusCard
          icon={Plane}
          title="Traveling"
          active={traveling}
          description="Travel dates work independently and surface your profile in destination-city discovery."
        >
          <Button asChild variant="outline"><Link href="/pro/growth"><Plane className="mr-2 h-4 w-4" />Manage travel dates</Link></Button>
        </StatusCard>

        <StatusCard
          icon={Car}
          title="Mobile / Outcall"
          description="Configure outcall service and radius separately from Available Now and travel."
        >
          <Button asChild variant="outline"><Link href="/pro/listing"><Car className="mr-2 h-4 w-4" />Configure mobile service</Link></Button>
        </StatusCard>

        <StatusCard
          icon={visible ? Eye : EyeOff}
          title="Profile visibility"
          active={visible}
          description="This is the master switch. OFF is the only state that removes your profile from public discovery."
        >
          <Button variant={visible ? "outline" : "default"} onClick={toggleVisibility} disabled={saving === "visibility"}>
            {saving === "visibility" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : visible ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {visible ? "Turn profile OFF" : "Turn profile ON"}
          </Button>
        </StatusCard>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-base font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link href="/pro/listing">Profile & pricing</Link></Button>
          <Button asChild variant="outline"><Link href="/pro/growth">Travel & specials</Link></Button>
          <Button asChild variant="outline"><Link href="/pro/photos">Photos</Link></Button>
          <Button asChild variant="outline"><Link href="/pro/subscription">Subscription</Link></Button>
        </div>
      </section>
    </main>
  );
}
