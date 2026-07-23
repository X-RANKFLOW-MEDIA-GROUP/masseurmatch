import { envAny } from "@/app/api/_lib/env";
import { chatMessages, completeText, OPENAI_MODEL, type LlmResult } from "@/lib/ai/llm";

export type CoachImpact = "high" | "medium" | "low";

export type CoachProfile = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  headline: string | null;
  tagline: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  slug: string | null;
  photo_url: string | null;
  avatar_url: string | null;
  massage_techniques: string[] | null;
  modalities: string[] | null;
  specialties: string[] | null;
  service_categories: string[] | null;
  languages: string[] | null;
  languages_spoken: string[] | null;
  years_experience: number | null;
  offers_incall: boolean | null;
  offers_outcall: boolean | null;
  incall: boolean | null;
  outcall: boolean | null;
  starting_price: number | null;
  starting_rate: number | null;
  incall_price: number | null;
  outcall_price: number | null;
  pricing_sessions: unknown;
  rates: unknown;
  session_lengths: number[] | null;
  incall_amenities: string[] | null;
  studio_amenities: string[] | null;
  payment_methods: string[] | null;
  areas_served: string[] | null;
  travel_schedule: unknown;
  business_trips: unknown;
  education_entries: unknown;
  certifications: string | null;
  training: string | null;
  is_verified_phone: boolean | null;
  is_verified_email: boolean | null;
  is_verified_identity: boolean | null;
  is_verified_profile: boolean | null;
  is_verified_photos: boolean | null;
  lgbtq_affirming: boolean | null;
  accepts_all_genders: boolean | null;
  available_now: boolean | null;
  is_featured: boolean | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  review_count: number | null;
  average_rating: number | string | null;
  subscription_tier: string | null;
  visibility_status: string | null;
  profile_status: string | null;
};

export type CoachPhoto = {
  id: string;
  url: string | null;
  storage_path: string | null;
  is_primary: boolean | null;
  moderation_status: string | null;
  sort_order: number | null;
};

export type PhotoScore = {
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

export type CoachRecommendation = {
  key: string;
  title: string;
  reason: string;
  action: string;
  impact: CoachImpact;
  href: string;
  estimatedLift: number;
};

export type CoachAnalysis = {
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
  recommendations: CoachRecommendation[];
  missingFields: string[];
  completedFields: string[];
  strongestKeyword: string | null;
  photoScores: PhotoScore[];
  history: Array<{ date: string; overall: number; visibility: number; trust: number; content: number; conversion: number }>;
};

type Snapshot = {
  snapshot_date: string;
  profile_score: number;
  visibility_score: number;
  trust_score: number;
  content_score: number;
  conversion_score: number;
};

type RankingEvent = { position_in_results: number | null; created_at: string | null };
type KeywordTrend = { keyword: string; score: number; trend_direction: string | null; week_over_week_change: number | null };
type MarketRow = { score: number; trend: string; competition_index: number; search_volume_index: number } | null;
type Metrics = {
  views1d: number;
  views7d: number;
  views30d: number;
  contacts1d: number;
  contacts7d: number;
  contacts30d: number;
  favorites7d: number;
  inquiries7d: number;
};

type AnalysisInput = {
  profile: CoachProfile;
  photos: CoachPhoto[];
  photoScores: PhotoScore[];
  snapshots: Snapshot[];
  rankings: RankingEvent[];
  keywords: KeywordTrend[];
  market: MarketRow;
  metrics: Metrics;
  competitorScores: number[];
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));
const listLength = (value: unknown) => (Array.isArray(value) ? value.length : 0);
const hasText = (value: unknown, min = 1) => typeof value === "string" && value.trim().length >= min;
const hasValue = (value: unknown) => value !== null && value !== undefined;

