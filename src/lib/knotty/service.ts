import { completeText } from "@/lib/ai/llm";
import { getPublicTherapists } from "@/app/_lib/directory";
import { sanitizeText } from "@/app/_lib/security";
import { getRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { envAny } from "@/app/api/_lib/env";
import { getKnottyFaqAnswer } from "@/lib/knotty/faq";
import { runKnottyGuardrails } from "@/lib/knotty/guardrails";
import { detectKnottyIntent } from "@/lib/knotty/intent";
import { isKnottyLearningEnabled, loadLearningScores } from "@/lib/knotty/learning";
import { rankKnottyCandidates, toKnottyRecommendations } from "@/lib/knotty/ranking";
import { persistRankingEvents } from "@/lib/knotty/server-events";
import type {
  KnottyCandidate,
  KnottyContext,
  KnottyIntent,
  KnottyQuickAction,
  KnottyRequestPayload,
  KnottyResponsePayload,
} from "@/lib/knotty/types";

const PROFILE_SELECT = [
  "id",
  "slug",
  "display_name",
  "full_name",
  "_tier",
  "city",
  "neighborhood_name",
  "primary_area",
  "avatar_url",
  "bio",
  "specialties",
  "modality",
  "incall_price",
  "outcall_price",
  "available_now",
  "available_now_expires",
  "is_verified_identity",
  "is_verified_profile",
  "years_experience",
  "start_year",
  "training",
  "latitude",
  "longitude",
  "boost_score",
  "outcall_radius_miles",
  "travel_schedule",
  "height_inches",
  "weight_lb",
  "body_type",
  "featured_until",
].join(", ");

const QUICK_ACTION_MESSAGES: Record<KnottyQuickAction, string> = {
  available_now: "Find Available Now",
  mobile: "Find Mobile Massage",
  verified: "Show Verified",
  help_choose: "Help Me Choose",
};

function normalizeContext(context: KnottyContext | undefined) {
  const query = context?.pageQuery ? new URLSearchParams(context.pageQuery) : null;
  const pageCity = query?.get("city");
  const radius = Number(query?.get("radius") || context?.radiusMiles || "");

  return {
    pagePath: context?.pagePath || "/",
    city: context?.city || pageCity || null,
    neighborhood: context?.neighborhood || null,
    lat: typeof context?.lat === "number" ? context.lat : null,
    lng: typeof context?.lng === "number" ? context.lng : null,
    radiusMiles: Number.isFinite(radius) && radius > 0 ? radius : 25,
    deviceType: context?.deviceType || "unknown",
    filters: context?.filters || {},
  };
}

function getLatestUserMessage(payload: KnottyRequestPayload) {
  const latestFromMessages = [...(payload.messages || [])]
    .reverse()
    .find((entry) => entry.role === "user")
    ?.content;

  return sanitizeText(latestFromMessages || QUICK_ACTION_MESSAGES[payload.quickAction || "help_choose"] || "");
}

function toCandidate(item: Record<string, unknown>) {
  return {
    id: String(item.id),
    slug: typeof item.slug === "string" ? item.slug : null,
    display_name:
      typeof item.display_name === "string"
        ? item.display_name
        : typeof item.name === "string"
          ? item.name
          : null,
    full_name:
      typeof item.full_name === "string"
        ? item.full_name
        : typeof item.name === "string"
          ? item.name
          : null,
    _tier:
      typeof item._tier === "string"
        ? item._tier
        : typeof item.tier === "string"
          ? item.tier
          : null,
    city: typeof item.city === "string" ? item.city : null,
    neighborhood_name:
      typeof item.neighborhood_name === "string"
        ? item.neighborhood_name
        : typeof item.neighborhood === "string"
          ? item.neighborhood
          : null,
    primary_area: typeof item.primary_area === "string" ? item.primary_area : null,
    avatar_url:
      typeof item.avatar_url === "string"
        ? item.avatar_url
        : typeof item.profile_photo === "string"
          ? item.profile_photo
          : null,
    bio: typeof item.bio === "string" ? item.bio : null,
    specialties: Array.isArray(item.specialties) ? (item.specialties as string[]) : null,
    modality: typeof item.modality === "string" ? item.modality : null,
    incall_price: typeof item.incall_price === "number" ? item.incall_price : null,
    outcall_price: typeof item.outcall_price === "number" ? item.outcall_price : null,
    available_now: typeof item.available_now === "boolean" ? item.available_now : null,
    available_now_expires: typeof item.available_now_expires === "string" ? item.available_now_expires : null,
    is_verified_identity:
      typeof item.is_verified_identity === "boolean" ? item.is_verified_identity : null,
    is_verified_profile:
      typeof item.is_verified_profile === "boolean" ? item.is_verified_profile : null,
    years_experience: typeof item.years_experience === "number" ? item.years_experience : null,
    start_year: typeof item.start_year === "number" ? item.start_year : null,
    training: Array.isArray(item.training) ? (item.training as Array<Record<string, unknown>>) : null,
    latitude: typeof item.latitude === "number" ? item.latitude : null,
    longitude: typeof item.longitude === "number" ? item.longitude : null,
    boost_score: typeof item.boost_score === "number" ? item.boost_score : null,
    outcall_radius_miles:
      typeof item.outcall_radius_miles === "number" ? item.outcall_radius_miles : null,
    travel_schedule: Array.isArray(item.travel_schedule)
      ? (item.travel_schedule as Array<Record<string, unknown>>)
      : null,
    height_inches: typeof item.height_inches === "number" ? item.height_inches : null,
    weight_lb: typeof item.weight_lb === "number" ? item.weight_lb : null,
    body_type: typeof item.body_type === "string" ? item.body_type : null,
    featured_until: typeof item.featured_until === "string" ? item.featured_until : null,
    distance_miles: typeof item.distance_miles === "number" ? item.distance_miles : null,
  } satisfies KnottyCandidate;
}

async function fetchCandidatesFromRpc(adminClient: any, context: ReturnType<typeof normalizeContext>) {
  if (typeof context.lat !== "number" || typeof context.lng !== "number") {
    return [] as KnottyCandidate[];
  }

  const rpcResult = await adminClient.rpc("get_nearby_therapists", {
    p_lat: context.lat,
    p_lng: context.lng,
    p_radius_miles: context.radiusMiles,
    p_limit: 30,
  });

  const rpcRows = (rpcResult.data || []) as Array<Record<string, unknown>>;
  if (!rpcRows.length) {
    return [] as KnottyCandidate[];
  }

  const ids = rpcRows.map((row) => String(row.id));
  const distanceMap = new Map<string, number | null>(
    rpcRows.map((row) => [String(row.id), typeof row.distance_miles === "number" ? row.distance_miles : null]),
  );

  const { data, error } = await adminClient
    .from("profiles")
    .select(PROFILE_SELECT)
    .in("id", ids);

  if (error || !data) {
    return rpcRows.map((row) => toCandidate(row));
  }

  const rows: Array<Record<string, unknown>> = (data as Array<Record<string, unknown>>).map((row) => ({
    ...row,
    distance_miles: distanceMap.get(String(row.id)) ?? null,
  }));

  const rowMap = new Map<string, Record<string, unknown>>(
    rows.map((row) => [String(row.id), row] as const),
  );
  return ids
    .map((id) => rowMap.get(id))
    .filter((row): row is Record<string, unknown> => row !== undefined)
    .map((row) => toCandidate(row));
}

async function fetchCandidatesDirect(
  adminClient: any,
  context: ReturnType<typeof normalizeContext>,
  city: string | null,
) {
  let query = adminClient
    .from("profiles")
    .select(PROFILE_SELECT)
    .or("is_active.eq.true,is_active.is.null")
    .in("status", ["active", "approved"])
    .limit(60);

  if (city) {
    query = query.ilike("city", city);
  }

  const { data, error } = await query;
  if (!error && data && data.length > 0) {
    return (data as Array<Record<string, unknown>>).map((row) =>
      toCandidate({
        ...row,
        distance_miles:
          typeof context.lat === "number" &&
          typeof context.lng === "number" &&
          typeof row.latitude === "number" &&
          typeof row.longitude === "number"
            ? undefined
            : null,
      }),
    );
  }

  if (city) {
    const fallback = await adminClient
      .from("profiles")
      .select(PROFILE_SELECT)
      .or("is_active.eq.true,is_active.is.null")
      .in("status", ["active", "approved"])
      .limit(60);

    if (!fallback.error && fallback.data) {
      return (fallback.data as Array<Record<string, unknown>>).map((row) => toCandidate(row));
    }
  }

  const publicFallback = await getPublicTherapists({
    city: city || undefined,
    page: 1,
    pageSize: 30,
  });

  return publicFallback.items.map((item) =>
    toCandidate({
      ...item,
      boost_score: 0,
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
    }),
  );
}

function hardMatchIntent(candidate: KnottyCandidate, intent: KnottyIntent) {
  switch (intent) {
    case "available_now":
      return Boolean(candidate.available_now);
    case "mobile":
      return Boolean(candidate.outcall_price || candidate.outcall_radius_miles);
    case "verified":
      return Boolean(
        candidate._tier === "standard" ||
          candidate._tier === "pro" ||
          candidate._tier === "elite" ||
          candidate.is_verified_identity ||
          candidate.is_verified_profile,
      );
    case "travel":
      return Boolean(candidate.travel_schedule?.length);
    default:
      return true;
  }
}

function selectCandidatePool(candidates: KnottyCandidate[], intent: KnottyIntent) {
  const strictMatches = candidates.filter((candidate) => hardMatchIntent(candidate, intent));
  const pool = strictMatches.length >= 3 ? strictMatches : candidates;
  return pool.slice(0, 30);
}

function buildDeterministicReply(input: {
  intent: KnottyIntent;
  primary: KnottyResponsePayload["primary"];
  alternatives: KnottyResponsePayload["alternatives"];
  city: string | null;
}) {
  if (!input.primary) {
    return "I couldn’t find a strong match from the current public profiles, so I’d broaden the filters and keep the focus on verified listings, pricing, and direct contact options.";
  }

  const lead =
    input.intent === "available_now"
      ? "I got you. I prioritized therapists who look available right now."
      : input.intent === "mobile"
        ? "I focused on therapists offering mobile or outcall service."
        : input.intent === "verified"
          ? "I prioritized visible trust and verification signals."
          : input.intent === "help_choose"
            ? "I compared the strongest overall options for a fast decision."
            : "I narrowed this down to the strongest current match for your request.";

  const backupLine =
    input.alternatives.length > 0
      ? ` I also kept ${input.alternatives.map((item) => item.name).join(" and ")} as backups.`
      : "";

  return `${lead} ${input.primary.name} looks strongest${input.city ? ` in or near ${input.city}` : ""} because ${input.primary.why.join(", ").toLowerCase()}.${backupLine}`;
}

type ReplyInput = {
  question: string;
  intent: KnottyIntent;
  primary: KnottyResponsePayload["primary"];
  alternatives: KnottyResponsePayload["alternatives"];
  city: string | null;
};

/** Build the shared system + user prompt from the ranked recommendations. */
function buildKnottyPrompt(input: ReplyInput) {
  const items = [input.primary, ...input.alternatives].filter(
    (item): item is NonNullable<typeof item> => Boolean(item),
  );
  const candidateSummary = items
    .map(
      (item, index) =>
        `${index === 0 ? "Primary" : `Alternative ${index}`}: ${item.name} | ${item.specialty} | ${item.why.join(", ")}`,
    )
    .join("\n");

  const system = [
    "You are Knotty, a discreet and welcoming AI concierge for a wellness directory.",
    "Do not invent facts or change the recommendation order.",
    "Use only the ranked options provided.",
    "Keep the reply under 70 words.",
    "Sound polished, direct, and reassuring.",
  ].join(" ");

  const user = [
    `User request: ${input.question}`,
    `Intent: ${input.intent}`,
    `City context: ${input.city || "not specified"}`,
    candidateSummary,
    "Explain why the primary match stands out and optionally mention one backup.",
  ].join("\n");

  return { system, user };
}

async function composeReply(input: ReplyInput) {
  const fallback = buildDeterministicReply(input);
  if (!input.primary) {
    return { reply: fallback, model: null, fallbackUsed: true };
  }

  // OpenAI → Gemini → deterministic, handled by the shared LLM helper.
  const { system, user } = buildKnottyPrompt(input);
  const result = await completeText({
    system,
    user,
    temperature: 0.5,
    maxTokens: 160,
    timeoutMs: 4000,
  });

  if (result) {
    return { reply: result.text, model: result.model, fallbackUsed: false };
  }

  return { reply: fallback, model: null, fallbackUsed: true };
}

export async function handleKnottyRequest(
  payload: KnottyRequestPayload,
  request?: Request,
): Promise<KnottyResponsePayload> {
  const sessionId = sanitizeText(payload.sessionId) || `knotty-${Date.now()}`;
  const context = normalizeContext(payload.context);
  const question = getLatestUserMessage(payload);
  const guardrails = runKnottyGuardrails(question);
  const intentMatch = detectKnottyIntent({
    message: question,
    quickAction: payload.quickAction || null,
  });

  if (guardrails.blocked) {
    return {
      ok: true,
      intent: intentMatch.intent,
      blocked: true,
      primary: null,
      alternatives: [],
      reply: guardrails.safeReply,
      nextStep: {
        label: "Browse verified therapists",
        href: "/search?verified=1",
      },
      tracking: {
        sessionId,
        recommendationSource: "knotty",
        recommendationIds: [],
      },
      debug: {
        learningEnabled: isKnottyLearningEnabled(),
        model: null,
        fallbackUsed: true,
        matchedTerms: guardrails.matches,
        cityHint: intentMatch.cityHint,
      },
    };
  }

  const faqAnswer = await getKnottyFaqAnswer(question);
  if (faqAnswer) {
    return {
      ok: true,
      intent: intentMatch.intent,
      blocked: false,
      primary: null,
      alternatives: [],
      reply: faqAnswer.answer,
      nextStep: faqAnswer.nextStepLabel
        ? {
            label: faqAnswer.nextStepLabel,
            href: faqAnswer.nextStepHref || null,
          }
        : null,
      tracking: {
        sessionId,
        recommendationSource: "knotty",
        recommendationIds: [],
      },
      debug: {
        learningEnabled: isKnottyLearningEnabled(),
        model: null,
        fallbackUsed: true,
        cityHint: intentMatch.cityHint,
      },
    };
  }

  const resolvedCity = intentMatch.cityHint || context.city || null;

  let adminClient: any = null;
  let candidates: KnottyCandidate[] = [];

  try {
    adminClient = createSupabaseAdminClient();
    candidates = await fetchCandidatesFromRpc(adminClient, context);

    if (!candidates.length) {
      candidates = await fetchCandidatesDirect(adminClient, context, resolvedCity);
    }
  } catch {
    candidates = await getPublicTherapists({
      city: resolvedCity || undefined,
      page: 1,
      pageSize: 30,
    }).then((result) =>
      result.items.map((item) =>
        toCandidate({
          ...item,
          boost_score: 0,
          latitude: item.latitude ?? null,
          longitude: item.longitude ?? null,
        }),
      ),
    );
  }

  const candidatePool = selectCandidatePool(candidates, intentMatch.intent);
  const learningScores =
    adminClient && candidatePool.length > 0
      ? await loadLearningScores(
          adminClient,
          candidatePool.map((candidate) => candidate.id),
          resolvedCity,
          intentMatch.intent,
        )
      : new Map();

  const ranked = rankKnottyCandidates({
    candidates: candidatePool.map((candidate) => ({
      ...candidate,
      distance_miles:
        typeof candidate.distance_miles === "number"
          ? candidate.distance_miles
          : undefined,
    })),
    intent: intentMatch.intent,
    message: question,
    techniqueHint: intentMatch.techniqueHint,
    city: resolvedCity,
    sessionId,
    radiusMiles: context.radiusMiles,
    lat: context.lat,
    lng: context.lng,
    learningScores,
  });

  const recommendations = toKnottyRecommendations({
    ranked,
    intent: intentMatch.intent,
    sessionId,
    includeDebug: envAny(["KNOTTY_DEBUG_RANKING"], "").toLowerCase() === "true",
  });

  const [primary, ...alternatives] = recommendations;
  const replyResult = await composeReply({
    question,
    intent: intentMatch.intent,
    primary: primary || null,
    alternatives,
    city: resolvedCity,
  });

  if (adminClient && recommendations.length > 0) {
    try {
      const session = request ? getRequestSession(request) : null;
      await persistRankingEvents(
        adminClient,
        recommendations.map((recommendation) => ({
          event: "knotty_recommendation_shown",
          session_id: sessionId,
          therapist_id: recommendation.therapistId,
          city: recommendation.city,
          neighborhood: recommendation.neighborhood,
          intent: recommendation.intent,
          device_type: context.deviceType,
          position_in_results: recommendation.position,
          recommendation_source: "knotty",
          metadata: {
            page_path: context.pagePath,
          },
        })),
        session?.userId || null,
      );
    } catch {
      // Best-effort persistence should not block responses.
    }
  }

  return {
    ok: true,
    intent: intentMatch.intent,
    blocked: false,
    primary: primary || null,
    alternatives,
    reply: replyResult.reply,
    nextStep: primary
      ? {
          label: `Open ${primary.name}'s profile`,
          href: primary.profilePath,
        }
      : {
          label: "Browse the directory",
          href: "/search",
        },
    tracking: {
      sessionId,
      recommendationSource: "knotty",
      recommendationIds: recommendations.map((item) => item.therapistId),
    },
    debug: {
      learningEnabled: isKnottyLearningEnabled(),
      model: replyResult.model,
      fallbackUsed: replyResult.fallbackUsed,
      matchedTerms: intentMatch.matchedTerms,
      cityHint: intentMatch.cityHint,
    },
  };
}
