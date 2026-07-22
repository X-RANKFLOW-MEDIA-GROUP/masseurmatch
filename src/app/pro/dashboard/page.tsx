"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Banknote,
  BarChart3,
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  TrendingUp,
  UserCircle,
  Zap,
} from "lucide-react";

import { ApiError, postJson, requestJson } from "@/app/_lib/request";
import { NotificationsWidget } from "@/components/dashboard/NotificationsWidget";
import { useAuth } from "@/contexts/AuthContext";
import {
  AVAILABLE_NOW_RULES,
  formatDuration,
  normalizeProviderTier,
  type ProviderTier,
} from "@/lib/provider-product-rules";

type ProfileData = {
  id: string;
  status: string | null;
  profile_status: string | null;
  visibility_status: string | null;
  verification_status: string | null;
  is_verified_identity: boolean | null;
  is_active: boolean | null;
  available_now: boolean | null;
  available_now_expires: string | null;
  display_name: string | null;
  full_name: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  specialties: string[] | null;
  massage_techniques: string[] | null;
  languages: string[] | null;
  pricing_sessions: unknown;
  incall_price: number | null;
  outcall_price: number | null;
  subscription_tier: string | null;
  _tier: string | null;
  slug: string | null;
};

type ProfileResponse = { ok: boolean; profile: ProfileData | null };
type AvailableResponse = {
  ok: boolean;
  available_now: boolean;
  expires_at?: string;
  cooldown_until?: string | null;
  duration_minutes?: number;
};

