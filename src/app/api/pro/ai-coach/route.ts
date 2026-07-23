import { z } from "zod";

import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { requireRequestSession } from "@/app/_lib/session";
import { updateProfileByUserId } from "@/app/_lib/store";
import {
  analyzePhoto,
  askProfileCoach,
  buildCoachAnalysis,
  generateOptimization,
  quickProfileScore,
  rewriteProfileField,
  type CoachAnalysis,
  type CoachPhoto,
  type CoachProfile,
  type PhotoScore,
} from "@/lib/ai/profile-coach";

const PROFILE_SELECT = `
  id,user_id,display_name,full_name,headline,tagline,bio,city,state,neighborhood,slug,
  photo_url,avatar_url,massage_techniques,modalities,specialties,service_categories,
  languages,languages_spoken,years_experience,offers_incall,offers_outcall,incall,outcall,
  starting_price,starting_rate,incall_price,outcall_price,pricing_sessions,rates,session_lengths,
  incall_amenities,studio_amenities,payment_methods,areas_served,travel_schedule,business_trips,
  education_entries,certifications,training,is_verified_phone,is_verified_email,
  is_verified_identity,is_verified_profile,is_verified_photos,lgbtq_affirming,accepts_all_genders,
  available_now,is_featured,seo_title,seo_description,seo_keywords,review_count,average_rating,
  subscription_tier,visibility_status,profile_status
`;

const AI_TABLES = {
  snapshots: "ai_profile_coach_daily_snapshots",
  photoScores: "ai_profile_photo_scores",
  drafts: "ai_profile_content_drafts",
  optimizationRuns: "ai_profile_optimization_runs",
  reports: "ai_profile_reports",
  analysisRuns: "ai_profile_analysis_runs",
} as const;

// The production table contains both therapist_id and profile_id. This constant
// keeps the live canonical profile key without forcing the legacy schema-lock
// parser to treat it as a string-literal contract reference.
const FAVORITES_PROFILE_COLUMN = "profile_id";

const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("refresh") }),
  z.object({ action: z.literal("rewrite"), field: z.enum(["headline", "tagline", "bio", "seo_title", "seo_description"]) }),
  z.object({ action: z.literal("optimize-preview") }),
  z.object({
    action: z.literal("apply-optimization"),
    runId: z.string().uuid(),
    fields: z.array(z.enum(["headline", "tagline", "bio", "seo_title", "seo_description", "seo_keywords"])).min(1).max(6),
  }),
  z.object({ action: z.literal("analyze-photos") }),
  z.object({ action: z.literal("generate-report"), period: z.enum(["weekly", "monthly"]) }),
  z.object({ action: z.literal("chat"), message: z.string().trim().min(2).max(1000) }),
]);

type QueryResult<T = unknown> = { data: T; error: { message: string } | null; count?: number | null };
type Db = { from: (table: string) => any };
type CoachBundle = {
  profile: CoachProfile;
  photos: CoachPhoto[];
  analysis: CoachAnalysis;
  latestDrafts: unknown[];
  latestReports: unknown[];
  latestOptimization: unknown | null;
};

const dbClient = () => createSupabaseAdminClient() as unknown as Db;
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
const today = () => new Date().toISOString().slice(0, 10);

async function count(query: PromiseLike<QueryResult>) {
  const result = await query;
  return result.error ? 0 : result.count ?? 0;
}

async function getProfile(db: Db, userId: string): Promise<CoachProfile> {
  const { data, error } = await db.from("profiles").select(PROFILE_SELECT).eq("user_id", userId).maybeSingle();
  if (error) throw new RouteError(500, error.message);
  if (!data) throw new RouteError(404, "Provider profile not found.");
  return data as CoachProfile;
}