export function quickProfileScore(profile: Partial<CoachProfile>, approvedPhotoCount = 0): number {
  let points = 0;
  points += hasText(profile.headline, 25) ? 10 : 0;
  points += hasText(profile.tagline, 15) ? 5 : 0;
  points += hasText(profile.bio, 250) ? 15 : hasText(profile.bio, 100) ? 8 : 0;
  points += listLength(profile.massage_techniques) + listLength(profile.modalities) >= 3 ? 10 : 4;
  points += listLength(profile.languages) + listLength(profile.languages_spoken) >= 1 ? 5 : 0;
  points += (profile.years_experience ?? 0) > 0 ? 5 : 0;
  points += approvedPhotoCount >= 3 ? 10 : approvedPhotoCount > 0 ? 5 : 0;
  points += profile.is_verified_identity ? 8 : 0;
  points += profile.is_verified_phone ? 4 : 0;
  points += profile.is_verified_email ? 3 : 0;
  points += hasText(profile.city) && hasText(profile.state) ? 5 : 0;
  points += hasValue(profile.starting_price) || hasValue(profile.starting_rate) || hasValue(profile.incall_price) ? 5 : 0;
  points += listLength(profile.areas_served) > 0 ? 3 : 0;
  points += profile.available_now ? 2 : 0;
  return clamp(points);
}

function scoreProfile(profile: CoachProfile, approvedPhotoCount: number, avgPhotoScore: number) {
  const completed: string[] = [];
  const missing: string[] = [];
  const mark = (ok: boolean, key: string) => (ok ? completed.push(key) : missing.push(key));

  const techniqueCount = new Set([
    ...(profile.massage_techniques ?? []),
    ...(profile.modalities ?? []),
    ...(profile.specialties ?? []),
  ]).size;
  const languageCount = new Set([...(profile.languages ?? []), ...(profile.languages_spoken ?? [])]).size;
  const amenities = new Set([...(profile.incall_amenities ?? []), ...(profile.studio_amenities ?? [])]).size;
  const hasPricing = [profile.starting_price, profile.starting_rate, profile.incall_price, profile.outcall_price].some(hasValue)
    || hasValue(profile.pricing_sessions)
    || hasValue(profile.rates);
  const hasCredentials = listLength(profile.education_entries) > 0 || hasText(profile.certifications) || hasText(profile.training);

  mark(hasText(profile.headline, 25), "headline");
  mark(hasText(profile.tagline, 15), "tagline");
  mark(hasText(profile.bio, 250), "bio");
  mark(techniqueCount >= 3, "techniques");
  mark(languageCount > 0, "languages");
  mark((profile.years_experience ?? 0) > 0, "experience");
  mark(hasCredentials, "credentials");
  mark(approvedPhotoCount >= 3, "gallery");
  mark(Boolean(profile.is_verified_identity), "identity_verification");
  mark(Boolean(profile.is_verified_photos), "photo_verification");
  mark(Boolean(profile.is_verified_phone), "phone_verification");
  mark(hasPricing, "pricing");
  mark(amenities > 0, "amenities");
  mark((profile.areas_served?.length ?? 0) > 0, "areas_served");
  mark(hasText(profile.neighborhood), "neighborhood");
  mark((profile.payment_methods?.length ?? 0) > 0, "payment_methods");

  const content = clamp(
    (hasText(profile.headline, 25) ? 18 : 5)
      + (hasText(profile.tagline, 15) ? 8 : 0)
      + (hasText(profile.bio, 250) ? 28 : hasText(profile.bio, 100) ? 15 : 0)
      + Math.min(18, techniqueCount * 4)
      + Math.min(8, languageCount * 4)
      + ((profile.years_experience ?? 0) > 0 ? 10 : 0)
      + (hasCredentials ? 10 : 0),
  );
  const trust = clamp(
    (profile.is_verified_identity ? 25 : 0)
      + (profile.is_verified_photos ? 18 : 0)
      + (profile.is_verified_phone ? 12 : 0)
      + (profile.is_verified_email ? 10 : 0)
      + Math.min(15, approvedPhotoCount * 5)
      + ((profile.review_count ?? 0) > 0 ? 10 : 0)
      + (profile.lgbtq_affirming || profile.accepts_all_genders ? 10 : 0),
  );
  const visibility = clamp(
    (hasText(profile.city) && hasText(profile.state) ? 20 : 0)
      + (hasText(profile.neighborhood) ? 10 : 0)
      + Math.min(15, (profile.areas_served?.length ?? 0) * 4)
      + (profile.offers_incall || profile.incall ? 10 : 0)
      + (profile.offers_outcall || profile.outcall ? 10 : 0)
      + (profile.available_now ? 15 : 0)
      + (profile.is_featured ? 10 : 0)
      + (hasText(profile.slug) ? 10 : 0),
  );
  const conversion = clamp(
    (hasPricing ? 25 : 0)
      + ((profile.session_lengths?.length ?? 0) > 0 ? 10 : 0)
      + (amenities > 0 ? 15 : 0)
      + ((profile.payment_methods?.length ?? 0) > 0 ? 10 : 0)
      + (hasText(profile.bio, 250) ? 15 : 5)
      + (approvedPhotoCount >= 3 ? 15 : 5)
      + ((profile.review_count ?? 0) > 0 ? 10 : 0),
  );
  const seoKeywordCount = new Set([...(profile.seo_keywords ?? []), ...(profile.massage_techniques ?? []), ...(profile.modalities ?? [])]).size;
  const seo = clamp(
    (hasText(profile.seo_title, 30) ? 25 : 0)
      + (hasText(profile.seo_description, 100) ? 25 : 0)
      + Math.min(25, seoKeywordCount * 4)
      + (hasText(profile.headline, 25) ? 15 : 0)
      + (hasText(profile.city) && hasText(profile.state) ? 10 : 0),
  );
  const photos = approvedPhotoCount === 0 ? 0 : clamp(avgPhotoScore || Math.min(88, 48 + approvedPhotoCount * 8));
  const completion = clamp((completed.length / (completed.length + missing.length)) * 100);
  const overall = clamp(content * 0.22 + trust * 0.2 + visibility * 0.18 + conversion * 0.16 + seo * 0.14 + photos * 0.1);

  return { content, trust, visibility, conversion, seo, photos, completion, overall, completed, missing };
}

