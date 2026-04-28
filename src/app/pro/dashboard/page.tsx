"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Car,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Plane,
  Settings,
  ShieldCheck,
  UserCircle,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { requestJson } from "@/app/_lib/request";

const statusOptions = [
  { key: "available", label: "Available Now", icon: Zap, color: "emerald" },
  { key: "mobile", label: "Mobile", icon: Car, color: "indigo" },
  { key: "traveling", label: "Traveling", icon: Plane, color: "amber" },
  { key: "hidden", label: "Hidden", icon: EyeOff, color: "rose" },
] as const;

type AvailabilityStatus = (typeof statusOptions)[number]["key"];

const statusMessages: Record<AvailabilityStatus, string> = {
  available: "Your profile is visible at the top of local search results with the 'Available Now' badge.",
  mobile: "In-call / out-call mode is active. Edit your service radius on your profile.",
  traveling: "Set your destination city and travel dates to attract advance bookings.",
  hidden: "Invisible mode — your profile has been temporarily removed from search results.",
};

const colorMap: Record<string, { active: string; idle: string }> = {
  emerald: {
    active: "bg-emerald-500/10 border-emerald-500/50 text-emerald-400",
    idle: "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10",
  },
  indigo: {
    active: "bg-indigo-500/10 border-indigo-500/50 text-indigo-400",
    idle: "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10",
  },
  amber: {
    active: "bg-amber-500/10 border-amber-500/50 text-amber-400",
    idle: "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10",
  },
  rose: {
    active: "bg-rose-500/10 border-rose-500/50 text-rose-400",
    idle: "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10",
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

type ProfileData = {
  id: string;
  status: string;
  is_active: boolean | null;
  display_name: string | null;
  full_name: string;
  bio: string | null;
  city: string | null;
  state: string | null;
  specialties: string[] | null;
  incall_price: number | null;
  outcall_price: number | null;
};

function computeCompletion(profile: ProfileData | null): number {
  if (!profile) return 0;
  const checks = [
    Boolean(profile.display_name || profile.full_name),
    Boolean(profile.bio),
    Boolean(profile.city),
    Boolean(profile.specialties?.length),
    Boolean(profile.incall_price || profile.outcall_price),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function ProfileStatusBanner({ status }: { status: string }) {
  if (status === "active") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
        Your profile is <strong>live</strong> and visible to clients.
      </div>
    );
  }
  if (status === "pending_approval") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Clock className="h-4 w-4 shrink-0 text-amber-600" />
        Your profile is <strong>pending review</strong>. We'll notify you once it's approved.
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
        Your profile was <strong>not approved</strong>.{" "}
        <Link href="/signup/resubmit" className="underline font-semibold">
          Update and resubmit
        </Link>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <Clock className="h-4 w-4 shrink-0 text-slate-500" />
      Complete your profile to go live.{" "}
      <Link href="/signup/profile" className="underline font-semibold">
        Continue setup
      </Link>
    </div>
  );
}

export default function DashboardHome() {
  const { user, subscription } = useAuth();
  const [activeStatus, setActiveStatus] = useState<AvailabilityStatus>("available");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const displayName = (() => {
    const meta = (
      user as { user_metadata?: { full_name?: string; name?: string } } | null
    )?.user_metadata;
    const name = meta?.full_name || meta?.name || user?.email?.split("@")[0] || "Pro";
    return name.split(" ")[0].slice(0, 20);
  })();

  useEffect(() => {
    requestJson<{ ok: boolean; profile: ProfileData | null }>("/api/pro/profile")
      .then((data) => setProfile(data.profile))
      .catch(() => null)
      .finally(() => setProfileLoading(false));
  }, []);

  const completion = computeCompletion(profile);
  const profileStatus = profile?.status ?? "draft";

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 font-sans text-sm text-slate-500">
            Track your profile performance and manage availability.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/pro/listing"
            className="border border-slate-200 bg-white px-4 py-2 font-mono text-xs uppercase tracking-wider text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            Edit Profile
          </Link>
          <Link
            href="/pro/settings"
            className="border border-slate-200 bg-white px-4 py-2 font-mono text-xs uppercase tracking-wider text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Settings className="inline h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <ProfileStatusBanner status={profileStatus} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="relative overflow-hidden border border-slate-200/60 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600">
                <UserCircle className="relative h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-medium text-slate-900">
                  {displayName}
                </h2>
                <div className="mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Pro Member
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs">
                <span className="font-mono uppercase tracking-wider text-slate-500">
                  Profile Completion
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {profileLoading ? "…" : `${completion}%`}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden bg-slate-100">
                {!profileLoading && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completion}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-full bg-slate-900"
                  />
                )}
              </div>
              {!profileLoading && completion < 100 && (
                <p className="mt-2 text-[11px] text-slate-500">
                  <Link href="/pro/listing" className="text-indigo-600 underline">
                    Complete your profile
                  </Link>{" "}
                  to appear in more searches.
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1 }}
            className="border border-slate-800 bg-slate-950 p-6 text-white shadow-xl"
          >
            <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-slate-400">
              Availability
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => {
                const isActive = activeStatus === option.key;
                const colors = colorMap[option.color];

                return (
                  <button
                    key={option.key}
                    onClick={() => setActiveStatus(option.key)}
                    className={`flex flex-col items-center justify-center gap-2 border p-4 transition-all duration-300 ${
                      isActive ? colors.active : colors.idle
                    }`}
                  >
                    <option.icon className="h-6 w-6" />
                    <span className="font-sans text-xs font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 border border-white/10 bg-white/5 p-3 font-sans text-xs leading-relaxed text-slate-300">
              {statusMessages[activeStatus]}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: "Profile Views", icon: Eye, note: "Analytics coming soon" },
              { label: "Inquiries", icon: Zap, note: "Check Inquiries tab" },
              { label: "Avg. Rating", icon: ShieldCheck, note: "Reviews coming soon" },
            ].map((item) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-2 border border-slate-200/60 bg-white p-4 shadow-sm"
              >
                <item.icon className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="font-display text-lg font-medium text-slate-400">—</div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    {item.label}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400 italic">{item.note}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="border border-slate-200/60 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h3 className="font-sans font-semibold text-slate-900">Quick Links</h3>
            </div>
            <div className="grid grid-cols-1 gap-0 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              {[
                { href: "/pro/listing", label: "Edit Profile", desc: "Update bio, photos, and services" },
                { href: "/pro/photos", label: "Manage Photos", desc: "Upload and reorder gallery photos" },
                { href: "/pro/inquiries", label: "Inquiries", desc: "View messages from clients" },
                { href: "/pro/tickets", label: "Support Tickets", desc: "Open and track support requests" },
                { href: "/pro/travel-system", label: "Travel HTML", desc: "Paid tiers can embed travel tools" },
                { href: "/pro/subscription", label: "Subscription", desc: "View or upgrade your plan" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex flex-col gap-0.5 p-5 transition hover:bg-slate-50"
                >
                  <span className="font-sans text-sm font-semibold text-slate-800">{link.label}</span>
                  <span className="font-sans text-xs text-slate-500">{link.desc}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border border-slate-200/60 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-sans font-semibold text-slate-900">Ads Activation (Compact)</h3>
              <span className="text-xs text-slate-500">Pay instantly in Stripe</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { name: "Explore Boost", slug: "explore-boost", price: "$12" },
                { name: "City Spotlight", slug: "city-spotlight", price: "$29" },
                { name: "Geo Ads Campaign", slug: "geo-ads-campaign", price: "$15+" },
                { name: "Masseur of the Day", slug: "masseur-of-the-day", price: "$29/day" },
              ].map((ad) => (
                <Link
                  key={ad.slug}
                  href={`/pro/billing?addon=${encodeURIComponent(ad.slug)}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-700">{ad.name}</span>
                  <span className="font-mono text-xs text-slate-500">{ad.price}</span>
                </Link>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              No activation email is needed. Checkout opens directly and activates via Stripe.
            </p>
            {subscription.plan_key === "free" && (
              <p className="mt-2 text-xs text-amber-700">Tip: upgrade to unlock higher ad inventory and visibility.</p>
            )}
          </div>

          {profileStatus === "pending_approval" && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              <p className="font-semibold text-slate-800 mb-1">What happens next?</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Our team reviews your profile and photos — usually within 1–2 business days.</li>
                <li>You'll receive an email once approved.</li>
                <li>After approval your listing goes live and clients can find you in search.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