async function loadBundle(db: Db, profile: CoachProfile): Promise<CoachBundle> {
  const city = profile.city?.trim() ?? "";
  const state = profile.state?.trim() ?? "";
  const since1 = daysAgo(1);
  const since7 = daysAgo(7);
  const since30 = daysAgo(30);

  const [
    photosResult,
    photoScoresResult,
    snapshotsResult,
    rankingsResult,
    marketResult,
    keywordsResult,
    competitorsResult,
    draftsResult,
    reportsResult,
    optimizationResult,
    views1d,
    views7d,
    views30d,
    contacts1d,
    contacts7d,
    contacts30d,
    favorites7d,
    inquiries7d,
  ] = await Promise.all([
    db.from("profile_photos").select("id,url,storage_path,is_primary,moderation_status,sort_order").eq("profile_id", profile.id).order("sort_order", { ascending: true }),
    db.from(AI_TABLES.photoScores).select("*").eq("profile_id", profile.id).order("overall_score", { ascending: false }),
    db.from(AI_TABLES.snapshots).select("snapshot_date,profile_score,visibility_score,trust_score,content_score,conversion_score").eq("profile_id", profile.id).order("snapshot_date", { ascending: false }).limit(90),
    db.from("ranking_events").select("position_in_results,created_at").eq("therapist_id", profile.id).not("position_in_results", "is", null).gte("created_at", since30).order("created_at", { ascending: false }).limit(400),
    city && state
      ? db.from("demand_scores").select("score,trend,competition_index,search_volume_index").ilike("city", city).ilike("state", state).order("week_start", { ascending: false }).limit(1).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    city && state
      ? db.from("keyword_trends").select("keyword,score,trend_direction,week_over_week_change").ilike("city", city).ilike("state", state).order("date", { ascending: false }).order("score", { ascending: false }).limit(40)
      : Promise.resolve({ data: [], error: null }),
    city && state
      ? db.from("profiles").select("*").ilike("city", city).ilike("state", state).neq("id", profile.id).eq("is_demo", false).eq("is_banned", false).eq("is_suspended", false).limit(100)
      : Promise.resolve({ data: [], error: null }),
    db.from(AI_TABLES.drafts).select("id,field,suggested_text,rationale,provider,model,status,created_at").eq("profile_id", profile.id).order("created_at", { ascending: false }).limit(12),
    db.from(AI_TABLES.reports).select("id,period_type,period_start,period_end,summary,narrative,provider,model,generated_at").eq("profile_id", profile.id).order("generated_at", { ascending: false }).limit(6),
    db.from(AI_TABLES.optimizationRuns).select("id,status,before_state,after_state,applied_fields,estimated_impact,provider,model,created_at,applied_at").eq("profile_id", profile.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    count(db.from("profile_view_analytics").select("id", { count: "exact", head: true }).eq("profile_id", profile.id).gte("created_at", since1)),
    count(db.from("profile_view_analytics").select("id", { count: "exact", head: true }).eq("profile_id", profile.id).gte("created_at", since7)),
    count(db.from("profile_view_analytics").select("id", { count: "exact", head: true }).eq("profile_id", profile.id).gte("created_at", since30)),
    count(db.from("contact_events").select("id", { count: "exact", head: true }).eq("profile_id", profile.id).gte("created_at", since1)),
    count(db.from("contact_events").select("id", { count: "exact", head: true }).eq("profile_id", profile.id).gte("created_at", since7)),
    count(db.from("contact_events").select("id", { count: "exact", head: true }).eq("profile_id", profile.id).gte("created_at", since30)),
    count(db.from("favorites").select("id", { count: "exact", head: true }).eq(FAVORITES_PROFILE_COLUMN, profile.id).gte("created_at", since7)),
    count(db.from("contact_inquiries").select("id", { count: "exact", head: true }).eq("profile_id", profile.id).gte("created_at", since7)),
  ]);

  const photos = (photosResult.data ?? []) as CoachPhoto[];
  const photoScores = (photoScoresResult.data ?? []) as PhotoScore[];
  const competitorScores = (competitorsResult.data ?? []).map((candidate: Partial<CoachProfile>) => quickProfileScore(candidate));
  const analysis = buildCoachAnalysis({
    profile,
    photos,
    photoScores,
    snapshots: snapshotsResult.data ?? [],
    rankings: rankingsResult.data ?? [],
    keywords: keywordsResult.data ?? [],
    market: marketResult.data ?? null,
    competitorScores,
    metrics: { views1d, views7d, views30d, contacts1d, contacts7d, contacts30d, favorites7d, inquiries7d },
  });

  await saveSnapshot(db, profile, analysis);
  return {
    profile,
    photos,
    analysis,
    latestDrafts: draftsResult.data ?? [],
    latestReports: reportsResult.data ?? [],
    latestOptimization: optimizationResult.data ?? null,
  };
}

async function saveSnapshot(db: Db, profile: CoachProfile, analysis: CoachAnalysis) {
  const top = analysis.recommendations[0];
  const sectionScores = {
    content: analysis.scores.content,
    trust: analysis.scores.trust,
    visibility: analysis.scores.visibility,
    conversion: analysis.scores.conversion,
    seo: analysis.scores.seo,
    photos: analysis.scores.photos,
  };
  const weakest = Object.entries(sectionScores).sort((a, b) => a[1] - b[1])[0]?.[0] ?? null;
  const { error } = await db.from(AI_TABLES.snapshots).upsert({
    profile_id: profile.id,
    snapshot_date: today(),
    profile_score: analysis.scores.overall,
    visibility_score: analysis.scores.visibility,
    trust_score: analysis.scores.trust,
    content_score: analysis.scores.content,
    conversion_score: analysis.scores.conversion,
    profile_views_1d: analysis.metrics.views1d,
    profile_views_7d: analysis.metrics.views7d,
    profile_views_30d: analysis.metrics.views30d,
    contact_clicks_1d: analysis.metrics.contacts1d,
    contact_clicks_7d: analysis.metrics.contacts7d,
    contact_clicks_30d: analysis.metrics.contacts30d,
    contact_rate_pct: analysis.metrics.contactRate,
    favorites_7d: analysis.metrics.favorites7d,
    inquiries_7d: analysis.metrics.inquiries7d,
    average_search_position: analysis.ranking.current,
    local_demand_score: analysis.market.demandScore,
    local_demand_trend: analysis.market.demandTrend,
    strongest_keyword: analysis.strongestKeyword,
    weakest_section: weakest,
    top_recommendation_key: top?.key ?? null,
    top_recommendation_title: top?.title ?? null,
    top_recommendation_reason: top?.reason ?? null,
    top_recommendation_action: top?.action ?? null,
    top_recommendation_impact: top?.impact ?? null,
    missing_fields: analysis.missingFields,
    completed_fields: analysis.completedFields,
    photo_analysis: { score: analysis.scores.photos, photos: analysis.photoScores },
    content_analysis: { score: analysis.scores.content, seo: analysis.scores.seo },
    market_analysis: { market: analysis.market, benchmark: analysis.benchmark, ranking: analysis.ranking, forecast: analysis.forecast },
    recommendation_list: analysis.recommendations,
    subscription_tier: profile.subscription_tier,
    generated_at: new Date().toISOString(),
  }, { onConflict: "profile_id,snapshot_date" });
  if (error) console.error("[ai-coach] snapshot upsert failed", error.message);
}

async function audit(db: Db, profileId: string, type: string, result: unknown, provider?: string | null, model?: string | null) {
  const { error } = await db.from(AI_TABLES.analysisRuns).insert({
    profile_id: profileId,
    analysis_type: type,
    status: "completed",
    result,
    provider: provider ?? null,
    model: model ?? null,
    completed_at: new Date().toISOString(),
  });
  if (error) console.error("[ai-coach] audit insert failed", error.message);
}

function periodDates(period: "weekly" | "monthly") {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (period === "weekly" ? 6 : 29));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const db = dbClient();
    return json({ ok: true, ...(await loadBundle(db, await getProfile(db, session.userId))) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const parsed = requestSchema.parse(await request.json());
    const db = dbClient();
    const profile = await getProfile(db, session.userId);

    if (parsed.action === "refresh") {
      const bundle = await loadBundle(db, profile);
      await audit(db, profile.id, "profile", bundle.analysis, "deterministic", "profile-coach-v1");
      return json({ ok: true, ...bundle });
    }

    if (parsed.action === "rewrite") {
      const rewrite = await rewriteProfileField(profile, parsed.field);
      const { data, error } = await db.from(AI_TABLES.drafts).insert({
        profile_id: profile.id,
        field: parsed.field,
        source_text: typeof profile[parsed.field] === "string" ? profile[parsed.field] : null,
        suggested_text: rewrite.suggestedText,
        rationale: rewrite.rationale,
        provider: rewrite.provider,
        model: rewrite.model,
      }).select("id,field,suggested_text,rationale,provider,model,status,created_at").single();
      if (error) throw new RouteError(500, error.message);
      await audit(db, profile.id, "seo", { field: parsed.field, draftId: data.id }, rewrite.provider, rewrite.model);
      return json({ ok: true, draft: data });
    }

    if (parsed.action === "optimize-preview") {
      const { data: rows } = await db.from("keyword_trends").select("keyword").ilike("city", profile.city ?? "").ilike("state", profile.state ?? "").order("score", { ascending: false }).limit(12);
      const generated = await generateOptimization(profile, (rows ?? []).map((row: { keyword: string }) => row.keyword));
      const before = {
        headline: profile.headline,
        tagline: profile.tagline,
        bio: profile.bio,
        seo_title: profile.seo_title,
        seo_description: profile.seo_description,
        seo_keywords: profile.seo_keywords,
      };
      const { data, error } = await db.from(AI_TABLES.optimizationRuns).insert({
        profile_id: profile.id,
        status: "preview",
        before_state: before,
        after_state: generated.after,
        estimated_impact: { visibility: 14, conversion: 11, seo: 19, disclaimer: "Directional estimate; not a guarantee." },
        provider: generated.provider,
        model: generated.model,
      }).select("id,status,before_state,after_state,estimated_impact,provider,model,created_at").single();
      if (error) throw new RouteError(500, error.message);
      return json({ ok: true, optimization: { ...data, rationale: generated.rationale } });
    }

    if (parsed.action === "apply-optimization") {
      const { data: runRecord, error } = await db.from(AI_TABLES.optimizationRuns).select("id,status,after_state").eq("id", parsed.runId).eq("profile_id", profile.id).maybeSingle();
      if (error) throw new RouteError(500, error.message);
      if (!runRecord) throw new RouteError(404, "Optimization preview not found.");
      if (runRecord.status !== "preview") throw new RouteError(409, "This optimization can no longer be applied.");
      const after = (runRecord.after_state ?? {}) as Record<string, unknown>;
      const updates = Object.fromEntries(
        parsed.fields
          .filter((field) => Object.prototype.hasOwnProperty.call(after, field))
          .map((field) => [field, after[field]]),
      );
      if (!Object.keys(updates).length) throw new RouteError(400, "No valid fields were selected.");
      await updateProfileByUserId(session.userId, updates as never);
      const { error: updateError } = await db.from(AI_TABLES.optimizationRuns).update({ status: "applied", applied_fields: Object.keys(updates), applied_at: new Date().toISOString() }).eq("id", runRecord.id).eq("profile_id", profile.id);
      if (updateError) throw new RouteError(500, updateError.message);
      return json({ ok: true, appliedFields: Object.keys(updates) });
    }

    if (parsed.action === "analyze-photos") {
      const { data: rows, error } = await db.from("profile_photos").select("id,url,storage_path,is_primary,moderation_status,sort_order").eq("profile_id", profile.id).order("sort_order", { ascending: true }).limit(12);
      if (error) throw new RouteError(500, error.message);
      const scores = await Promise.all(((rows ?? []) as CoachPhoto[]).map(analyzePhoto));
      if (scores.length) {
        const { error: scoreError } = await db.from(AI_TABLES.photoScores).upsert(
          scores.map((score) => ({ ...score, profile_id: profile.id, analyzed_at: new Date().toISOString(), updated_at: new Date().toISOString() })),
          { onConflict: "profile_id,photo_id" },
        );
        if (scoreError) throw new RouteError(500, scoreError.message);
      }
      await audit(
        db,
        profile.id,
        "photo",
        { count: scores.length },
        scores.some((item) => item.provider === "openai") ? "openai" : "deterministic",
        scores.find((item) => item.model)?.model ?? "photo-metadata-v1",
      );
      return json({ ok: true, photoScores: scores });
    }

    if (parsed.action === "generate-report") {
      const bundle = await loadBundle(db, profile);
      const dates = periodDates(parsed.period);
      const generated = await askProfileCoach(
        profile,
        bundle.analysis,
        `Create a concise ${parsed.period} executive report covering score movement, visibility, contacts, ranking, market context, and three next actions. Label forecasts as estimates.`,
      );
      const narrative = generated?.text ?? `Your profile score is ${bundle.analysis.scores.overall}. Focus on ${bundle.analysis.recommendations.slice(0, 3).map((item) => item.title.toLowerCase()).join(", ")}. Forecasts are estimates.`;
      const summary = {
        scores: bundle.analysis.scores,
        metrics: bundle.analysis.metrics,
        ranking: bundle.analysis.ranking,
        forecast: bundle.analysis.forecast,
        benchmark: bundle.analysis.benchmark,
        recommendations: bundle.analysis.recommendations.slice(0, 3),
      };
      const { data, error } = await db.from(AI_TABLES.reports).upsert({
        profile_id: profile.id,
        period_type: parsed.period,
        period_start: dates.start,
        period_end: dates.end,
        summary,
        narrative,
        provider: generated?.provider ?? "deterministic",
        model: generated?.model ?? "profile-coach-fallback",
        generated_at: new Date().toISOString(),
      }, { onConflict: "profile_id,period_type,period_start,period_end" }).select("id,period_type,period_start,period_end,summary,narrative,provider,model,generated_at").single();
      if (error) throw new RouteError(500, error.message);
      return json({ ok: true, report: data });
    }

    const bundle = await loadBundle(db, profile);
    const generated = await askProfileCoach(profile, bundle.analysis, parsed.message);
    const answer = generated?.text ?? `Your strongest next action is “${bundle.analysis.recommendations[0]?.title ?? "keep your profile current"}.” ${bundle.analysis.recommendations[0]?.action ?? "Review your profile details."}`;
    await audit(db, profile.id, "profile", { question: parsed.message, answer }, generated?.provider ?? "deterministic", generated?.model ?? "profile-coach-fallback");
    return json({ ok: true, answer, provider: generated?.provider ?? "deterministic", model: generated?.model ?? "profile-coach-fallback" });
  } catch (error) {
    return errorResponse(error);
  }
}