function buildRecommendations(profile: CoachProfile, scores: ReturnType<typeof scoreProfile>, approvedPhotoCount: number): CoachRecommendation[] {
  const items: CoachRecommendation[] = [];
  const add = (item: CoachRecommendation) => items.push(item);

  if (!hasText(profile.headline, 25)) add({ key: "headline", title: "Improve your headline", reason: "Your headline is missing or too generic to communicate value in search results.", action: "Use a specialty + benefit + city headline.", impact: "high", href: "/pro/listing", estimatedLift: 18 });
  if (!hasText(profile.bio, 250)) add({ key: "bio", title: "Strengthen your bio", reason: "Clients need more detail before they feel ready to contact you.", action: "Add your approach, experience, techniques, and what a client can expect.", impact: "high", href: "/pro/listing", estimatedLift: 16 });
  if (approvedPhotoCount < 3) add({ key: "photos", title: "Add verified photos", reason: `Your profile has ${approvedPhotoCount} approved photo${approvedPhotoCount === 1 ? "" : "s"}.`, action: "Upload at least three clear, current, varied photos.", impact: "high", href: "/pro/photos", estimatedLift: 15 });
  if (!profile.is_verified_identity || !profile.is_verified_photos) add({ key: "trust", title: "Complete trust verification", reason: "Verified identity and photos help clients feel confident before contacting you.", action: "Complete the remaining verification steps.", impact: "high", href: "/pro/settings", estimatedLift: 13 });
  if (![profile.starting_price, profile.starting_rate, profile.incall_price, profile.outcall_price].some(hasValue) && !hasValue(profile.pricing_sessions) && !hasValue(profile.rates)) add({ key: "pricing", title: "Publish clear rates", reason: "Missing rates can reduce qualified contacts and increase abandoned visits.", action: "Add session duration and incall/outcall starting rates.", impact: "high", href: "/pro/rates", estimatedLift: 12 });
  if ((profile.incall_amenities?.length ?? 0) + (profile.studio_amenities?.length ?? 0) === 0) add({ key: "amenities", title: "Clarify your amenities", reason: "Clients want to know what is available before they reach out.", action: "Add parking, shower, table setup, and other relevant amenities.", impact: "medium", href: "/pro/listing", estimatedLift: 8 });
  if ((profile.areas_served?.length ?? 0) === 0 || !hasText(profile.neighborhood)) add({ key: "local", title: "Improve local visibility", reason: "Neighborhood and service-area details improve relevance in nearby searches.", action: "Add your neighborhood and service areas without publishing an exact address.", impact: "medium", href: "/pro/listing", estimatedLift: 9 });
  if (!profile.available_now) add({ key: "availability", title: "Refresh availability", reason: "Fresh availability signals can increase engagement from clients ready to contact now.", action: "Update your hours or activate Available Now when appropriate.", impact: "medium", href: "/pro/growth", estimatedLift: 7 });
  if (scores.seo < 75) add({ key: "seo", title: "Improve profile SEO", reason: "Your profile is missing search-friendly title, description, or keyword coverage.", action: "Generate an SEO-focused version using the AI writer.", impact: "medium", href: "/pro/ai-coach?tab=writer", estimatedLift: 11 });

  if (items.length === 0) add({ key: "maintain", title: "Keep your profile fresh", reason: "Your profile is in strong condition.", action: "Review availability and add one recent photo this month.", impact: "low", href: "/pro/photos", estimatedLift: 3 });
  const order: Record<CoachImpact, number> = { high: 0, medium: 1, low: 2 };
  return items.sort((a, b) => order[a.impact] - order[b.impact] || b.estimatedLift - a.estimatedLift).slice(0, 8);
}

