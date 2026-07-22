"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Sparkles,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Gauge,
  Plane,
  Settings,
  ShieldCheck,
  UserCircle,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { normalizePlanKey } from "@/hooks/usePlanLimits";
import { requestJson, ApiError } from "@/app/_lib/request";
import { NotificationsWidget } from "@/components/dashboard/NotificationsWidget";

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
  traveling: "Set your destination city and travel dates to attract advance inquiries.",
  hidden: "Invisible mode — your profile has been temporarily removed from search results.",
};

// Sober, light-surface status palette: success green = available, brand red =
// mobile, ink = traveling, muted = hidden. No indigo/amber/rose.
const IDLE_STYLE = "bg-white border-[#E8E8E8] text-[#6F6F6F] hover:bg-[#F7F7F7]";
const colorMap: Record<string, { active: string; idle: string }> = {
  emerald: { active: "bg-[#EFF6F1] border-[#1E7A46]/40 text-[#1E7A46]", idle: IDLE_STYLE },
  indigo: { active: "bg-brand-secondary/[0.08] border-brand-secondary/40 text-brand-secondary", idle: IDLE_STYLE },
  amber: { active: "bg-[#F5F5F5] border-[#111111]/25 text-[#111111]", idle: IDLE_STYLE },
  rose: { active: "bg-[#F7F7F7] border-[#D9D9D9] text-[#8E8E8E]", idle: IDLE_STYLE },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

type ProfileData = {
  id: string;
  status: string;
  is_active: boolean | null;
  available_now: boolean | null;
  available_now_expires: string | null;
  display_name: string | null;
  full_name: string;
  bio: string | null;
  city: string | null;
  state: string | null;
  specialties: string[] | null;
  incall_price: number | null;
  outcall_price: number | null;
  subscription_tier: string | null;
  is_featured: boolean | null;
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

const TIER_PLACEMENT_BASE: Record<string, number> = {
  free: 25,
  standard: 45,
  pro: 60,
  elite: 70,
};

function isAvailableNowLive(profile: ProfileData | null): boolean {
  if (!profile?.available_now) return false;
  if (!profile.available_now_expires) return true;
  return new Date(profile.available_now_expires).getTime() > Date.now();
}

type PlacementScore = {
  score: number;
  grade: string;
  factors: { label: string; met: boolean; points: number }[];
};

function computePlacement(profile: ProfileData | null, completion: number): PlacementScore {
  const tier = (profile?.subscription_tier || "free").toLowerCase();
  const base = TIER_PLACEMENT_BASE[tier] ?? TIER_PLACEMENT_BASE.free;

  const factors = [
    { label: `Plan tier (${tier})`, met: true, points: base },
    { label: "Profile completeness", met: completion >= 80, points: Math.round((completion / 100) * 15) },
    { label: "Featured placement", met: Boolean(profile?.is_featured), points: profile?.is_featured ? 10 : 0 },
    { label: "Available Now active", met: isAvailableNowLive(profile), points: isAvailableNowLive(profile) ? 5 : 0 },
  ];

  const score = Math.min(100, factors.reduce((sum, f) => sum + f.points, 0));
  const grade =
    score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B+" : score >= 60 ? "B" : score >= 45 ? "C" : "D";

  return { score, grade, factors };
}

// Memoized profile completion card
const ProfileCard = memo(function ProfileCard({
  displayName,
  completion,
  profileLoading
}: {
  displayName: string;
  completion: number;
  profileLoading: boolean
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden border border-slate-200/60 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-brand-secondary to-[#6E1521]">
          <UserCircle className="relative h-10 w-10 text-white" />
        </div>
        <div>
          <h2 className="font-display text-xl font-medium text-slate-900">
            {displayName}
          </h2>
          <div className="mt-0.5 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#1E7A46]" />
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
            <Link href="/pro/listing" className="text-brand-secondary underline">
              Complete your profile
            </Link>{" "}
            to appear in more searches.
          </p>
        )}
      </div>
    </motion.div>
  );
});

// Memoized availability status card
const AvailabilityCard = memo(function AvailabilityCard({
  activeStatus,
  statusSaving,
  onStatusChange
}: {
  activeStatus: AvailabilityStatus;
  statusSaving: boolean;
  onStatusChange: (status: AvailabilityStatus) => void;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ delay: 0.1 }}
      className="border border-slate-200/60 bg-white p-6 text-slate-900 shadow-sm"
    >
      <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
        Availability
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {statusOptions.map((option) => {
          const isActive = activeStatus === option.key;
          const colors = colorMap[option.color];

          return (
            <button
              key={option.key}
              onClick={() => onStatusChange(option.key)}
              disabled={statusSaving}
              className={`flex flex-col items-center justify-center gap-2 border p-4 transition-all duration-300 disabled:opacity-60 ${
                isActive ? colors.active : colors.idle
              }`}
            >
              <option.icon className="h-6 w-6" />
              <span className="font-sans text-xs font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 border border-[#E8E8E8] bg-[#F7F7F7] p-3 font-sans text-xs leading-relaxed text-[#6F6F6F]">
        {statusMessages[activeStatus]}
      </div>
    </motion.div>
  );
});

const ProfileStatusBanner = memo(function ProfileStatusBanner({ status }: { status: string }) {
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
      <div className="flex items-center gap-2 rounded-lg border border-[#E8E8E8] bg-[#F7F7F7] px-4 py-3 text-sm text-[#6F6F6F]">
        <Clock className="h-4 w-4 shrink-0 text-brand-secondary" />
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
});

export default function DashboardHome() {
  const router = useRouter();
  const { user, subscription } = useAuth();
  const currentTier = normalizePlanKey(subscription?.plan_key) ?? (subscription?.subscribed ? "standard" : "free");
  const [activeStatus, setActiveStatus] = useState<AvailabilityStatus>("available");
  const [statusSaving, setStatusSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Memoize display name computation
  const displayName = useMemo(() => {
    const meta = (
      user as { user_metadata?: { full_name?: string; name?: string } } | null
    )?.user_metadata;
    const name = meta?.full_name || meta?.name || user?.email?.split("@")[0] || "Pro";
    return name.split(" ")[0].slice(0, 20);
  }, [user]);

  useEffect(() => {
    // Fetch only dashboard-needed fields for better performance
    requestJson<{ ok: boolean; profile: ProfileData | null }>("/api/pro/profile?dashboard=true")
      .then((data) => {
        setProfile(data.profile);
        // Reflect the general presence status (current_status / is_active), not
        // the paid "Available Now" badge, which is managed separately.
        const currentStatus = (data.profile as { current_status?: string } | null)?.current_status;
        if (currentStatus === "available" || currentStatus === "mobile" || currentStatus === "traveling") {
          setActiveStatus(currentStatus as AvailabilityStatus);
        } else if (data.profile?.is_active === false) {
          setActiveStatus("hidden");
        }
      })
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) {
          router.push("/login");
        } else {
          setProfile(null);
        }
      })
      .finally(() => setProfileLoading(false));
  }, [router]);

  // Memoize status change handler to prevent child re-renders
  const handleStatusChange = useCallback(async (status: AvailabilityStatus) => {
    setActiveStatus(status);
    setStatusSaving(true);
    try {
      await requestJson("/api/pro/availability", {
        method: "POST",
        body: JSON.stringify({ status }),
      });
    } catch {
      // status updated optimistically; API failure is non-fatal
    } finally {
      setStatusSaving(false);
    }
  }, []);

  // Memoize expensive computations
  const completion = useMemo(() => computeCompletion(profile), [profile]);
  const placement = useMemo(() => computePlacement(profile, completion), [profile, completion]);
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

      {!profileLoading && <ProfileStatusBanner status={profileStatus} />}

      <NotificationsWidget />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <ProfileCard
            displayName={displayName}
            completion={completion}
            profileLoading={profileLoading}
          />
          <AvailabilityCard
            activeStatus={activeStatus}
            statusSaving={statusSaving}
            onStatusChange={handleStatusChange}
          />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="overflow-hidden border border-slate-200/60 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-slate-500" strokeWidth={2.25} />
                <h3 className="font-sans font-semibold text-slate-900">Search Placement</h3>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Ranking diagnostics
              </span>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-[140px_1fr] sm:items-center">
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#111111] bg-[#111111] p-5 text-white">
                <span className="font-display text-4xl font-semibold">
                  {profileLoading ? "…" : placement.grade}
                </span>
                <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  {profileLoading ? "" : `${placement.score} / 100`}
                </span>
              </div>
              <ul className="space-y-2.5">
                {placement.factors.map((factor) => (
                  <li key={factor.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      {factor.met ? (
                        <Check className="h-4 w-4 text-[#1E7A46]" strokeWidth={2.5} />
                      ) : (
                        <X className="h-4 w-4 text-slate-300" strokeWidth={2.5} />
                      )}
                      {factor.label}
                    </span>
                    <span className="font-mono text-xs text-slate-500">+{factor.points}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3">
              <p className="text-xs text-slate-500">
                Raise your placement:{" "}
                <Link href="/pro/listing" className="font-medium text-brand-secondary underline">
                  complete your profile
                </Link>
                ,{" "}
                <Link href="/pro/growth" className="font-medium text-brand-secondary underline">
                  go live with Available Now
                </Link>
                , or{" "}
                <Link href="/pro/subscription" className="font-medium text-brand-secondary underline">
                  upgrade your plan
                </Link>
                .
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: "Profile Views", icon: Eye, note: "We start tracking views the day your listing goes live. Check back soon for your first insights." },
              { label: "Inquiries", icon: Zap, note: "Check Inquiries tab" },
              { label: "Avg. Rating", icon: ShieldCheck, note: "No reviews yet. Reviews will appear here as clients leave feedback." },
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
                  <div className="font-display text-lg font-medium text-slate-400">&mdash;</div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    {item.label}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400">{item.note}</div>
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
                { href: "/pro/growth", label: "Growth Tools", desc: "Available Now, travel, and specials" },
                { href: "/pro/photos", label: "Manage Photos", desc: "Upload and reorder gallery photos" },
                { href: "/pro/inquiries", label: "Inquiries", desc: "View messages from clients" },
                { href: "/pro/analytics", label: "Analytics", desc: "See your visitor trends" },
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

          {/* Knotty AI teaser — only shown for non-Elite plans */}
          {currentTier !== "elite" && (
            <div className="rounded-xl border border-white/10 bg-[#111111] p-5 text-white">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C4344A]/15">
                  <Sparkles className="h-4 w-4 text-[#C4344A]" strokeWidth={2.25} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Knotty AI — available on Elite</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">
                    Elite profiles get a Knotty AI chat widget that answers client questions 24/7
                    directly on your listing — rates, availability, specialties, and more —
                    without you lifting a finger.
                  </p>
                  <Link
                    href="/pro/billing?upgrade=elite"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#C4344A] hover:text-white"
                  >
                    Upgrade to Elite
                    <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            </div>
          )}

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
