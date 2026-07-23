"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  Camera,
  Check,
  ChevronRight,
  CircleDollarSign,
  Eye,
  Gauge,
  Heart,
  Image as ImageIcon,
  Languages,
  Loader2,
  MapPin,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserRoundCheck,
  WandSparkles,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { requestJson } from "@/app/_lib/request";
import { BRAND_ASSETS } from "@/lib/brand";

type Impact = "high" | "medium" | "low";
type TabKey = "overview" | "photos" | "writer" | "market" | "reports";

type Recommendation = {
  key: string;
  title: string;
  reason: string;
  action: string;
  impact: Impact;
  href: string;
  estimatedLift: number;
};

type PhotoScore = {
  photo_id: string;
  overall_score: number;
  pose_score: number;
  lighting_score: number;
  smile_score: number;
  composition_score: number;
  background_score: number;
  professionalism_score: number;
  sharpness_score: number;
  thumbnail_score: number;
  predicted_ctr_lift_pct: number;
  recommended_primary: boolean;
  strengths: string[];
  improvements: string[];
  recommendation: string;
  analysis_mode: "vision" | "metadata";
};

type Profile = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  headline: string | null;
  tagline: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  photo_url: string | null;
  avatar_url: string | null;
  massage_techniques: string[] | null;
  modalities: string[] | null;
  specialties: string[] | null;
  languages: string[] | null;
  languages_spoken: string[] | null;
  years_experience: number | null;
  offers_incall: boolean | null;
  offers_outcall: boolean | null;
  is_verified_phone: boolean | null;
  is_verified_email: boolean | null;
  is_verified_identity: boolean | null;
  is_verified_photos: boolean | null;
  subscription_tier: string | null;
};

type Photo = {
  id: string;
  url: string | null;
  storage_path: string | null;
  is_primary: boolean | null;
  moderation_status: string | null;
};

type Analysis = {
  scores: {
    overall: number;
    completion: number;
    content: number;
    trust: number;
    visibility: number;
    conversion: number;
    seo: number;
    photos: number;
  };
  metrics: {
    views1d: number;
    views7d: number;
    views30d: number;
    contacts1d: number;
    contacts7d: number;
    contacts30d: number;
    favorites7d: number;
    inquiries7d: number;
    contactRate: number;
  };
  ranking: {
    current: number | null;
    previous: number | null;
    change: number | null;
    explanation: string;
  };
  forecast: {
    contactsLow: number;
    contactsLikely: number;
    contactsHigh: number;
    viewsLikely: number;
    confidence: number;
  };
  market: {
    demandScore: number | null;
    demandTrend: string;
    competitionIndex: number | null;
    searchVolumeIndex: number | null;
    topKeywords: Array<{ keyword: string; score: number; trend: string }>;
  };
  benchmark: {
    cityProfileCount: number;
    cityAverageScore: number;
    top10AverageScore: number;
    percentile: number;
    pointsToTop10: number;
  };
  recommendations: Recommendation[];
  missingFields: string[];
  completedFields: string[];
  strongestKeyword: string | null;
  photoScores: PhotoScore[];
  history: Array<{
    date: string;
    overall: number;
    visibility: number;
    trust: number;
    content: number;
    conversion: number;
  }>;
};

type Draft = {
  id: string;
  field: string;
  suggested_text: string;
  rationale: string | null;
  provider: string | null;
  model: string | null;
  created_at: string;
};

type Report = {
  id: string;
  period_type: "weekly" | "monthly";
  period_start: string;
  period_end: string;
  narrative: string | null;
  generated_at: string;
};

type Optimization = {
  id: string;
  status: string;
  after_state: Record<string, unknown>;
  estimated_impact: Record<string, unknown>;
  rationale?: string;
};

type CoachResponse = {
  ok: boolean;
  profile: Profile;
  photos: Photo[];
  analysis: Analysis;
  latestDrafts: Draft[];
  latestReports: Report[];
  latestOptimization: Optimization | null;
};

const tabs: Array<{ key: TabKey; label: string; icon: LucideIcon }> = [
  { key: "overview", label: "Overview", icon: Gauge },
  { key: "photos", label: "Photo AI", icon: Camera },
  { key: "writer", label: "AI Writer", icon: WandSparkles },
  { key: "market", label: "Market", icon: BarChart3 },
  { key: "reports", label: "Reports", icon: BellRing },
];

const promoFeatures = [
  { icon: Sparkles, title: "Smart Suggestions", copy: "Personalized actions based on your real profile data." },
  { icon: Target, title: "Profile Completion Score", copy: "Track the fields that influence trust and visibility." },
  { icon: ShieldCheck, title: "Trust & Credibility", copy: "See which verification signals still need attention." },
  { icon: Eye, title: "More Visibility", copy: "Understand ranking movement and local opportunities." },
  { icon: Search, title: "Better SEO", copy: "Improve local keywords, headline, bio, and metadata." },
];

const impactStyle: Record<Impact, string> = {
  high: "bg-[#F9EDEE] text-[#8B1E2D]",
  medium: "bg-[#FFF6E7] text-[#9A6415]",
  low: "bg-[#EEF7F0] text-[#277A43]",
};