function rankingInsight(rankings: RankingEvent[]) {
  const valid = rankings.filter((row) => row.position_in_results && row.created_at);
  if (!valid.length) return { current: null, previous: null, change: null, explanation: "Ranking history will appear after your profile is shown in search results." };
  const grouped = new Map<string, number[]>();
  valid.forEach((row) => {
    const date = String(row.created_at).slice(0, 10);
    grouped.set(date, [...(grouped.get(date) ?? []), Number(row.position_in_results)]);
  });
  const dates = [...grouped.keys()].sort().reverse();
  const average = (values: number[]) => Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length));
  const current = average(grouped.get(dates[0]) ?? []);
  const previous = dates[1] ? average(grouped.get(dates[1]) ?? []) : null;
  const change = previous === null ? null : previous - current;
  const explanation = change === null
    ? `Your current average search position is #${current}. More history is needed to explain movement.`
    : change > 0
      ? `You gained ${change} position${change === 1 ? "" : "s"}, supported by stronger profile freshness and relevance signals.`
      : change < 0
        ? `You lost ${Math.abs(change)} position${Math.abs(change) === 1 ? "" : "s"}. Common causes are fresher nearby profiles, stronger verification, new photos, or a temporary demand shift.`
        : `Your average position held steady at #${current}. Completing a high-impact task is the clearest next move.`;
  return { current, previous, change, explanation };
}

function forecast(metrics: Metrics, history: Snapshot[]) {
  const recentDailyContacts = metrics.contacts7d / 7;
  const monthlyDailyContacts = metrics.contacts30d / 30;
  const velocity = recentDailyContacts > 0 ? recentDailyContacts : monthlyDailyContacts;
  const scoreTrend = history.length > 1 ? history[0].profile_score - history[Math.min(history.length - 1, 6)].profile_score : 0;
  const trendFactor = Math.max(0.75, Math.min(1.35, 1 + scoreTrend / 100));
  const likely = Math.max(0, Math.round(velocity * 7 * trendFactor));
  const viewsLikely = Math.max(metrics.views7d, Math.round((metrics.views30d / 30) * 7 * trendFactor));
  const sample = metrics.views30d + metrics.contacts30d;
  const confidence = clamp(45 + Math.min(35, sample / 4) + Math.min(15, history.length * 2), 45, 92);
  return {
    contactsLow: Math.max(0, Math.floor(likely * 0.72)),
    contactsLikely: likely,
    contactsHigh: Math.max(likely, Math.ceil(likely * 1.32)),
    viewsLikely,
    confidence,
  };
}