function formatCountdown(expiresAt: string | null, now: number) {
  if (!expiresAt) return null;
  const remaining = new Date(expiresAt).getTime() - now;
  if (!Number.isFinite(remaining) || remaining <= 0) return null;
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const target = new Date(expiresAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${hours ? `${hours}h ` : ""}${minutes}m left · until ${target}`;
}

function hasPricing(value: unknown, incall: number | null, outcall: number | null) {
  return (Array.isArray(value) && value.length > 0) || incall !== null || outcall !== null;
}

function computeCompletion(profile: ProfileData | null) {
  if (!profile) return 0;
  const checks = [
    Boolean(profile.display_name || profile.full_name),
    Boolean(profile.bio?.trim()),
    Boolean(profile.city?.trim()),
    Boolean(profile.state?.trim()),
    Boolean(profile.specialties?.length || profile.massage_techniques?.length),
    Boolean(profile.languages?.length),
    hasPricing(profile.pricing_sessions, profile.incall_price, profile.outcall_price),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function StatusBanner({ profile }: { profile: ProfileData }) {
  const verified = Boolean(profile.is_verified_identity) || profile.verification_status === "verified";
  const live = profile.visibility_status === "public" && (profile.profile_status === "approved" || profile.status === "approved" || profile.status === "active");

  if (!verified) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="font-bold">Identity verification pending</p>
            <p className="mt-1 text-sm leading-6">
              You can use the dashboard and finish every part of your profile now. Your listing stays private until Stripe Identity is approved.
            </p>
            <Link href="/signup/verify" className="mt-2 inline-flex text-sm font-bold underline">Complete ID verification</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!live) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
        <div className="flex items-start gap-3">
          <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          <div>
            <p className="font-bold">Identity verified — finish plan setup</p>
            <p className="mt-1 text-sm leading-6">Your identity is approved. Review your plan and payment settings to complete publication.</p>
            <Link href="/pro/subscription?identity=verified" className="mt-2 inline-flex text-sm font-bold underline">Continue to plan and payment</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
        <div>
          <p className="font-bold">Your profile is public</p>
          <p className="mt-1 text-sm">Clients can find your listing in search and city discovery pages.</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    requestJson<ProfileResponse>("/api/pro/profile")
      .then((response) => setProfile(response.profile))
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) router.replace("/login?redirect=%2Fpro%2Fdashboard");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const displayName = useMemo(() => {
    const metadata = user?.user_metadata as { full_name?: string; name?: string } | undefined;
    return profile?.display_name || profile?.full_name || metadata?.full_name || metadata?.name || user?.email?.split("@")[0] || "Provider";
  }, [profile?.display_name, profile?.full_name, user]);

  const tier: ProviderTier = normalizeProviderTier(profile?.subscription_tier || profile?._tier);
  const availableRule = AVAILABLE_NOW_RULES[tier];
  const countdown = formatCountdown(profile?.available_now_expires || null, now);
  const isAvailableLive = Boolean(profile?.available_now) && Boolean(countdown);
  const isCooldown = !profile?.available_now && Boolean(countdown);
  const completion = computeCompletion(profile);

  async function toggleAvailableNow() {
    if (!profile || isCooldown) return;
    setAvailabilitySaving(true);
    try {
      const response = await postJson<AvailableResponse>("/api/pro/available-now", { activate: !isAvailableLive });
      setProfile((current) => current ? {
        ...current,
        available_now: response.available_now,
        available_now_expires: response.available_now
          ? response.expires_at || null
          : response.cooldown_until || current.available_now_expires,
      } : current);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not update Available Now.");
    } finally {
      setAvailabilitySaving(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>;
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl p-6 md:p-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
          <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5" /><div><p className="font-bold">Profile could not be loaded</p><p className="mt-1 text-sm">Return to profile setup or contact support.</p></div></div>
        </div>
      </div>
    );
  }

  const quickLinks = [
    { href: "/pro/listing", label: "Edit Profile", description: "Bio, location, services, schedule, and credentials", icon: UserCircle },
    { href: "/pro/rates", label: "Manage Rates", description: "Simple rates, technique rates, and Ask Me", icon: Banknote },
    { href: "/pro/photos", label: "Manage Photos", description: "Primary photo, gallery, and photo review", icon: Camera },
    { href: "/pro/growth", label: "Growth Tools", description: "Available Now, travel schedule, and specials", icon: TrendingUp },
    { href: "/pro/dashboard/market-intelligence", label: "Market Intelligence", description: "Search demand, keywords, locations, and timing", icon: Search },
    { href: "/pro/analytics", label: "Analytics", description: "Profile visibility and discovery performance", icon: BarChart3 },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 pb-32 sm:p-6 md:p-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Provider Dashboard</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-950">Welcome, {displayName.split(" ")[0]}</h1>
          <p className="mt-2 text-base text-slate-600">Complete your profile, manage visibility, and prepare your listing for publication.</p>
        </div>
        <Link href="/pro/profile" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 font-semibold text-slate-800 shadow-sm hover:bg-slate-50">
          <Eye className="h-4 w-4" /> Preview Profile
        </Link>
      </header>

      <StatusBanner profile={profile} />
      <NotificationsWidget />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white"><UserCircle className="h-8 w-8" /></div>
            <div><h2 className="text-xl font-bold text-slate-950">{displayName}</h2><p className="text-sm capitalize text-slate-500">{tier} plan</p></div>
          </div>
          <div className="mt-6 flex items-center justify-between text-sm"><span className="font-semibold text-slate-700">Profile completion</span><span className="font-bold text-slate-950">{completion}%</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} /></div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{completion === 100 ? "Your main profile sections are complete." : "Continue editing to strengthen public discovery and trust."}</p>
          <Link href="/pro/listing" className="mt-4 inline-flex text-sm font-bold text-primary underline">Complete profile</Link>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl lg:col-span-2">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4717E]">Available Now</p>
              <h2 className="mt-2 text-2xl font-bold">
                {isAvailableLive ? "Your live badge is active" : isCooldown ? "Waiting period active" : "Go live when you are ready"}
              </h2>
              <p className={`mt-2 text-sm leading-6 ${isAvailableLive ? "text-emerald-300" : isCooldown ? "text-amber-300" : "text-slate-300"}`}>
                {countdown || `${tier[0].toUpperCase()}${tier.slice(1)} includes ${formatDuration(availableRule.durationMinutes)} per activation.`}
              </p>
            </div>
            <button type="button" onClick={toggleAvailableNow} disabled={availabilitySaving || isCooldown} className={`inline-flex min-h-12 min-w-44 items-center justify-center gap-2 rounded-xl px-6 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${isAvailableLive ? "bg-white/10 hover:bg-white/15" : "bg-emerald-500 hover:bg-emerald-600"}`}>
              {availabilitySaving ? <Loader2 className="h-5 w-5 animate-spin" /> : isCooldown ? <Clock className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
              {isAvailableLive ? "Turn off" : isCooldown ? "Wait for timer" : "Go live now"}
            </button>
          </div>
          <div className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400">Turning it off early does not reset the timer. The remaining time becomes a cooldown before you can activate again.</div>
        </section>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-slate-500" /><h2 className="text-xl font-bold text-slate-950">Manage your profile</h2></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
              <item.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-bold text-slate-950 group-hover:text-primary">{item.label}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <h2 className="font-bold text-slate-950">Publication checklist</h2>
            <ul className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <li className="flex items-center gap-2 text-slate-700">{profile.is_verified_identity ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-amber-600" />} Identity verification</li>
              <li className="flex items-center gap-2 text-slate-700">{completion >= 80 ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-amber-600" />} Profile at least 80% complete</li>
              <li className="flex items-center gap-2 text-slate-700">{hasPricing(profile.pricing_sessions, profile.incall_price, profile.outcall_price) ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-amber-600" />} Rates or Ask Me configured</li>
              <li className="flex items-center gap-2 text-slate-700">{profile.visibility_status === "public" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-amber-600" />} Public visibility enabled</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