const fieldLabels: Record<string, string> = {
  headline: "Headline",
  tagline: "Tagline",
  bio: "Bio",
  seo_title: "SEO title",
  seo_description: "Meta description",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function displayDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function AiCoachDashboard() {
  const [data, setData] = useState<CoachResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [coachOpen, setCoachOpen] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);
  const [optimization, setOptimization] = useState<Optimization | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await requestJson<CoachResponse>("/api/pro/ai-coach");
      setData(response);
      setOptimization(response.latestOptimization?.status === "preview" ? response.latestOptimization : null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load your AI Profile Coach.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const perform = useCallback(async <T,>(key: string, body: Record<string, unknown>) => {
    setBusy(key);
    setError(null);
    setNotice(null);
    try {
      return await requestJson<T>("/api/pro/ai-coach", { method: "POST", body: JSON.stringify(body) });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The requested AI action failed.");
      return null;
    } finally {
      setBusy(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    const response = await perform<CoachResponse>("refresh", { action: "refresh" });
    if (response) {
      setData(response);
      setNotice("Your profile analysis was refreshed.");
    }
  }, [perform]);

  const analyzePhotos = useCallback(async () => {
    const response = await perform<{ ok: boolean; photoScores: PhotoScore[] }>("photos", { action: "analyze-photos" });
    if (response && data) {
      setData({ ...data, analysis: { ...data.analysis, photoScores: response.photoScores } });
      setNotice("Photo scoring completed. Vision is used when configured; otherwise a safe metadata baseline is shown.");
      setActiveTab("photos");
    }
  }, [data, perform]);

  const rewrite = useCallback(async (field: "headline" | "tagline" | "bio" | "seo_title" | "seo_description") => {
    const response = await perform<{ ok: boolean; draft: Draft }>(`rewrite-${field}`, { action: "rewrite", field });
    if (response && data) {
      setData({ ...data, latestDrafts: [response.draft, ...data.latestDrafts.filter((item) => item.id !== response.draft.id)] });
      setNotice(`${fieldLabels[field]} suggestion created with ${response.draft.provider ?? "the available analysis engine"}.`);
      setActiveTab("writer");
    }
  }, [data, perform]);

  const previewOptimization = useCallback(async () => {
    const response = await perform<{ ok: boolean; optimization: Optimization }>("optimize", { action: "optimize-preview" });
    if (response) {
      setOptimization(response.optimization);
      setNotice("Your full optimization preview is ready. Review every change before applying it.");
      setActiveTab("writer");
    }
  }, [perform]);

  const applyOptimization = useCallback(async () => {
    if (!optimization) return;
    const fields = Object.keys(optimization.after_state).filter((field) => ["headline", "tagline", "bio", "seo_title", "seo_description", "seo_keywords"].includes(field));
    const response = await perform<{ ok: boolean; appliedFields: string[] }>("apply", { action: "apply-optimization", runId: optimization.id, fields });
    if (response) {
      setNotice(`Applied ${response.appliedFields.length} approved profile improvements.`);
      setOptimization(null);
      await load();
    }
  }, [load, optimization, perform]);

  const generateReport = useCallback(async (period: "weekly" | "monthly") => {
    const response = await perform<{ ok: boolean; report: Report }>(`report-${period}`, { action: "generate-report", period });
    if (response && data) {
      setData({ ...data, latestReports: [response.report, ...data.latestReports.filter((item) => item.id !== response.report.id)] });
      setNotice(`${period === "weekly" ? "Weekly" : "Monthly"} executive report generated.`);
      setActiveTab("reports");
    }
  }, [data, perform]);

  const sendChat = useCallback(async () => {
    const message = chatMessage.trim();
    if (!message) return;
    const response = await perform<{ ok: boolean; answer: string }>("chat", { action: "chat", message });
    if (response) {
      setChatAnswer(response.answer);
      setChatMessage("");
    }
  }, [chatMessage, perform]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center bg-[#FBFAF8] md:min-h-dvh">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#8B1E2D]" />
          <p className="mt-3 text-sm text-[#6E6864]">Analyzing profile, visibility, and growth signals…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#FBFAF8] p-6">
        <div className="max-w-md rounded-3xl border border-[#E8E1DB] bg-white p-8 text-center shadow-sm">
          <Sparkles className="mx-auto h-9 w-9 text-[#8B1E2D]" />
          <h1 className="mt-4 text-2xl font-semibold text-[#171513]">AI Profile Coach unavailable</h1>
          <p className="mt-2 text-sm text-[#6E6864]">{error ?? "We could not load your provider profile."}</p>
          <button type="button" onClick={() => void load()} className="mt-6 rounded-full bg-[#8B1E2D] px-5 py-2.5 text-sm font-semibold text-white">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { profile, analysis } = data;
  const displayName = profile.display_name || profile.full_name || "Provider";
  const firstName = displayName.split(" ")[0];
  const profilePhoto = profile.photo_url || profile.avatar_url || data.photos.find((photo) => photo.is_primary)?.url || null;
  const techniqueTags = [...new Set([...(profile.massage_techniques ?? []), ...(profile.modalities ?? []), ...(profile.specialties ?? [])])].slice(0, 5);
  const language = [...new Set([...(profile.languages ?? []), ...(profile.languages_spoken ?? [])])][0] || "Add language";
  const sessionType = [profile.offers_incall ? "Incall" : null, profile.offers_outcall ? "Outcall" : null].filter(Boolean).join(" & ") || "Add service type";

  return (
    <div className="min-h-full bg-[#FBFAF8] text-[#171513]">
      <div className="mx-auto grid min-h-full max-w-[1900px] grid-cols-1 2xl:grid-cols-[292px_minmax(620px,1fr)_370px]">
        <PromoBanner />

        <main className="min-w-0 border-x border-[#ECE5DF] bg-[#FFFEFC] px-4 py-5 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm text-[#6E6864]">
                <Sparkles className="h-4 w-4 text-[#A56B24]" />
                AI Profile Coach
                <span className="rounded-full bg-[#F9EDEE] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8B1E2D]">Beta</span>
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">My Profile</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void refresh()} disabled={busy !== null} className="inline-flex items-center gap-2 rounded-xl border border-[#DED6CF] bg-white px-4 py-2.5 text-sm font-semibold text-[#4D4844] shadow-sm transition hover:border-[#BCAFA5] disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${busy === "refresh" ? "animate-spin" : ""}`} />
                Refresh analysis
              </button>
              <button type="button" onClick={() => void previewOptimization()} disabled={busy !== null} className="inline-flex items-center gap-2 rounded-xl bg-[#8B1E2D] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(139,30,45,0.18)] transition hover:bg-[#741723] disabled:opacity-50">
                {busy === "optimize" ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
                Optimize with AI
              </button>
            </div>
          </div>

          {(error || notice) && (
            <div className={`mb-5 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
              <span>{error ?? notice}</span>
              <button type="button" onClick={() => { setError(null); setNotice(null); }} aria-label="Dismiss message"><X className="h-4 w-4" /></button>
            </div>
          )}

          <ProfileHero
            displayName={displayName}
            profilePhoto={profilePhoto}
            city={profile.city}
            state={profile.state}
            tags={techniqueTags}
            bio={profile.bio}
            experience={profile.years_experience}
            sessionType={sessionType}
            language={language}
            verified={Boolean(profile.is_verified_identity || profile.is_verified_profile)}
          />

          <ProfileCompletionCard analysis={analysis} firstName={firstName} />

          <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricCard icon={Eye} label="Profile Views" note="Last 30 days" value={analysis.metrics.views30d} />
            <MetricCard icon={Heart} label="Favorites" note="Last 7 days" value={analysis.metrics.favorites7d} accent />
            <MetricCard icon={MessageCircle} label="Contact Taps" note="Last 30 days" value={analysis.metrics.contacts30d} />
            <MetricCard icon={TrendingUp} label="Predicted Contacts" note="Next 7 days · estimate" value={analysis.forecast.contactsLikely} />
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto border-b border-[#E9E2DC] pb-0">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${active ? "border-[#8B1E2D] text-[#8B1E2D]" : "border-transparent text-[#756E69] hover:text-[#282421]"}`}>
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="py-5">
            {activeTab === "overview" && <OverviewPanel analysis={analysis} profile={profile} />}
            {activeTab === "photos" && <PhotoPanel photos={data.photos} scores={analysis.photoScores} busy={busy === "photos"} onAnalyze={() => void analyzePhotos()} />}
            {activeTab === "writer" && <WriterPanel profile={profile} drafts={data.latestDrafts} optimization={optimization} busy={busy} onRewrite={rewrite} onPreview={() => void previewOptimization()} onApply={() => void applyOptimization()} />}
            {activeTab === "market" && <MarketPanel analysis={analysis} city={profile.city} state={profile.state} />}
            {activeTab === "reports" && <ReportsPanel reports={data.latestReports} busy={busy} onGenerate={generateReport} />}
          </div>

          <TrustSignals profile={profile} />

          <div className="mt-5 rounded-2xl border border-[#E8D8C8] bg-gradient-to-r from-[#FFF8EF] via-white to-[#FFF5F6] px-5 py-4 text-center text-sm font-semibold text-[#5C3A32]">
            <Sparkles className="mr-2 inline h-4 w-4 text-[#A56B24]" />
            A stronger profile. More trust. More direct connections. More freedom.
          </div>
        </main>

        {coachOpen ? (
          <CoachPanel
            firstName={firstName}
            analysis={analysis}
            busy={busy}
            chatMessage={chatMessage}
            chatAnswer={chatAnswer}
            onClose={() => setCoachOpen(false)}
            onMessageChange={setChatMessage}
            onSend={() => void sendChat()}
            onRecommendation={(recommendation) => {
              if (recommendation.key === "headline") void rewrite("headline");
              else if (recommendation.key === "bio") void rewrite("bio");
              else if (recommendation.key === "photos") void analyzePhotos();
            }}
          />
        ) : (
          <aside className="hidden border-l border-[#ECE5DF] bg-[#FBFAF8] p-4 2xl:block">
            <button type="button" onClick={() => setCoachOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E5DDD6] bg-white px-4 py-4 text-sm font-semibold text-[#8B1E2D] shadow-sm">
              <Sparkles className="h-4 w-4" /> Open AI Coach
            </button>
          </aside>
        )}
      </div>
    </div>
  );
}

function PromoBanner() {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-b from-[#FFFDFC] via-[#FFF9F5] to-[#FDF2F1] px-7 py-8 2xl:flex 2xl:flex-col">
      <div className="absolute -bottom-20 -right-24 h-72 w-72 rounded-full border border-[#DDBB8C]/30" />
      <div className="absolute -bottom-28 -right-16 h-72 w-72 rounded-full border border-[#8B1E2D]/10" />
      <Image src={BRAND_ASSETS.logoLockup} alt="MasseurMatch" width={235} height={44} className="h-auto w-[220px] object-contain" priority />
      <div className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-[#C98E45]/35 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8B1E2D]">
        <Sparkles className="h-3.5 w-3.5" /> AI-powered
      </div>
      <h2 className="mt-5 text-[34px] font-semibold leading-[1.04] tracking-[-0.03em] text-[#171513]">
        MasseurMatch
        <span className="mt-1 block bg-gradient-to-r from-[#8B1E2D] to-[#C04A55] bg-clip-text text-transparent">AI Profile Coach</span>
      </h2>
      <p className="mt-4 text-sm leading-6 text-[#655E59]">Your intelligent partner for a standout profile that attracts the right clients and grows your visibility.</p>
      <div className="mt-7 space-y-4">
        {promoFeatures.map((feature) => (
          <div key={feature.title} className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#EADBD5] bg-white text-[#8B1E2D] shadow-sm">
              <feature.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#26221F]">{feature.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-[#756D67]">{feature.copy}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-8">
        <div className="relative rounded-3xl border border-white/90 bg-white/80 p-5 shadow-[0_18px_50px_rgba(99,55,45,0.08)] backdrop-blur">
          <div className="flex -space-x-2">
            {["A", "M", "J", "R", "B"].map((letter, index) => (
              <div key={letter} className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white ${["bg-[#9D3C48]", "bg-[#B77C3B]", "bg-[#495A66]", "bg-[#96705C]", "bg-[#485A4A]"][index]}`}>{letter}</div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F5B24B] via-[#D44C66] to-[#6C5CC7] text-white"><Heart className="h-4 w-4" /></div>
            <div>
              <p className="text-sm font-medium leading-5 text-[#39332F]">We celebrate every body, every identity, every person.</p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8B1E2D]">LGBTQ+ inclusive & proud</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ProfileHero({ displayName, profilePhoto, city, state, tags, bio, experience, sessionType, language, verified }: {
  displayName: string;
  profilePhoto: string | null;
  city: string | null;
  state: string | null;
  tags: string[];
  bio: string | null;
  experience: number | null;
  sessionType: string;
  language: string;
  verified: boolean;
}) {
  return (
    <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-[0_12px_40px_rgba(61,43,33,0.055)] sm:p-6">
      <div className="grid gap-5 md:grid-cols-[140px_1fr]">
        <div className="flex flex-col items-center">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[#F2ECE7] bg-[#F2ECE7] shadow-inner">
            {profilePhoto ? <img src={profilePhoto} alt={`${displayName} profile`} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-[#8B1E2D]">{displayName.charAt(0)}</div>}
            <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#393431] text-white"><Camera className="h-4 w-4" /></span>
          </div>
          {verified && <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#EDF7EF] px-3 py-1 text-xs font-semibold text-[#347348]"><BadgeCheck className="h-3.5 w-3.5" /> Verified</span>}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2"><h2 className="text-2xl font-semibold tracking-tight">{displayName}</h2>{verified && <BadgeCheck className="h-5 w-5 fill-[#3779D5] text-white" />}</div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[#665F5A]"><MapPin className="h-4 w-4" /> {[city, state].filter(Boolean).join(", ") || "Add your location"}</p>
            </div>
            <Link href="/pro/listing" className="inline-flex items-center gap-1 rounded-xl border border-[#DED6CF] px-3 py-2 text-xs font-semibold text-[#625B56] hover:border-[#BCAFA5]">Edit profile <ChevronRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(tags.length ? tags : ["Add techniques"]).map((tag) => <span key={tag} className="rounded-full border border-[#E8DFD8] bg-[#FFFCF9] px-3 py-1 text-xs font-medium text-[#514B46]">{tag}</span>)}
          </div>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#59524D]">{bio || "Add a professional bio that explains your approach, specialties, experience, and what clients can expect from a session."}</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <MiniInfo icon={Star} label="Experience" value={experience ? `${experience}+ years` : "Add experience"} />
            <MiniInfo icon={UserRoundCheck} label="Session Type" value={sessionType} />
            <MiniInfo icon={Languages} label="Languages" value={language} />
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniInfo({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="rounded-2xl border border-[#EFE8E2] bg-[#FFFCFA] px-3 py-3"><div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B1E2D]"><Icon className="h-3.5 w-3.5" />{label}</div><p className="mt-1 truncate text-xs text-[#59524D]">{value}</p></div>;
}

function ProfileCompletionCard({ analysis, firstName }: { analysis: Analysis; firstName: string }) {
  return (
    <section className="mt-5 rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm sm:p-6">
      <div className="grid items-center gap-6 lg:grid-cols-[150px_1fr]">
        <div className="flex justify-center">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full" style={{ background: `conic-gradient(#8B1E2D 0 ${analysis.scores.completion}%, #E8E1DB ${analysis.scores.completion}% 100%)` }}>
            <div className="flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full bg-white"><strong className="text-3xl">{analysis.scores.completion}%</strong><span className="text-xs text-[#817873]">Complete</span></div>
          </div>
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-semibold">Great progress, {firstName}!</h3><span className="rounded-full bg-[#FFF3E4] px-3 py-1 text-xs font-semibold text-[#8A5A18]">Top {Math.max(1, 100 - analysis.benchmark.percentile)}% in your market</span></div>
          <p className="mt-2 text-sm leading-6 text-[#6D655F]">Your overall profile health is <strong className="text-[#8B1E2D]">{analysis.scores.overall}/100</strong>. Complete the highest-impact actions to improve trust, visibility, and contact readiness.</p>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#EFE9E4]"><div className="h-full rounded-full bg-gradient-to-r from-[#8B1E2D] via-[#B43A48] to-[#D59B4C]" style={{ width: `${analysis.scores.overall}%` }} /></div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center sm:grid-cols-6">
            {Object.entries({ Content: analysis.scores.content, Trust: analysis.scores.trust, Visibility: analysis.scores.visibility, Conversion: analysis.scores.conversion, SEO: analysis.scores.seo, Photos: analysis.scores.photos }).map(([label, score]) => <div key={label} className="rounded-xl bg-[#FBF8F5] px-2 py-2"><p className="text-sm font-bold">{score}</p><p className="text-[10px] text-[#827A74]">{label}</p></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ icon: Icon, label, note, value, accent = false }: { icon: LucideIcon; label: string; note: string; value: number; accent?: boolean }) {
  return <div className="rounded-2xl border border-[#E9E2DC] bg-white p-4 shadow-sm"><div className="flex items-start justify-between"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent ? "bg-[#F9EDEE] text-[#8B1E2D]" : "bg-[#F6F2EE] text-[#5B5550]"}`}><Icon className="h-4 w-4" /></div><ArrowRight className="h-4 w-4 text-[#B8AEA7]" /></div><p className="mt-4 text-2xl font-semibold tracking-tight">{formatNumber(value)}</p><p className="mt-1 text-xs font-semibold text-[#4C4642]">{label}</p><p className="mt-0.5 text-[10px] text-[#8A817B]">{note}</p></div>;
}

function OverviewPanel({ analysis, profile }: { analysis: Analysis; profile: Profile }) {
  const chartData = analysis.history.length ? analysis.history : [{ date: new Date().toISOString().slice(0, 10), overall: analysis.scores.overall, visibility: analysis.scores.visibility, trust: analysis.scores.trust, content: analysis.scores.content, conversion: analysis.scores.conversion }];
  return (
    <div className="grid gap-4 xl:grid-cols-[1.35fr_.85fr]">
      <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><div><h3 className="font-semibold">Profile health trend</h3><p className="mt-1 text-xs text-[#827A74]">Daily score snapshots across your recent activity.</p></div><span className="rounded-full bg-[#F6F2EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#6A625C]">90 days</span></div>
        <div className="mt-5 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs><linearGradient id="coachScoreFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B1E2D" stopOpacity={0.22} /><stop offset="100%" stopColor="#8B1E2D" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="#F0EBE7" vertical={false} />
              <XAxis dataKey="date" tickFormatter={displayDate} tick={{ fontSize: 10, fill: "#918780" }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#918780" }} tickLine={false} axisLine={false} width={34} />
              <Tooltip labelFormatter={(value) => displayDate(String(value))} contentStyle={{ borderRadius: 14, border: "1px solid #E9E2DC", fontSize: 12 }} />
              <Area type="monotone" dataKey="overall" name="Profile score" stroke="#8B1E2D" strokeWidth={2.4} fill="url(#coachScoreFill)" activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <div className="space-y-4">
        <InsightCard icon={TrendingUp} title="Ranking intelligence" value={analysis.ranking.current ? `#${analysis.ranking.current}` : "Collecting data"} copy={analysis.ranking.explanation} />
        <InsightCard icon={Zap} title="7-day forecast" value={`${analysis.forecast.contactsLow}–${analysis.forecast.contactsHigh} contacts`} copy={`${analysis.forecast.confidence}% confidence estimate based on recent views and contact activity.`} />
        <InsightCard icon={CircleDollarSign} title="Rate readiness" value={analysis.scores.conversion >= 75 ? "Strong" : "Needs attention"} copy={analysis.scores.conversion >= 75 ? "Your rates and conversion details are in good shape." : "Clear rates, durations, payment methods, and amenities can improve qualified contacts."} href="/pro/rates" />
      </div>
      <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm xl:col-span-2">
        <div className="flex items-center justify-between"><div><h3 className="font-semibold">Today&apos;s priorities</h3><p className="mt-1 text-xs text-[#827A74]">Ordered by likely profile impact, not guaranteed results.</p></div><Link href="/pro/listing" className="text-xs font-semibold text-[#8B1E2D]">Edit profile</Link></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {analysis.recommendations.slice(0, 4).map((item, index) => <Link key={item.key} href={item.href} className="group rounded-2xl border border-[#EEE7E1] bg-[#FFFDFC] p-4 transition hover:border-[#D7C7BA] hover:shadow-sm"><div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F9EDEE] text-sm font-bold text-[#8B1E2D]">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h4 className="text-sm font-semibold">{item.title}</h4><span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase ${impactStyle[item.impact]}`}>{item.impact}</span></div><p className="mt-1 text-xs leading-5 text-[#756D67]">{item.action}</p><p className="mt-2 text-[10px] font-semibold text-[#8B1E2D]">Directional lift +{item.estimatedLift}%</p></div><ChevronRight className="mt-1 h-4 w-4 text-[#B7AEA8] transition group-hover:translate-x-0.5" /></div></Link>)}
        </div>
      </section>
      {profile.subscription_tier !== "elite" && <div className="rounded-3xl border border-[#E8D8C8] bg-[#FFF9F1] p-5 xl:col-span-2"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-[#6A442A]">AI Coach works with every plan</p><p className="mt-1 text-xs text-[#7B685B]">Some advanced automation and visibility tools may depend on your subscription tier.</p></div><Link href="/pro/subscription" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#8B1E2D] shadow-sm">View subscription <ArrowRight className="h-3.5 w-3.5" /></Link></div></div>}
    </div>
  );
}

function InsightCard({ icon: Icon, title, value, copy, href }: { icon: LucideIcon; title: string; value: string; copy: string; href?: string }) {
  const body = <div className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#8B1E2D]"><Icon className="h-4 w-4" />{title}</div><p className="mt-3 text-xl font-semibold">{value}</p><p className="mt-2 text-xs leading-5 text-[#756D67]">{copy}</p></div>;
  return href ? <Link href={href}>{body}</Link> : body;
}

function PhotoPanel({ photos, scores, busy, onAnalyze }: { photos: Photo[]; scores: PhotoScore[]; busy: boolean; onAnalyze: () => void }) {
  const byPhoto = new Map(scores.map((score) => [score.photo_id, score]));
  return (
    <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="font-semibold">AI Photo Quality Lab</h3><p className="mt-1 text-xs text-[#827A74]">Scores pose, lighting, approachability, composition, background, sharpness, and professionalism.</p></div><button type="button" onClick={onAnalyze} disabled={busy || photos.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B1E2D] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} Analyze gallery</button></div>
      {photos.length === 0 ? <EmptyState icon={ImageIcon} title="No photos to analyze" copy="Upload profile and gallery photos first." href="/pro/photos" action="Manage photos" /> : <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{photos.map((photo, index) => {
        const score = byPhoto.get(photo.id);
        return <article key={photo.id} className="overflow-hidden rounded-2xl border border-[#EAE2DC] bg-[#FFFCFA]"><div className="relative aspect-[4/3] bg-[#EEE8E3]">{photo.url ? <img src={photo.url} alt={`Profile gallery photo ${index + 1}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-[#A99F98]" /></div>}{photo.is_primary && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#8B1E2D] shadow">Primary</span>}{score && <span className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#8B1E2D] text-sm font-bold text-white shadow-lg">{score.overall_score}</span>}</div><div className="p-4">{score ? <><div className="flex items-center justify-between"><p className="text-sm font-semibold">Photo {index + 1}</p><span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#817873]">{score.analysis_mode === "vision" ? "AI Vision" : "Baseline"}</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">{[["Lighting", score.lighting_score], ["Pose", score.pose_score], ["Smile", score.smile_score], ["Professional", score.professionalism_score]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-white px-3 py-2"><span className="text-[#817873]">{label}</span><strong className="float-right">{value}</strong></div>)}</div><p className="mt-3 text-xs leading-5 text-[#6D655F]">{score.recommendation}</p><p className="mt-2 text-[10px] font-semibold text-[#8B1E2D]">Estimated CTR direction: +{score.predicted_ctr_lift_pct}%</p></> : <><p className="text-sm font-semibold">Photo {index + 1}</p><p className="mt-2 text-xs text-[#817873]">Run the AI analysis to score presentation quality.</p></>}</div></article>;
      })}</div>}
      <p className="mt-5 rounded-2xl bg-[#F8F4F0] px-4 py-3 text-[11px] leading-5 text-[#756D67]">Photo scoring evaluates photographic presentation only. It does not infer identity, protected traits, health, personality, or suitability. Scores and CTR lift are directional guidance, not guarantees.</p>
    </section>
  );
}

function WriterPanel({ profile, drafts, optimization, busy, onRewrite, onPreview, onApply }: { profile: Profile; drafts: Draft[]; optimization: Optimization | null; busy: string | null; onRewrite: (field: "headline" | "tagline" | "bio" | "seo_title" | "seo_description") => void; onPreview: () => void; onApply: () => void }) {
  const current: Record<string, string | null> = { headline: profile.headline, tagline: profile.tagline, bio: profile.bio, seo_title: null, seo_description: null };
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="font-semibold">AI Copywriter</h3><p className="mt-1 text-xs text-[#827A74]">DeepSeek is used first when configured, with OpenAI and Gemini fallbacks.</p></div><button type="button" onClick={onPreview} disabled={busy !== null} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B1E2D] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{busy === "optimize" ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />} Preview full optimization</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{(["headline", "tagline", "bio", "seo_title", "seo_description"] as const).map((field) => <button key={field} type="button" onClick={() => onRewrite(field)} disabled={busy !== null} className="rounded-2xl border border-[#EAE2DC] bg-[#FFFCFA] p-4 text-left transition hover:border-[#CDBCAF] disabled:opacity-50"><div className="flex items-center justify-between"><Sparkles className="h-4 w-4 text-[#8B1E2D]" />{busy === `rewrite-${field}` && <Loader2 className="h-4 w-4 animate-spin text-[#8B1E2D]" />}</div><p className="mt-3 text-sm font-semibold">Rewrite {fieldLabels[field]}</p><p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#817873]">{current[field] || "Generate a polished, factual suggestion."}</p></button>)}</div></section>
      {optimization && <section className="rounded-3xl border border-[#DDBFC3] bg-[#FFF8F8] p-5 shadow-sm"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="font-semibold text-[#6F1723]">One-click optimization preview</h3><p className="mt-1 text-xs text-[#7C6265]">Nothing changes until you approve and apply this preview.</p></div><button type="button" onClick={onApply} disabled={busy !== null} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B1E2D] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{busy === "apply" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Apply approved changes</button></div><div className="mt-4 grid gap-3 lg:grid-cols-2">{Object.entries(optimization.after_state).filter(([key]) => key !== "seo_keywords").map(([key, value]) => <div key={key} className="rounded-2xl border border-[#EAD7D9] bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B1E2D]">{fieldLabels[key] ?? key}</p><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[#5F5554]">{String(value ?? "")}</p></div>)}</div>{optimization.rationale && <p className="mt-4 text-xs leading-5 text-[#755E60]">{optimization.rationale}</p>}</section>}
      <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm"><h3 className="font-semibold">Recent suggestions</h3>{drafts.length ? <div className="mt-4 space-y-3">{drafts.slice(0, 8).map((draft) => <article key={draft.id} className="rounded-2xl border border-[#EEE7E1] bg-[#FFFCFA] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#8B1E2D]">{fieldLabels[draft.field] ?? draft.field}</p><span className="text-[10px] text-[#8A817B]">{draft.provider ?? "deterministic"} · {draft.model ?? "fallback"}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#4E4844]">{draft.suggested_text}</p>{draft.rationale && <p className="mt-2 text-xs text-[#817873]">{draft.rationale}</p>}</article>)}</div> : <EmptyState icon={Sparkles} title="No AI drafts yet" copy="Choose a field above to generate your first suggestion." />}</section>
    </div>
  );
}

function MarketPanel({ analysis, city, state }: { analysis: Analysis; city: string | null; state: string | null }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-[#8B1E2D]" /><div><h3 className="font-semibold">{[city, state].filter(Boolean).join(", ") || "Local market"}</h3><p className="text-xs text-[#827A74]">Dynamic market intelligence</p></div></div><div className="mt-5 grid grid-cols-2 gap-3"><MarketMetric label="Demand" value={analysis.market.demandScore ?? "—"} note={analysis.market.demandTrend} /><MarketMetric label="Competition" value={analysis.market.competitionIndex ?? "—"} note="index" /><MarketMetric label="Search volume" value={analysis.market.searchVolumeIndex ?? "—"} note="index" /><MarketMetric label="Profiles compared" value={analysis.benchmark.cityProfileCount} note="up to 100" /></div></section>
      <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm"><h3 className="font-semibold">Competitor benchmark</h3><p className="mt-1 text-xs text-[#827A74]">Anonymized comparison against active profiles in the same city.</p><div className="mt-5 space-y-4">{[["Your score", analysis.scores.overall], ["City average", analysis.benchmark.cityAverageScore], ["Top 10 average", analysis.benchmark.top10AverageScore]].map(([label, value]) => <div key={String(label)}><div className="mb-1.5 flex justify-between text-xs"><span className="text-[#675F5A]">{label}</span><strong>{value}</strong></div><div className="h-2 overflow-hidden rounded-full bg-[#F0EAE5]"><div className={`h-full rounded-full ${label === "Your score" ? "bg-[#8B1E2D]" : "bg-[#BFB3AA]"}`} style={{ width: `${Math.min(100, Number(value))}%` }} /></div></div>)}</div><p className="mt-5 rounded-2xl bg-[#F8F4F0] px-4 py-3 text-xs leading-5 text-[#6F6761]">You rank around the <strong>{analysis.benchmark.percentile}th percentile</strong>. You need approximately <strong>{analysis.benchmark.pointsToTop10} points</strong> to reach the current top-10 average.</p></section>
      <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm lg:col-span-2"><h3 className="font-semibold">Trending local keywords</h3>{analysis.market.topKeywords.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{analysis.market.topKeywords.map((keyword, index) => <div key={keyword.keyword} className="rounded-2xl border border-[#EEE7E1] bg-[#FFFCFA] p-4"><div className="flex items-center justify-between"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F9EDEE] text-xs font-bold text-[#8B1E2D]">{index + 1}</span><span className="text-[10px] font-semibold uppercase text-[#6D765E]">{keyword.trend}</span></div><p className="mt-3 text-sm font-semibold">{keyword.keyword}</p><p className="mt-1 text-xs text-[#817873]">Opportunity score {keyword.score}</p></div>)}</div> : <EmptyState icon={Search} title="No keyword trend data yet" copy="Local search trends will appear as market activity is collected." />}</section>
    </div>
  );
}

function MarketMetric({ label, value, note }: { label: string; value: string | number; note: string }) {
  return <div className="rounded-2xl bg-[#F9F5F1] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#817873]">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs capitalize text-[#8A817B]">{note}</p></div>;
}

function ReportsPanel({ reports, busy, onGenerate }: { reports: Report[]; busy: string | null; onGenerate: (period: "weekly" | "monthly") => void }) {
  return (
    <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="font-semibold">Executive performance reports</h3><p className="mt-1 text-xs text-[#827A74]">Narrative summaries grounded in profile analytics and estimates.</p></div><div className="flex gap-2"><button type="button" onClick={() => onGenerate("weekly")} disabled={busy !== null} className="rounded-xl border border-[#DAD1CA] px-3 py-2 text-xs font-semibold disabled:opacity-50">{busy === "report-weekly" ? "Generating…" : "Weekly report"}</button><button type="button" onClick={() => onGenerate("monthly")} disabled={busy !== null} className="rounded-xl bg-[#8B1E2D] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{busy === "report-monthly" ? "Generating…" : "Monthly report"}</button></div></div>{reports.length ? <div className="mt-5 space-y-3">{reports.map((report) => <article key={report.id} className="rounded-2xl border border-[#EEE7E1] bg-[#FFFCFA] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8B1E2D]">{report.period_type} report</p><span className="text-[10px] text-[#8A817B]">{report.period_start} – {report.period_end}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#514B46]">{report.narrative || "Report generated without a narrative."}</p></article>)}</div> : <EmptyState icon={BarChart3} title="No reports generated" copy="Create a weekly or monthly executive summary." />}</section>
  );
}

function TrustSignals({ profile }: { profile: Profile }) {
  const signals = [
    { label: "ID Verified", complete: Boolean(profile.is_verified_identity) },
    { label: "Phone Verified", complete: Boolean(profile.is_verified_phone) },
    { label: "Email Verified", complete: Boolean(profile.is_verified_email) },
    { label: "Photos Verified", complete: Boolean(profile.is_verified_photos) },
  ];
  return <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#8B1E2D]" /><div><h3 className="font-semibold">Trust Signals</h3><p className="text-xs text-[#827A74]">Build confidence with visible, verified profile details.</p></div></div><div className="mt-4 flex flex-wrap gap-2">{signals.map((signal) => <span key={signal.label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold ${signal.complete ? "bg-[#EDF7EF] text-[#347348]" : "bg-[#F7F2EE] text-[#756D67]"}`}>{signal.complete ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}{signal.label}</span>)}</div></section>;
}

function CoachPanel({ firstName, analysis, busy, chatMessage, chatAnswer, onClose, onMessageChange, onSend, onRecommendation }: { firstName: string; analysis: Analysis; busy: string | null; chatMessage: string; chatAnswer: string | null; onClose: () => void; onMessageChange: (value: string) => void; onSend: () => void; onRecommendation: (recommendation: Recommendation) => void }) {
  return (
    <aside className="sticky top-0 hidden h-dvh overflow-y-auto bg-[#FBFAF8] px-4 py-5 2xl:block">
      <div className="rounded-3xl border border-[#E6DED7] bg-white p-4 shadow-[0_18px_50px_rgba(61,43,33,0.06)]">
        <div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#8B1E2D]" /><h2 className="text-lg font-semibold">AI Profile Coach</h2><span className="rounded-full bg-[#F9EDEE] px-2 py-0.5 text-[9px] font-bold uppercase text-[#8B1E2D]">Beta</span></div><p className="mt-1 text-xs text-[#827A74]">Personalized profile optimization assistant.</p></div><button type="button" onClick={onClose} aria-label="Close AI coach" className="rounded-lg p-1.5 text-[#817873] hover:bg-[#F5F0EC]"><X className="h-4 w-4" /></button></div>
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#FFF8F2] to-[#FFF5F6] p-4"><p className="text-sm leading-6 text-[#504844]">Hi {firstName}! I reviewed your profile, market signals, and recent activity. Your score is <strong>{analysis.scores.overall}/100</strong>. Let&apos;s work through the highest-impact improvements.</p></div>
        <div className="mt-5 flex items-center justify-between"><h3 className="text-sm font-semibold">Your Action Plan</h3><span className="text-[10px] text-[#8A817B]">{analysis.recommendations.length} suggestions</span></div>
        <div className="mt-3 space-y-2.5">{analysis.recommendations.slice(0, 6).map((item) => <button key={item.key} type="button" onClick={() => onRecommendation(item)} className="group flex w-full items-start gap-3 rounded-2xl border border-[#EEE7E1] bg-[#FFFCFA] p-3 text-left transition hover:border-[#CFBFB4]"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F9EDEE] text-[#8B1E2D]"><Zap className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-xs font-semibold">{item.title}</p><span className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${impactStyle[item.impact]}`}>{item.impact}</span></div><p className="mt-1 text-[10px] leading-4 text-[#817873]">{item.action}</p></div><ChevronRight className="mt-1 h-4 w-4 text-[#B8AEA7] transition group-hover:translate-x-0.5" /></button>)}</div>
        {chatAnswer && <div className="mt-4 rounded-2xl border border-[#E4D8D0] bg-[#FFF9F4] p-4 text-xs leading-5 text-[#5C524D]">{chatAnswer}</div>}
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#E4DCD5] bg-white p-2 shadow-inner"><input value={chatMessage} onChange={(event) => onMessageChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSend(); } }} placeholder="Ask your AI coach anything…" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-xs outline-none placeholder:text-[#A69D96]" /><button type="button" onClick={onSend} disabled={busy !== null || !chatMessage.trim()} aria-label="Send message" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8B1E2D] text-white disabled:opacity-40">{busy === "chat" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button></div>
        <p className="mt-2 text-center text-[9px] leading-4 text-[#9B928B]">AI recommendations and forecasts are estimates. Review changes before applying them.</p>
      </div>
    </aside>
  );
}

function EmptyState({ icon: Icon, title, copy, href, action }: { icon: LucideIcon; title: string; copy: string; href?: string; action?: string }) {
  return <div className="mt-5 flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCD2CA] bg-[#FCF9F6] p-6 text-center"><Icon className="h-8 w-8 text-[#B1A69E]" /><p className="mt-3 text-sm font-semibold">{title}</p><p className="mt-1 max-w-sm text-xs leading-5 text-[#817873]">{copy}</p>{href && action && <Link href={href} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#8B1E2D]">{action}<ArrowRight className="h-3.5 w-3.5" /></Link>}</div>;
}