export function buildCoachAnalysis(input: AnalysisInput): CoachAnalysis {
  const approvedPhotos = input.photos.filter((photo) => photo.moderation_status === "approved");
  const avgPhotoScore = input.photoScores.length
    ? input.photoScores.reduce((sum, item) => sum + item.overall_score, 0) / input.photoScores.length
    : 0;
  const scores = scoreProfile(input.profile, approvedPhotos.length, avgPhotoScore);
  const contactRate = input.metrics.views7d > 0 ? Number(((input.metrics.contacts7d / input.metrics.views7d) * 100).toFixed(1)) : 0;
  const sortedCompetitors = input.competitorScores.filter(Number.isFinite).sort((a, b) => b - a).slice(0, 100);
  const cityAverageScore = sortedCompetitors.length ? Math.round(sortedCompetitors.reduce((a, b) => a + b, 0) / sortedCompetitors.length) : scores.overall;
  const top10 = sortedCompetitors.slice(0, 10);
  const top10AverageScore = top10.length ? Math.round(top10.reduce((a, b) => a + b, 0) / top10.length) : scores.overall;
  const below = sortedCompetitors.filter((value) => value <= scores.overall).length;
  const percentile = sortedCompetitors.length ? clamp((below / sortedCompetitors.length) * 100, 1, 99) : 50;
  const topKeywords = input.keywords
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((row) => ({ keyword: row.keyword, score: row.score, trend: row.trend_direction ?? (row.week_over_week_change && row.week_over_week_change > 0 ? "up" : "stable") }));
  const strongestKeyword = topKeywords[0]?.keyword ?? null;

  return {
    scores: {
      overall: scores.overall,
      completion: scores.completion,
      content: scores.content,
      trust: scores.trust,
      visibility: scores.visibility,
      conversion: scores.conversion,
      seo: scores.seo,
      photos: scores.photos,
    },
    metrics: { ...input.metrics, contactRate },
    ranking: rankingInsight(input.rankings),
    forecast: forecast(input.metrics, input.snapshots),
    market: {
      demandScore: input.market?.score ?? null,
      demandTrend: input.market?.trend ?? "stable",
      competitionIndex: input.market?.competition_index ?? null,
      searchVolumeIndex: input.market?.search_volume_index ?? null,
      topKeywords,
    },
    benchmark: {
      cityProfileCount: sortedCompetitors.length,
      cityAverageScore,
      top10AverageScore,
      percentile,
      pointsToTop10: Math.max(0, top10AverageScore - scores.overall),
    },
    recommendations: buildRecommendations(input.profile, scores, approvedPhotos.length),
    missingFields: scores.missing,
    completedFields: scores.completed,
    strongestKeyword,
    photoScores: input.photoScores,
    history: input.snapshots
      .slice()
      .reverse()
      .map((row) => ({
        date: row.snapshot_date,
        overall: row.profile_score,
        visibility: row.visibility_score,
        trust: row.trust_score,
        content: row.content_score,
        conversion: row.conversion_score,
      })),
  };
}

