import { chatMessages, type ChatMessage } from "@/lib/ai/llm";
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
  KnottyMessage,
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
  "education",
  "languages_spoken",
  "business_hours",
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
  const parseJsonArray = (value: unknown): string[] | null => {
    if (Array.isArray(value)) {
      return value.filter((v) => typeof v === "string");
    }
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : null;
      } catch {
        return null;
      }
    }
    return null;
  };

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
    education: typeof item.education === "string" ? item.education : null,
    languages_spoken: parseJsonArray(item.languages_spoken) || undefined,
    business_hours:
      typeof item.business_hours === "object" && item.business_hours !== null
        ? (item.business_hours as Record<string, unknown>)
        : undefined,
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

const THERAPIST_NOUN_RE =
  /\b(massage|masseurs?|therapists?|bodywork(?:er)?|providers?|professionals?|someone|somebody|anyone|any one|guys?)\b/;
const SEEKING_VERB_RE =
  /\b(find|looking for|look for|search(?:ing)?|need|want|show me|recommend(?:ation)?s?|suggest(?:ion)?s?|book|browse|match(?: me)?|hire|who(?:'s| is)?|get me|available)\b/;

/**
 * Profile cards must never appear before the person asks for a therapist.
 * Quick-action buttons are explicit asks; otherwise the message itself has to
 * read as a request for a person, not a general or platform question.
 */
export function wantsTherapistProfiles(input: {
  intent: KnottyIntent;
  normalizedMessage: string;
  quickAction: KnottyQuickAction | null;
}): boolean {
  if (input.quickAction) return true;
  if (input.intent === "help_choose") return true;

  const noun = THERAPIST_NOUN_RE.test(input.normalizedMessage);
  const seeking = SEEKING_VERB_RE.test(input.normalizedMessage);

  // "what is deep tissue massage?" stays informational; "find me a deep
  // tissue massage" is an ask.
  if (input.intent === "general" || input.intent === "technique") {
    return noun && seeking;
  }

  // Keyword intents (available_now, mobile, verified, budget, premium,
  // nearby, travel) still need the message to be about finding a person.
  return noun || seeking;
}

function buildDeterministicReply(input: {
  intent: KnottyIntent;
  primary: KnottyResponsePayload["primary"];
  alternatives: KnottyResponsePayload["alternatives"];
  city: string | null;
  profilesRequested: boolean;
}) {
  if (!input.profilesRequested) {
    return "Happy to help! Ask me anything about massage styles or how MasseurMatch works — and when you're ready, tell me your city and what you're looking for and I'll find a great therapist near you.";
  }

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
  history: KnottyMessage[];
  intent: KnottyIntent;
  primary: KnottyResponsePayload["primary"];
  alternatives: KnottyResponsePayload["alternatives"];
  candidates: KnottyCandidate[];
  city: string | null;
  profilesRequested: boolean;
};

function formatCandidateLine(c: KnottyCandidate, rank: number): string {
  const name = c.display_name || c.full_name || `Therapist ${rank}`;
  const loc = [c.neighborhood_name || c.primary_area, c.city].filter(Boolean).join(", ");
  const price =
    c.incall_price
      ? `$${c.incall_price} incall`
      : c.outcall_price
        ? `$${c.outcall_price} outcall`
        : null;
  const flags = [
    c.available_now ? "available now" : null,
    c.is_verified_identity || c.is_verified_profile ? "verified" : null,
    c.years_experience ? `${c.years_experience} yrs exp` : null,
  ].filter(Boolean).join(", ");
  const specialties = c.specialties?.slice(0, 3).join(", ") || null;
  const languages = c.languages_spoken?.slice(0, 2).join(", ") || null;

  const meta = [loc, price, flags, specialties ? `specialties: ${specialties}` : null, languages ? `languages: ${languages}` : null]
    .filter(Boolean)
    .join(" · ");

  return `${rank}. ${name}${meta ? ` — ${meta}` : ""}`;
}

function buildKnottySystemPrompt(input: {
  city: string | null;
  candidates: KnottyCandidate[];
  ranked: KnottyResponsePayload["primary"] | null;
  alternatives: KnottyResponsePayload["alternatives"];
  profilesRequested: boolean;
}): string {
  const lines: string[] = [
    "You are Knotty — the friendly, knowledgeable concierge at MasseurMatch, a premium US directory of LGBTQ+-affirming male massage therapists.",
    "",
    "Personality & tone:",
    "• Talk like a real person — warm, direct, casual but professional. Use contractions, short sentences, natural phrasing. You're a friend who happens to know everything about massage.",
    "• Show genuine enthusiasm when you find a great match. React naturally to what people tell you ('oh nice, deep tissue is great for that' or 'got it, let me look').",
    "• Keep responses to 1–3 sentences. No bullet lists in conversation — just talk.",
    "• Never say 'As an AI', 'I'm just a bot', or 'I don't have feelings'. You are Knotty, period.",
    "• Never start with 'Great question!' or 'Absolutely!' — just answer directly.",
    "• Use an occasional emoji sparingly if it feels natural (one max per message, not every message).",
    "",
    "Conversation style — be a human concierge, not a search engine:",
    "• When someone first messages or their request is vague, ask a friendly clarifying question FIRST. Example: 'What city are you in?' or 'Are you looking for something specific — deep tissue, sports recovery, relaxation?'",
    "• Never dump a list of therapists without context. Have a quick back-and-forth to understand what they need — city, massage type, incall vs outcall, budget, any preferences.",
    "• Once you understand what they want (after 1–2 exchanges), THEN recommend 1–2 specific therapists with a brief reason why they're a good fit.",
    "• If someone asks a general question (about massage types, how the platform works, pricing, etc.), just answer it conversationally. Don't pivot to recommendations unless they ask.",
    "",
    "What you can do:",
    "• Recommend specific therapists from the list below — but only after understanding the person's needs",
    "• Answer questions about MasseurMatch (pricing, how booking works, what verified means)",
    "• Help someone figure out what kind of massage they need",
    "• Redirect users to relevant pages: /search for browsing, /explore for discovering, or specific therapist profiles",
    "• Chat casually about massage types, wellness, what to expect from a session",
    "",
    "Guiding to the platform:",
    "• When relevant, mention MasseurMatch features — searching by city, filtering by availability, viewing profiles",
    "• Highlight what makes MasseurMatch unique: LGBTQ+-affirming, verified professionals, transparent pricing, easy direct contact",
    "• If someone seems unsure, suggest an action: 'Want me to look for someone in your area?' or 'Try the search — you can filter by Available Now'",
    "",
    "Hard rules:",
    "• NEVER discuss, suggest, or engage with sexual content, escort services, 'happy endings', erotic massage, or anything sexual. If someone asks, firmly but kindly redirect: 'That's not what we do here — MasseurMatch connects you with licensed, professional massage therapists. Want me to help find one?'",
    "• MasseurMatch is a directory only — clients contact providers directly via phone, WhatsApp, or email on the profile",
    "• Don't invent details not present in the data below",
    "• Don't fabricate reviews, ratings, or credentials",
  ];

  if (input.city) {
    lines.push("", `Location context: ${input.city}`);
  }

  const primary = input.ranked;
  const alts = input.alternatives;
  const rankedNames = [
    primary ? `1. ${primary.name} (top match — ${primary.why.slice(0, 2).join(", ")})` : null,
    ...alts.slice(0, 2).map((a, i) => `${i + 2}. ${a.name} — ${a.why[0] || ""}`),
  ].filter((x): x is string => Boolean(x));

  if (rankedNames.length > 0) {
    lines.push("", "Ranked matches for this request:", ...rankedNames);
  }

  if (!input.profilesRequested) {
    lines.push(
      "",
      "IMPORTANT: The person has NOT asked for a therapist yet. Do not name, list, or recommend any specific therapist in this reply. Answer their question conversationally, and if it feels natural, offer to help find a therapist when they're ready (ask for their city or what they're looking for).",
    );
  } else if (input.candidates.length > 0) {
    lines.push("", "Full available roster:");
    input.candidates.slice(0, 8).forEach((c, i) => {
      lines.push(formatCandidateLine(c, i + 1));
    });
    lines.push("", "Note: Each therapist profile includes training, education, languages spoken, and business hours. Use this information to make personalized recommendations.");
  } else {
    lines.push("", "No therapist data is available for this location yet. Encourage the person to browse /explore or /search.");
  }

  return lines.join("\n");
}

function buildConversationMessages(input: {
  history: KnottyMessage[];
  candidates: KnottyCandidate[];
  primary: KnottyResponsePayload["primary"] | null;
  alternatives: KnottyResponsePayload["alternatives"];
  city: string | null;
  intent: KnottyIntent;
  profilesRequested: boolean;
}): ChatMessage[] {
  const system = buildKnottySystemPrompt({
    city: input.city,
    candidates: input.candidates,
    ranked: input.primary,
    alternatives: input.alternatives,
    profilesRequested: input.profilesRequested,
  });

  return [
    { role: "system" as const, content: system },
    ...input.history
      .slice(-10) // keep last 10 turns for context
      .map((m) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content: m.content,
      })),
  ];
}

