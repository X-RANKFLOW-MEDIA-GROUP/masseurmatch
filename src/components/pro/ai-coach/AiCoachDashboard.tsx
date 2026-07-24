"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  Camera,
  Check,
  ChevronRight,
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
type RewriteField = "headline" | "tagline" | "bio" | "seo_title" | "seo_description";

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
  provider: string | null;
  model: string | null;
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
  is_verified_profile: boolean | null;
  is_verified_photos: boolean | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
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

const TABS: Array<{ key: TabKey; label: string; icon: LucideIcon }> = [
  { key: "overview", label: "Overview", icon: Gauge },
  { key: "photos", label: "Photo AI", icon: Camera },
  { key: "writer", label: "AI Writer", icon: WandSparkles },
  { key: "market", label: "Market", icon: BarChart3 },
  { key: "reports", label: "Reports", icon: BellRing },
];

const FIELD_LABELS: Record<string, string> = {
  headline: "Headline",
  tagline: "Tagline",
  bio: "Bio",
  seo_title: "SEO title",
  seo_description: "Meta description",
  seo_keywords: "SEO keywords",
};

const IMPACT_CLASS: Record<Impact, string> = {
  high: "bg-[#F9EDEE] text-[#8B1E2D]",
  medium: "bg-[#FFF4E5] text-[#986116]",
  low: "bg-[#EEF7F0] text-[#287644]",
};