function fallbackRewrite(profile: CoachProfile, field: string) {
  const firstTechnique = profile.massage_techniques?.[0] ?? profile.modalities?.[0] ?? profile.specialties?.[0] ?? "Professional Massage";
  const secondTechnique = profile.massage_techniques?.[1] ?? profile.modalities?.[1] ?? "Bodywork";
  const location = [profile.city, profile.state].filter(Boolean).join(", ") || "your area";
  const years = profile.years_experience ? `${profile.years_experience} years of experience` : "an experienced approach";
  if (field === "headline") return `${firstTechnique} & ${secondTechnique} Massage in ${location}`;
  if (field === "tagline") return `Personalized bodywork focused on comfort, recovery, and genuine care.`;
  if (field === "seo_title") return `${firstTechnique} Massage Therapist in ${location} | MasseurMatch`;
  if (field === "seo_description") return `Discover personalized ${firstTechnique.toLowerCase()} and ${secondTechnique.toLowerCase()} sessions in ${location}. View services, rates, availability, and contact details.`;
  return `I offer personalized ${firstTechnique.toLowerCase()} and ${secondTechnique.toLowerCase()} sessions in ${location}, backed by ${years}. Each session is tailored to your goals, preferred pressure, and comfort. My approach is professional, welcoming, and focused on helping you relax, recover, and feel your best. Review my services, rates, and availability, then contact me directly to plan your session.`;
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  try {
    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function rewriteProfileField(profile: CoachProfile, field: "headline" | "tagline" | "bio" | "seo_title" | "seo_description") {
  const fallback = fallbackRewrite(profile, field);
  const result = await completeText({
    system: "You are the MasseurMatch AI Profile Coach. Write professional, inclusive, non-sexual massage directory copy. Do not invent licenses, credentials, reviews, medical claims, bookings, or guarantees. Return strict JSON with suggested_text and rationale.",
    user: JSON.stringify({
      task: `Rewrite the provider ${field}`,
      constraints: field === "headline" ? "Maximum 70 characters" : field === "tagline" ? "Maximum 120 characters" : field === "bio" ? "220-420 words, warm and natural" : field === "seo_title" ? "Maximum 60 characters" : "Maximum 155 characters",
      profile: {
        name: profile.display_name ?? profile.full_name,
        city: profile.city,
        state: profile.state,
        techniques: profile.massage_techniques ?? profile.modalities ?? profile.specialties,
        experience: profile.years_experience,
        languages: profile.languages ?? profile.languages_spoken,
        incall: profile.offers_incall ?? profile.incall,
        outcall: profile.offers_outcall ?? profile.outcall,
        current: profile[field],
      },
    }),
    json: true,
    temperature: 0.55,
    maxTokens: field === "bio" ? 700 : 240,
    timeoutMs: 12000,
  });
  const parsed = result ? parseJsonObject(result.text) : null;
  const suggestedText = typeof parsed?.suggested_text === "string" && parsed.suggested_text.trim() ? parsed.suggested_text.trim() : fallback;
  const rationale = typeof parsed?.rationale === "string" ? parsed.rationale.trim() : "Improves clarity, local relevance, and client confidence.";
  return { suggestedText, rationale, provider: result?.provider ?? "deterministic", model: result?.model ?? "profile-coach-fallback" };
}

export async function generateOptimization(profile: CoachProfile, keywords: string[]) {
  const fallback = {
    headline: fallbackRewrite(profile, "headline"),
    tagline: fallbackRewrite(profile, "tagline"),
    bio: fallbackRewrite(profile, "bio"),
    seo_title: fallbackRewrite(profile, "seo_title"),
    seo_description: fallbackRewrite(profile, "seo_description"),
    seo_keywords: [...new Set([...(profile.massage_techniques ?? []), ...(profile.modalities ?? []), ...keywords])].slice(0, 12),
  };
  const result = await completeText({
    system: "You are the MasseurMatch AI Profile Coach. Optimize massage-provider profiles for clarity, trust, conversion, and local SEO. Keep copy professional, inclusive, non-sexual, natural, and factual. Never invent credentials, licensure, testimonials, or medical outcomes. Return strict JSON only.",
    user: JSON.stringify({
      task: "Create a complete optimization preview",
      required_keys: ["headline", "tagline", "bio", "seo_title", "seo_description", "seo_keywords", "rationale"],
      profile,
      local_keywords: keywords.slice(0, 12),
      limits: { headline: 70, tagline: 120, bio_words: "220-420", seo_title: 60, seo_description: 155, seo_keywords: 12 },
    }),
    json: true,
    temperature: 0.55,
    maxTokens: 1200,
    timeoutMs: 16000,
  });
  const parsed = result ? parseJsonObject(result.text) : null;
  const after = {
    headline: typeof parsed?.headline === "string" ? parsed.headline.trim().slice(0, 160) : fallback.headline,
    tagline: typeof parsed?.tagline === "string" ? parsed.tagline.trim().slice(0, 200) : fallback.tagline,
    bio: typeof parsed?.bio === "string" ? parsed.bio.trim().slice(0, 4000) : fallback.bio,
    seo_title: typeof parsed?.seo_title === "string" ? parsed.seo_title.trim().slice(0, 120) : fallback.seo_title,
    seo_description: typeof parsed?.seo_description === "string" ? parsed.seo_description.trim().slice(0, 240) : fallback.seo_description,
    seo_keywords: Array.isArray(parsed?.seo_keywords) ? parsed.seo_keywords.filter((value): value is string => typeof value === "string").slice(0, 12) : fallback.seo_keywords,
  };
  return {
    after,
    rationale: typeof parsed?.rationale === "string" ? parsed.rationale : "A coordinated rewrite improves profile clarity, keyword coverage, and conversion readiness.",
    provider: result?.provider ?? "deterministic",
    model: result?.model ?? "profile-coach-fallback",
  };
}

export async function askProfileCoach(profile: CoachProfile, analysis: CoachAnalysis, message: string): Promise<LlmResult> {
  return chatMessages([
    {
      role: "system",
      content: "You are the MasseurMatch AI Profile Coach. Give concise, practical, professional, non-sexual advice grounded only in the supplied profile data. Do not promise rankings, contacts, bookings, or revenue. Clarify that forecasts are estimates. Never recommend publishing exact home addresses.",
    },
    {
      role: "user",
      content: JSON.stringify({ profile, analysis, question: message }),
    },
  ], { temperature: 0.55, maxTokens: 520, timeoutMs: 14000 });
}

function metadataPhotoScore(photo: CoachPhoto, index: number): PhotoScore {
  const approved = photo.moderation_status === "approved";
  const primary = Boolean(photo.is_primary);
  const base = approved ? 68 : 48;
  const overall = clamp(base + (primary ? 8 : 0) + Math.max(0, 5 - index) * 2, 35, 88);
  return {
    photo_id: photo.id,
    overall_score: overall,
    pose_score: clamp(overall - 2),
    lighting_score: clamp(overall - 5),
    smile_score: clamp(overall - 4),
    composition_score: clamp(overall),
    background_score: clamp(overall - 6),
    professionalism_score: clamp(overall + 3),
    sharpness_score: clamp(overall - 3),
    thumbnail_score: clamp(overall + (primary ? 4 : 0)),
    predicted_ctr_lift_pct: Math.max(0, Number(((overall - 60) * 0.35).toFixed(1))),
    recommended_primary: primary || index === 0,
    strengths: approved ? ["Approved for profile use", primary ? "Currently selected as primary" : "Adds gallery variety"].filter(Boolean) as string[] : ["Available for review"],
    improvements: ["Run AI Vision for pose, lighting, expression, and background scoring"],
    recommendation: approved ? "Keep the image current, clear, and visually distinct from the rest of the gallery." : "Complete moderation before using this image as a primary profile photo.",
    analysis_mode: "metadata",
    provider: null,
    model: null,
  };
}

export async function analyzePhoto(photo: CoachPhoto, index: number): Promise<PhotoScore> {
  const imageUrl = photo.url;
  const apiKey = envAny(["OPENAI_API_KEY"], "");
  if (!apiKey || !imageUrl) return metadataPhotoScore(photo, index);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        max_tokens: 650,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You evaluate profile-photo presentation quality for a professional massage-provider directory. Assess only visible photographic qualities. Do not infer identity, ethnicity, health, personality, sexual content, or protected traits. Return JSON with integer scores 0-100 for overall, pose, lighting, smile_or_approachability, composition, background, professionalism, sharpness, thumbnail; numeric predicted_ctr_lift_pct; arrays strengths and improvements; recommendation; recommended_primary boolean.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this profile photo for professional directory presentation." },
              { type: "image_url", image_url: { url: imageUrl, detail: "low" } },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) return metadataPhotoScore(photo, index);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const parsed = parseJsonObject(payload.choices?.[0]?.message?.content ?? "");
    if (!parsed) return metadataPhotoScore(photo, index);
    const score = (key: string, fallback: number) => clamp(typeof parsed[key] === "number" ? Number(parsed[key]) : fallback);
    const fallback = metadataPhotoScore(photo, index);
    return {
      photo_id: photo.id,
      overall_score: score("overall", fallback.overall_score),
      pose_score: score("pose", fallback.pose_score),
      lighting_score: score("lighting", fallback.lighting_score),
      smile_score: score("smile_or_approachability", fallback.smile_score),
      composition_score: score("composition", fallback.composition_score),
      background_score: score("background", fallback.background_score),
      professionalism_score: score("professionalism", fallback.professionalism_score),
      sharpness_score: score("sharpness", fallback.sharpness_score),
      thumbnail_score: score("thumbnail", fallback.thumbnail_score),
      predicted_ctr_lift_pct: typeof parsed.predicted_ctr_lift_pct === "number" ? Number(parsed.predicted_ctr_lift_pct.toFixed(1)) : fallback.predicted_ctr_lift_pct,
      recommended_primary: Boolean(parsed.recommended_primary),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.filter((value): value is string => typeof value === "string").slice(0, 5) : fallback.strengths,
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.filter((value): value is string => typeof value === "string").slice(0, 5) : fallback.improvements,
      recommendation: typeof parsed.recommendation === "string" ? parsed.recommendation : fallback.recommendation,
      analysis_mode: "vision",
      provider: "openai",
      model: OPENAI_MODEL,
    };
  } catch {
    return metadataPhotoScore(photo, index);
  } finally {
    clearTimeout(timer);
  }
}