async function composeReply(input: ReplyInput) {
  const messages = buildConversationMessages({
    history: input.history,
    candidates: input.candidates,
    primary: input.primary,
    alternatives: input.alternatives,
    city: input.city,
    intent: input.intent,
    profilesRequested: input.profilesRequested,
  });

  const result = await chatMessages(messages, {
    temperature: 0.72,
    maxTokens: 380,
    timeoutMs: 6000,
  });

  if (result) {
    return { reply: result.text, model: result.model, fallbackUsed: false };
  }

  // LLM unavailable — try FAQ then deterministic
  const faqAnswer = await getKnottyFaqAnswer(input.question);
  if (faqAnswer) {
    return { reply: faqAnswer.answer, model: null, fallbackUsed: true };
  }

  return { reply: buildDeterministicReply(input), model: null, fallbackUsed: true };
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

  const resolvedCity = intentMatch.cityHint || context.city || null;
  const profilesRequested = wantsTherapistProfiles({
    intent: intentMatch.intent,
    normalizedMessage: intentMatch.normalizedMessage,
    quickAction: payload.quickAction || null,
  });

  let adminClient: any = null;
  let candidates: KnottyCandidate[] = [];

  if (profilesRequested) {
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
    history: payload.messages || [],
    intent: intentMatch.intent,
    primary: primary || null,
    alternatives,
    candidates: candidatePool,
    city: resolvedCity,
    profilesRequested,
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