const PROMO_ITEMS = [
  { icon: Sparkles, title: "Smart Suggestions", copy: "Personalized actions grounded in your profile." },
  { icon: Target, title: "Profile Health", copy: "Track completion, trust, SEO, and conversion." },
  { icon: ShieldCheck, title: "Trust & Credibility", copy: "See the verification signals that matter." },
  { icon: Eye, title: "More Visibility", copy: "Understand ranking movement and local demand." },
  { icon: Search, title: "Better SEO", copy: "Improve copy and keyword relevance with AI." },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function profileName(profile: Profile) {
  return profile.display_name || profile.full_name || "Provider";
}

export function AiCoachDashboard() {
  const [data, setData] = useState<CoachResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");
  const [coachOpen, setCoachOpen] = useState(true);
  const [chat, setChat] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [optimization, setOptimization] = useState<Optimization | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await requestJson<CoachResponse>("/api/pro/ai-coach");
      setData(response);
      setOptimization(response.latestOptimization?.status === "preview" ? response.latestOptimization : null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load the AI Profile Coach.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const run = useCallback(async <T,>(key: string, body: Record<string, unknown>) => {
    setBusy(key);
    setError(null);
    setNotice(null);
    try {
      return await requestJson<T>("/api/pro/ai-coach", {
        method: "POST",
        body: JSON.stringify(body),
      });
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The requested action failed.");
      return null;
    } finally {
      setBusy(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    const response = await run<CoachResponse>("refresh", { action: "refresh" });
    if (!response) return;
    setData(response);
    setNotice("Your profile analysis was refreshed.");
  }, [run]);

  const rewrite = useCallback(async (field: RewriteField) => {
    const response = await run<{ ok: boolean; draft: Draft }>(`rewrite-${field}`, { action: "rewrite", field });
    if (!response || !data) return;
    setData({
      ...data,
      latestDrafts: [response.draft, ...data.latestDrafts.filter((draft) => draft.id !== response.draft.id)],
    });
    setTab("writer");
    setNotice(`${FIELD_LABELS[field]} suggestion created.`);
  }, [data, run]);

  const analyzePhotos = useCallback(async () => {
    const response = await run<{ ok: boolean; photoScores: PhotoScore[] }>("photos", { action: "analyze-photos" });
    if (!response || !data) return;
    setData({ ...data, analysis: { ...data.analysis, photoScores: response.photoScores } });
    setTab("photos");
    setNotice("Photo presentation analysis completed.");
  }, [data, run]);

  const previewOptimization = useCallback(async () => {
    const response = await run<{ ok: boolean; optimization: Optimization }>("optimize", { action: "optimize-preview" });
    if (!response) return;
    setOptimization(response.optimization);
    setTab("writer");
    setNotice("Optimization preview ready. Review every field before applying.");
  }, [run]);

  const applyOptimization = useCallback(async () => {
    if (!optimization) return;
    const allowed = ["headline", "tagline", "bio", "seo_title", "seo_description", "seo_keywords"];
    const fields = Object.keys(optimization.after_state).filter((field) => allowed.includes(field));
    const response = await run<{ ok: boolean; appliedFields: string[] }>("apply", {
      action: "apply-optimization",
      runId: optimization.id,
      fields,
    });
    if (!response) return;
    setOptimization(null);
    setNotice(`Applied ${response.appliedFields.length} approved improvements.`);
    await load();
  }, [load, optimization, run]);

  const generateReport = useCallback(async (period: "weekly" | "monthly") => {
    const response = await run<{ ok: boolean; report: Report }>(`report-${period}`, {
      action: "generate-report",
      period,
    });
    if (!response || !data) return;
    setData({
      ...data,
      latestReports: [response.report, ...data.latestReports.filter((report) => report.id !== response.report.id)],
    });
    setTab("reports");
    setNotice(`${period === "weekly" ? "Weekly" : "Monthly"} report generated.`);
  }, [data, run]);

  const askCoach = useCallback(async () => {
    const message = chat.trim();
    if (!message) return;
    const response = await run<{ ok: boolean; answer: string }>("chat", { action: "chat", message });
    if (!response) return;
    setAnswer(response.answer);
    setChat("");
  }, [chat, run]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#FBFAF8]">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#8B1E2D]" />
          <p className="mt-3 text-sm text-[#716963]">Analyzing profile and market signals…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#FBFAF8] p-6">
        <div className="max-w-md rounded-3xl border border-[#E8E1DB] bg-white p-8 text-center shadow-sm">
          <Sparkles className="mx-auto h-9 w-9 text-[#8B1E2D]" />
          <h1 className="mt-4 text-2xl font-semibold">AI Profile Coach unavailable</h1>
          <p className="mt-2 text-sm text-[#716963]">{error || "Your provider profile could not be loaded."}</p>
          <button type="button" onClick={() => void load()} className="mt-6 rounded-full bg-[#8B1E2D] px-5 py-2.5 text-sm font-semibold text-white">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const profile = data.profile;
  const analysis = data.analysis;
  const name = profileName(profile);
  const firstName = name.split(" ")[0];
  const primaryPhoto = profile.photo_url || profile.avatar_url || data.photos.find((photo) => photo.is_primary)?.url || null;
  const tags = [...new Set([...(profile.massage_techniques || []), ...(profile.modalities || []), ...(profile.specialties || [])])].slice(0, 5);
  const language = [...new Set([...(profile.languages || []), ...(profile.languages_spoken || [])])][0] || "Add language";
  const sessionType = [profile.offers_incall ? "Incall" : null, profile.offers_outcall ? "Outcall" : null].filter(Boolean).join(" & ") || "Add service type";
  const verified = Boolean(profile.is_verified_identity || profile.is_verified_profile);

  return (
    <div className="min-h-full bg-[#FBFAF8] text-[#171513]">
      <div className="mx-auto grid min-h-full max-w-[1920px] grid-cols-1 2xl:grid-cols-[292px_minmax(620px,1fr)_370px]">
        <PromotionalBanner />

        <main className="min-w-0 border-x border-[#ECE5DF] bg-[#FFFEFC] px-4 py-5 sm:px-6 lg:px-8">
          <Header busy={busy} onRefresh={() => void refresh()} onOptimize={() => void previewOptimization()} />
          <Feedback error={error} notice={notice} onClose={() => { setError(null); setNotice(null); }} />
          <ProfileHero
            profile={profile}
            name={name}
            photo={primaryPhoto}
            tags={tags}
            language={language}
            sessionType={sessionType}
            verified={verified}
          />
          <CompletionCard analysis={analysis} firstName={firstName} />
          <Metrics analysis={analysis} />

          <div className="mt-5 flex gap-2 overflow-x-auto border-b border-[#E9E2DC]">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${tab === item.key ? "border-[#8B1E2D] text-[#8B1E2D]" : "border-transparent text-[#766E68] hover:text-[#27221F]"}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="py-5">
            {tab === "overview" && <Overview analysis={analysis} />}
            {tab === "photos" && <PhotoLab photos={data.photos} scores={analysis.photoScores} busy={busy === "photos"} onAnalyze={() => void analyzePhotos()} />}
            {tab === "writer" && (
              <Writer
                profile={profile}
                drafts={data.latestDrafts}
                optimization={optimization}
                busy={busy}
                onRewrite={(field) => void rewrite(field)}
                onPreview={() => void previewOptimization()}
                onApply={() => void applyOptimization()}
              />
            )}
            {tab === "market" && <Market analysis={analysis} city={profile.city} state={profile.state} />}
            {tab === "reports" && <Reports reports={data.latestReports} busy={busy} onGenerate={(period) => void generateReport(period)} />}
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
            message={chat}
            answer={answer}
            onMessage={setChat}
            onSend={() => void askCoach()}
            onClose={() => setCoachOpen(false)}
            onAction={(recommendation) => {
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

function Header({ busy, onRefresh, onOptimize }: { busy: string | null; onRefresh: () => void; onOptimize: () => void }) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
      <div>
        <div className="flex items-center gap-2 text-sm text-[#6E6864]">
          <Sparkles className="h-4 w-4 text-[#A56B24]" /> AI Profile Coach
          <span className="rounded-full bg-[#F9EDEE] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8B1E2D]">Beta</span>
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">My Profile</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onRefresh} disabled={busy !== null} className="inline-flex items-center gap-2 rounded-xl border border-[#DED6CF] bg-white px-4 py-2.5 text-sm font-semibold text-[#4D4844] shadow-sm disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${busy === "refresh" ? "animate-spin" : ""}`} /> Refresh analysis
        </button>
        <button type="button" onClick={onOptimize} disabled={busy !== null} className="inline-flex items-center gap-2 rounded-xl bg-[#8B1E2D] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(139,30,45,0.18)] disabled:opacity-50">
          {busy === "optimize" ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />} Optimize with AI
        </button>
      </div>
    </div>
  );
}

function Feedback({ error, notice, onClose }: { error: string | null; notice: string | null; onClose: () => void }) {
  if (!error && !notice) return null;
  return (
    <div className={`mb-5 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
      <span>{error || notice}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss message"><X className="h-4 w-4" /></button>
    </div>
  );
}

function PromotionalBanner() {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-b from-[#FFFDFC] via-[#FFF9F5] to-[#FDF2F1] px-7 py-8 2xl:flex 2xl:flex-col">
      <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full border border-[#C89555]/25" />
      <Image src={BRAND_ASSETS.logoLockup} alt="MasseurMatch" width={235} height={44} className="h-auto w-[220px] object-contain" priority />
      <span className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-[#C98E45]/35 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8B1E2D]">
        <Sparkles className="h-3.5 w-3.5" /> AI-powered
      </span>
      <h2 className="mt-5 text-[34px] font-semibold leading-[1.04] tracking-[-0.03em]">
        MasseurMatch
        <span className="mt-1 block bg-gradient-to-r from-[#8B1E2D] to-[#C04A55] bg-clip-text text-transparent">AI Profile Coach</span>
      </h2>
      <p className="mt-4 text-sm leading-6 text-[#655E59]">Your intelligent partner for a standout profile that attracts the right clients and grows your visibility.</p>
      <div className="mt-7 space-y-4">
        {PROMO_ITEMS.map((item) => (
          <div key={item.title} className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#EADBD5] bg-white text-[#8B1E2D] shadow-sm"><item.icon className="h-4 w-4" /></div>
            <div><p className="text-sm font-semibold">{item.title}</p><p className="mt-0.5 text-xs leading-5 text-[#756D67]">{item.copy}</p></div>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-8">
        <div className="rounded-3xl border border-white bg-white/85 p-5 shadow-[0_18px_50px_rgba(99,55,45,0.08)]">
          <div className="flex -space-x-2">
            {["A", "M", "J", "R", "B"].map((letter, index) => (
              <div key={letter} className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white ${["bg-[#9D3C48]", "bg-[#B77C3B]", "bg-[#495A66]", "bg-[#96705C]", "bg-[#485A4A]"][index]}`}>{letter}</div>
            ))}
          </div>
          <p className="mt-4 text-sm font-medium leading-5">We celebrate every body, every identity, every person.</p>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8B1E2D]">LGBTQ+ inclusive & proud</p>
        </div>
      </div>
    </aside>
  );
}

function ProfileHero({ profile, name, photo, tags, language, sessionType, verified }: { profile: Profile; name: string; photo: string | null; tags: string[]; language: string; sessionType: string; verified: boolean }) {
  return (
    <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-[0_12px_40px_rgba(61,43,33,0.055)] sm:p-6">
      <div className="grid gap-5 md:grid-cols-[140px_1fr]">
        <div className="flex flex-col items-center">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[#F2ECE7] bg-[#F2ECE7]">
            {photo ? <img src={photo} alt={`${name} profile`} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-[#8B1E2D]">{name.charAt(0)}</div>}
            <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#393431] text-white"><Camera className="h-4 w-4" /></span>
          </div>
          {verified && <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#EDF7EF] px-3 py-1 text-xs font-semibold text-[#347348]"><BadgeCheck className="h-3.5 w-3.5" /> Verified</span>}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-semibold">{name}{verified && <BadgeCheck className="h-5 w-5 text-[#3779D5]" />}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[#665F5A]"><MapPin className="h-4 w-4" /> {[profile.city, profile.state].filter(Boolean).join(", ") || "Add location"}</p>
            </div>
            <Link href="/pro/listing" className="inline-flex items-center gap-1 rounded-xl border border-[#DED6CF] px-3 py-2 text-xs font-semibold text-[#625B56]">Edit profile <ChevronRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">{(tags.length ? tags : ["Add techniques"]).map((tag) => <span key={tag} className="rounded-full border border-[#E8DFD8] bg-[#FFFCF9] px-3 py-1 text-xs font-medium">{tag}</span>)}</div>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#59524D]">{profile.bio || "Add a professional bio describing your approach, specialties, experience, and what clients can expect."}</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <MiniInfo icon={Star} label="Experience" value={profile.years_experience ? `${profile.years_experience}+ years` : "Add experience"} />
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

function CompletionCard({ analysis, firstName }: { analysis: Analysis; firstName: string }) {
  const scoreEntries = Object.entries({ Content: analysis.scores.content, Trust: analysis.scores.trust, Visibility: analysis.scores.visibility, Conversion: analysis.scores.conversion, SEO: analysis.scores.seo, Photos: analysis.scores.photos });
  return (
    <section className="mt-5 rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm sm:p-6">
      <div className="grid items-center gap-6 lg:grid-cols-[150px_1fr]">
        <div className="flex justify-center"><div className="relative flex h-32 w-32 items-center justify-center rounded-full" style={{ background: `conic-gradient(#8B1E2D 0 ${analysis.scores.completion}%, #E8E1DB ${analysis.scores.completion}% 100%)` }}><div className="flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full bg-white"><strong className="text-3xl">{analysis.scores.completion}%</strong><span className="text-xs text-[#817873]">Complete</span></div></div></div>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-semibold">Great progress, {firstName}!</h3><span className="rounded-full bg-[#FFF3E4] px-3 py-1 text-xs font-semibold text-[#8A5A18]">{analysis.benchmark.percentile}th percentile</span></div>
          <p className="mt-2 text-sm leading-6 text-[#6D655F]">Your overall profile health is <strong className="text-[#8B1E2D]">{analysis.scores.overall}/100</strong>. Complete high-impact actions to improve trust, visibility, and contact readiness.</p>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#EFE9E4]"><div className="h-full rounded-full bg-gradient-to-r from-[#8B1E2D] via-[#B43A48] to-[#D59B4C]" style={{ width: `${analysis.scores.overall}%` }} /></div>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">{scoreEntries.map(([label, score]) => <div key={label} className="rounded-xl bg-[#FBF8F5] px-2 py-2 text-center"><p className="text-sm font-bold">{score}</p><p className="text-[10px] text-[#827A74]">{label}</p></div>)}</div>
        </div>
      </div>
    </section>
  );
}

function Metrics({ analysis }: { analysis: Analysis }) {
  const metrics = [
    { icon: Eye, label: "Profile Views", note: "Last 30 days", value: analysis.metrics.views30d },
    { icon: Heart, label: "Favorites", note: "Last 7 days", value: analysis.metrics.favorites7d },
    { icon: MessageCircle, label: "Contact Taps", note: "Last 30 days", value: analysis.metrics.contacts30d },
    { icon: TrendingUp, label: "Predicted Contacts", note: "Next 7 days · estimate", value: analysis.forecast.contactsLikely },
  ];
  return <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">{metrics.map((metric) => <div key={metric.label} className="rounded-2xl border border-[#E9E2DC] bg-white p-4 shadow-sm"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F9EDEE] text-[#8B1E2D]"><metric.icon className="h-4 w-4" /></div><p className="mt-4 text-2xl font-semibold">{formatNumber(metric.value)}</p><p className="mt-1 text-xs font-semibold">{metric.label}</p><p className="mt-0.5 text-[10px] text-[#8A817B]">{metric.note}</p></div>)}</div>;
}

function Overview({ analysis }: { analysis: Analysis }) {
  const maxHistory = Math.max(1, ...analysis.history.map((point) => point.overall));
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm">
        <h3 className="font-semibold">Profile health trend</h3>
        <p className="mt-1 text-xs text-[#827A74]">Recent daily score snapshots.</p>
        <div className="mt-6 flex h-48 items-end gap-2 rounded-2xl bg-[#FCF9F6] p-4">
          {(analysis.history.length ? analysis.history.slice(-20) : [{ date: "Today", overall: analysis.scores.overall }]).map((point) => (
            <div key={point.date} className="group flex min-w-0 flex-1 flex-col items-center justify-end">
              <div className="w-full rounded-t-lg bg-gradient-to-t from-[#8B1E2D] to-[#D59B4C] transition group-hover:opacity-80" style={{ height: `${Math.max(8, (point.overall / maxHistory) * 100)}%` }} title={`${point.date}: ${point.overall}`} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-[10px] text-[#8A817B]"><span>Older</span><span>Today</span></div>
      </section>
      <div className="space-y-4">
        <Insight title="Ranking intelligence" icon={TrendingUp} value={analysis.ranking.current ? `#${analysis.ranking.current}` : "Collecting data"} copy={analysis.ranking.explanation} />
        <Insight title="7-day forecast" icon={Zap} value={`${analysis.forecast.contactsLow}–${analysis.forecast.contactsHigh} contacts`} copy={`${analysis.forecast.confidence}% confidence estimate based on recent activity.`} />
      </div>
      <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm xl:col-span-2">
        <h3 className="font-semibold">Today&apos;s priorities</h3>
        <p className="mt-1 text-xs text-[#827A74]">Ordered by likely impact. Estimates are directional, not guaranteed.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">{analysis.recommendations.slice(0, 6).map((item, index) => <Link key={item.key} href={item.href} className="rounded-2xl border border-[#EEE7E1] bg-[#FFFCFA] p-4 transition hover:border-[#CFBFB4]"><div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F9EDEE] text-sm font-bold text-[#8B1E2D]">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold">{item.title}</p><span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ${IMPACT_CLASS[item.impact]}`}>{item.impact}</span></div><p className="mt-1 text-xs leading-5 text-[#756D67]">{item.action}</p><p className="mt-2 text-[10px] font-semibold text-[#8B1E2D]">Directional lift +{item.estimatedLift}%</p></div><ChevronRight className="h-4 w-4 text-[#B7AEA8]" /></div></Link>)}</div>
      </section>
    </div>
  );
}

function Insight({ title, icon: Icon, value, copy }: { title: string; icon: LucideIcon; value: string; copy: string }) {
  return <div className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#8B1E2D]"><Icon className="h-4 w-4" />{title}</div><p className="mt-3 text-xl font-semibold">{value}</p><p className="mt-2 text-xs leading-5 text-[#756D67]">{copy}</p></div>;
}

function PhotoLab({ photos, scores, busy, onAnalyze }: { photos: Photo[]; scores: PhotoScore[]; busy: boolean; onAnalyze: () => void }) {
  const scoreMap = useMemo(() => new Map(scores.map((score) => [score.photo_id, score])), [scores]);
  return (
    <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="font-semibold">AI Photo Quality Lab</h3><p className="mt-1 text-xs text-[#827A74]">Presentation scoring for pose, lighting, approachability, composition, background, sharpness, and professionalism.</p></div><button type="button" onClick={onAnalyze} disabled={busy || photos.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B1E2D] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} Analyze gallery</button></div>
      {!photos.length ? <Empty icon={ImageIcon} title="No photos to analyze" copy="Upload profile and gallery photos first." href="/pro/photos" /> : <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{photos.map((photo, index) => {
        const score = scoreMap.get(photo.id);
        return <article key={photo.id} className="overflow-hidden rounded-2xl border border-[#EAE2DC] bg-[#FFFCFA]"><div className="relative aspect-[4/3] bg-[#EEE8E3]">{photo.url ? <img src={photo.url} alt={`Profile gallery ${index + 1}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-[#A99F98]" /></div>}{photo.is_primary && <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#8B1E2D]">Primary</span>}{score && <span className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#8B1E2D] text-sm font-bold text-white">{score.overall_score}</span>}</div><div className="p-4"><div className="flex items-center justify-between"><p className="text-sm font-semibold">Photo {index + 1}</p>{score && <span className="text-[10px] uppercase text-[#817873]">{score.analysis_mode === "vision" ? "AI Vision" : "Baseline"}</span>}</div>{score ? <><div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">{[["Lighting", score.lighting_score], ["Pose", score.pose_score], ["Smile", score.smile_score], ["Professional", score.professionalism_score]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-white px-3 py-2"><span className="text-[#817873]">{label}</span><strong className="float-right">{value}</strong></div>)}</div><p className="mt-3 text-xs leading-5 text-[#6D655F]">{score.recommendation}</p><p className="mt-2 text-[10px] font-semibold text-[#8B1E2D]">Estimated CTR direction +{score.predicted_ctr_lift_pct}%</p></> : <p className="mt-2 text-xs text-[#817873]">Run analysis to score this image.</p>}</div></article>;
      })}</div>}
      <p className="mt-5 rounded-2xl bg-[#F8F4F0] px-4 py-3 text-[11px] leading-5 text-[#756D67]">Photo analysis evaluates visible photographic presentation only. It does not infer identity, health, personality, or protected traits. Scores are guidance, not guarantees.</p>
    </section>
  );
}

function Writer({ profile, drafts, optimization, busy, onRewrite, onPreview, onApply }: { profile: Profile; drafts: Draft[]; optimization: Optimization | null; busy: string | null; onRewrite: (field: RewriteField) => void; onPreview: () => void; onApply: () => void }) {
  const fields: RewriteField[] = ["headline", "tagline", "bio", "seo_title", "seo_description"];
  const current: Record<RewriteField, string | null> = { headline: profile.headline, tagline: profile.tagline, bio: profile.bio, seo_title: profile.seo_title, seo_description: profile.seo_description };
  return <div className="space-y-4"><section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="font-semibold">AI Copywriter</h3><p className="mt-1 text-xs text-[#827A74]">DeepSeek is used first when configured, with OpenAI and Gemini fallbacks.</p></div><button type="button" onClick={onPreview} disabled={busy !== null} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B1E2D] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{busy === "optimize" ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />} Full optimization preview</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{fields.map((field) => <button key={field} type="button" onClick={() => onRewrite(field)} disabled={busy !== null} className="rounded-2xl border border-[#EAE2DC] bg-[#FFFCFA] p-4 text-left disabled:opacity-50"><div className="flex items-center justify-between"><Sparkles className="h-4 w-4 text-[#8B1E2D]" />{busy === `rewrite-${field}` && <Loader2 className="h-4 w-4 animate-spin" />}</div><p className="mt-3 text-sm font-semibold">Rewrite {FIELD_LABELS[field]}</p><p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#817873]">{current[field] || "Generate a factual suggestion."}</p></button>)}</div></section>{optimization && <section className="rounded-3xl border border-[#DDBFC3] bg-[#FFF8F8] p-5 shadow-sm"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="font-semibold text-[#6F1723]">One-click optimization preview</h3><p className="mt-1 text-xs text-[#7C6265]">Nothing changes until you explicitly approve and apply.</p></div><button type="button" onClick={onApply} disabled={busy !== null} className="inline-flex items-center gap-2 rounded-xl bg-[#8B1E2D] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{busy === "apply" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Apply approved changes</button></div><div className="mt-4 grid gap-3 lg:grid-cols-2">{Object.entries(optimization.after_state).map(([key, value]) => <div key={key} className="rounded-2xl border border-[#EAD7D9] bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B1E2D]">{FIELD_LABELS[key] || key}</p><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[#5F5554]">{Array.isArray(value) ? value.join(", ") : String(value || "")}</p></div>)}</div>{optimization.rationale && <p className="mt-4 text-xs text-[#755E60]">{optimization.rationale}</p>}</section>}<section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm"><h3 className="font-semibold">Recent suggestions</h3>{drafts.length ? <div className="mt-4 space-y-3">{drafts.slice(0, 8).map((draft) => <article key={draft.id} className="rounded-2xl border border-[#EEE7E1] bg-[#FFFCFA] p-4"><div className="flex flex-wrap justify-between gap-2"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#8B1E2D]">{FIELD_LABELS[draft.field] || draft.field}</p><span className="text-[10px] text-[#8A817B]">{draft.provider || "deterministic"} · {draft.model || "fallback"}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#4E4844]">{draft.suggested_text}</p>{draft.rationale && <p className="mt-2 text-xs text-[#817873]">{draft.rationale}</p>}</article>)}</div> : <Empty icon={Sparkles} title="No AI drafts yet" copy="Choose a field above to generate your first suggestion." />}</section></div>;
}

function Market({ analysis, city, state }: { analysis: Analysis; city: string | null; state: string | null }) {
  const metrics = [["Demand", analysis.market.demandScore ?? "—"], ["Competition", analysis.market.competitionIndex ?? "—"], ["Search volume", analysis.market.searchVolumeIndex ?? "—"], ["Profiles compared", analysis.benchmark.cityProfileCount]];
  return <div className="grid gap-4 lg:grid-cols-2"><section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm"><h3 className="flex items-center gap-2 font-semibold"><MapPin className="h-5 w-5 text-[#8B1E2D]" />{[city, state].filter(Boolean).join(", ") || "Local market"}</h3><p className="mt-1 text-xs text-[#827A74]">Dynamic city intelligence</p><div className="mt-5 grid grid-cols-2 gap-3">{metrics.map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-[#F9F5F1] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#817873]">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}</div></section><section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm"><h3 className="font-semibold">Competitor benchmark</h3><p className="mt-1 text-xs text-[#827A74]">Anonymized comparison against up to 100 profiles.</p><div className="mt-5 space-y-4">{[["Your score", analysis.scores.overall], ["City average", analysis.benchmark.cityAverageScore], ["Top 10 average", analysis.benchmark.top10AverageScore]].map(([label, value]) => <div key={String(label)}><div className="mb-1 flex justify-between text-xs"><span>{label}</span><strong>{value}</strong></div><div className="h-2 overflow-hidden rounded-full bg-[#F0EAE5]"><div className={label === "Your score" ? "h-full rounded-full bg-[#8B1E2D]" : "h-full rounded-full bg-[#BFB3AA]"} style={{ width: `${Math.min(100, Number(value))}%` }} /></div></div>)}</div><p className="mt-5 rounded-2xl bg-[#F8F4F0] px-4 py-3 text-xs leading-5 text-[#6F6761]">You are around the <strong>{analysis.benchmark.percentile}th percentile</strong> and approximately <strong>{analysis.benchmark.pointsToTop10} points</strong> from the top-10 average.</p></section><section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm lg:col-span-2"><h3 className="font-semibold">Trending local keywords</h3>{analysis.market.topKeywords.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{analysis.market.topKeywords.map((keyword, index) => <div key={keyword.keyword} className="rounded-2xl border border-[#EEE7E1] bg-[#FFFCFA] p-4"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F9EDEE] text-xs font-bold text-[#8B1E2D]">{index + 1}</span><p className="mt-3 text-sm font-semibold">{keyword.keyword}</p><p className="mt-1 text-xs text-[#817873]">Score {keyword.score} · {keyword.trend}</p></div>)}</div> : <Empty icon={Search} title="No keyword trends yet" copy="Local trends will appear as search activity is collected." />}</section></div>;
}

function Reports({ reports, busy, onGenerate }: { reports: Report[]; busy: string | null; onGenerate: (period: "weekly" | "monthly") => void }) {
  return <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="font-semibold">Executive reports</h3><p className="mt-1 text-xs text-[#827A74]">Weekly and monthly summaries grounded in profile analytics.</p></div><div className="flex gap-2"><button type="button" onClick={() => onGenerate("weekly")} disabled={busy !== null} className="rounded-xl border border-[#DAD1CA] px-3 py-2 text-xs font-semibold disabled:opacity-50">{busy === "report-weekly" ? "Generating…" : "Weekly"}</button><button type="button" onClick={() => onGenerate("monthly")} disabled={busy !== null} className="rounded-xl bg-[#8B1E2D] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{busy === "report-monthly" ? "Generating…" : "Monthly"}</button></div></div>{reports.length ? <div className="mt-5 space-y-3">{reports.map((report) => <article key={report.id} className="rounded-2xl border border-[#EEE7E1] bg-[#FFFCFA] p-4"><div className="flex flex-wrap justify-between gap-2"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8B1E2D]">{report.period_type} report</p><span className="text-[10px] text-[#8A817B]">{report.period_start} – {report.period_end}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#514B46]">{report.narrative || "Report generated."}</p></article>)}</div> : <Empty icon={BarChart3} title="No reports generated" copy="Create a weekly or monthly executive summary." />}</section>;
}

function TrustSignals({ profile }: { profile: Profile }) {
  const signals = [["ID Verified", profile.is_verified_identity], ["Phone Verified", profile.is_verified_phone], ["Email Verified", profile.is_verified_email], ["Photos Verified", profile.is_verified_photos]];
  const identityVerified = Boolean(profile.is_verified_identity);
  return <section className="rounded-3xl border border-[#E9E2DC] bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5 text-[#8B1E2D]" />Trust Signals</h3><Link href="/pro/trust" className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B1E2D] hover:underline">Manage verification <ChevronRight className="h-3.5 w-3.5" /></Link></div><p className="mt-1 text-xs text-[#827A74]">Visible verification helps clients feel confident.</p><div className="mt-4 flex flex-wrap gap-2">{signals.map(([label, complete]) => <span key={String(label)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold ${complete ? "bg-[#EDF7EF] text-[#347348]" : "bg-[#F7F2EE] text-[#756D67]"}`}>{complete ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}{label}</span>)}</div>{!identityVerified && <Link href="/pro/trust" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#8B1E2D] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(139,30,45,0.18)] transition hover:bg-[#6E1521]"><ShieldCheck className="h-4 w-4" /> Verify my ID <ArrowRight className="h-4 w-4" /></Link>}</section>;
}

function CoachPanel({ firstName, analysis, busy, message, answer, onMessage, onSend, onClose, onAction }: { firstName: string; analysis: Analysis; busy: string | null; message: string; answer: string | null; onMessage: (value: string) => void; onSend: () => void; onClose: () => void; onAction: (recommendation: Recommendation) => void }) {
  return <aside className="sticky top-0 hidden h-dvh overflow-y-auto bg-[#FBFAF8] px-4 py-5 2xl:block"><div className="rounded-3xl border border-[#E6DED7] bg-white p-4 shadow-[0_18px_50px_rgba(61,43,33,0.06)]"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#8B1E2D]" /><h2 className="text-lg font-semibold">AI Profile Coach</h2><span className="rounded-full bg-[#F9EDEE] px-2 py-0.5 text-[9px] font-bold uppercase text-[#8B1E2D]">Beta</span></div><p className="mt-1 text-xs text-[#827A74]">Your profile optimization assistant.</p></div><button type="button" onClick={onClose} aria-label="Close coach"><X className="h-4 w-4 text-[#817873]" /></button></div><div className="mt-4 rounded-2xl bg-gradient-to-br from-[#FFF8F2] to-[#FFF5F6] p-4"><p className="text-sm leading-6 text-[#504844]">Hi {firstName}! Your profile score is <strong>{analysis.scores.overall}/100</strong>. I reviewed your profile, market, and recent activity to prioritize the best next actions.</p></div><div className="mt-5 flex items-center justify-between"><h3 className="text-sm font-semibold">Your Action Plan</h3><span className="text-[10px] text-[#8A817B]">{analysis.recommendations.length} suggestions</span></div><div className="mt-3 space-y-2.5">{analysis.recommendations.slice(0, 6).map((item) => <button key={item.key} type="button" onClick={() => onAction(item)} className="flex w-full items-start gap-3 rounded-2xl border border-[#EEE7E1] bg-[#FFFCFA] p-3 text-left"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F9EDEE] text-[#8B1E2D]"><Zap className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-xs font-semibold">{item.title}</p><span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${IMPACT_CLASS[item.impact]}`}>{item.impact}</span></div><p className="mt-1 text-[10px] leading-4 text-[#817873]">{item.action}</p></div><ChevronRight className="h-4 w-4 text-[#B8AEA7]" /></button>)}</div>{answer && <div className="mt-4 rounded-2xl border border-[#E4D8D0] bg-[#FFF9F4] p-4 text-xs leading-5 text-[#5C524D]">{answer}</div>}<div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#E4DCD5] bg-white p-2"><input value={message} onChange={(event) => onMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSend(); } }} placeholder="Ask your AI coach anything…" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-xs outline-none" /><button type="button" onClick={onSend} disabled={busy !== null || !message.trim()} aria-label="Send message" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8B1E2D] text-white disabled:opacity-40">{busy === "chat" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button></div><p className="mt-2 text-center text-[9px] leading-4 text-[#9B928B]">AI suggestions and forecasts are estimates. Review changes before applying.</p></div></aside>;
}

function Empty({ icon: Icon, title, copy, href }: { icon: LucideIcon; title: string; copy: string; href?: string }) {
  return <div className="mt-5 flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCD2CA] bg-[#FCF9F6] p-6 text-center"><Icon className="h-8 w-8 text-[#B1A69E]" /><p className="mt-3 text-sm font-semibold">{title}</p><p className="mt-1 max-w-sm text-xs leading-5 text-[#817873]">{copy}</p>{href && <Link href={href} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#8B1E2D]">Continue <ArrowRight className="h-3.5 w-3.5" /></Link>}</div>;
}
