import { chatMessages, type ChatMessage } from "@/lib/ai/llm";
import { sanitizeText } from "@/app/_lib/security";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { runKnottyGuardrails } from "@/lib/knotty/guardrails";
import { isKnottyLearningEnabled } from "@/lib/knotty/learning";
import type { KnottyRequestPayload, KnottyResponsePayload } from "@/lib/knotty/types";

const PROFILE_PAGE_RE = /^\/therapists\/([^/?#]+)\/?$/i;

const PROFILE_CONTEXT_SELECT = [
  "id",
  "slug",
  "display_name",
  "full_name",
  "headline",
  "bio",
  "city",
  "state",
  "neighborhood",
  "neighborhood_name",
  "primary_area",
  "service_categories",
  "massage_techniques",
  "specialties",
  "additional_services",
  "massage_setup",
  "mobile_extras",
  "studio_amenities",
  "products_used",
  "products_sold",
  "payment_methods",
  "offers_incall",
  "offers_outcall",
  "outcall_radius",
  "outcall_radius_miles",
  "pricing_sessions",
  "rates",
  "incall_price",
  "outcall_price",
  "starting_price",
  "starting_rate",
  "regular_discounts",
  "day_of_week_discount",
  "rate_disclaimers",
  "studio_hours",
  "mobile_hours",
  "business_hours",
  "current_status",
  "available_now",
  "available_now_expires",
  "travel_schedule",
  "languages",
  "languages_spoken",
  "years_experience",
  "start_year",
  "education_entries",
  "education",
  "training",
  "certifications",
  "affiliations",
  "lgbtq_affirming",
  "accepts_all_genders",
  "accessibility_features",
  "verification_status",
  "is_verified_identity",
  "is_verified_profile",
  "is_verified_photos",
  "profile_status",
  "visibility_status",
  "is_active",
  "is_suspended",
  "is_banned",
].join(",");

type ProfileRecord = Record<string, unknown> & {
  id: string;
  slug: string;
  display_name?: string | null;
  full_name?: string | null;
  city?: string | null;
  state?: string | null;
};

export function getKnottyProfileSlug(pagePath?: string | null) {
  if (!pagePath) return null;
  const match = pagePath.match(PROFILE_PAGE_RE);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function latestQuestion(payload: KnottyRequestPayload) {
  const message = [...(payload.messages || [])].reverse().find((entry) => entry.role === "user");
  return sanitizeText(message?.content || "Tell me about this therapist.");
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];
}

function displayName(profile: ProfileRecord) {
  return String(profile.display_name || profile.full_name || "this therapist");
}

function formatPricing(profile: ProfileRecord) {
  const sessions = Array.isArray(profile.pricing_sessions) ? profile.pricing_sessions : [];
  const rows = sessions
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const minutes = Number(row.minutes ?? row.duration);
      const incall = Number(row.incall_rate ?? row.incall);
      const outcall = Number(row.outcall_rate ?? row.outcall);
      if (!Number.isFinite(minutes)) return null;
      const prices = [
        Number.isFinite(incall) && incall > 0 ? `$${incall} incall` : null,
        Number.isFinite(outcall) && outcall > 0 ? `$${outcall} outcall` : null,
      ].filter(Boolean);
      return prices.length ? `${minutes} min: ${prices.join(", ")}` : null;
    })
    .filter((value): value is string => Boolean(value));

  if (rows.length) return rows.join("; ");

  const fallback = [
    typeof profile.incall_price === "number" && profile.incall_price > 0 ? `$${profile.incall_price} incall` : null,
    typeof profile.outcall_price === "number" && profile.outcall_price > 0 ? `$${profile.outcall_price} outcall` : null,
    typeof profile.starting_price === "number" && profile.starting_price > 0 ? `from $${profile.starting_price}` : null,
    typeof profile.starting_rate === "number" && profile.starting_rate > 0 ? `from $${profile.starting_rate}` : null,
  ].filter(Boolean);
  return fallback.join(", ");
}

function compactProfileContext(profile: ProfileRecord) {
  const name = displayName(profile);
  const location = [profile.neighborhood || profile.neighborhood_name || profile.primary_area, profile.city, profile.state]
    .filter(Boolean)
    .join(", ");
  const services = Array.from(new Set([
    ...arrayOfStrings(profile.service_categories),
    ...arrayOfStrings(profile.massage_techniques),
    ...arrayOfStrings(profile.specialties),
    ...arrayOfStrings(profile.additional_services),
  ])).slice(0, 24);
  const amenities = arrayOfStrings(profile.studio_amenities);
  const mobileExtras = arrayOfStrings(profile.mobile_extras);
  const setup = arrayOfStrings(profile.massage_setup);
  const paymentMethods = arrayOfStrings(profile.payment_methods);
  const productsUsed = arrayOfStrings(profile.products_used);
  const productsSold = arrayOfStrings(profile.products_sold);
  const affiliations = arrayOfStrings(profile.affiliations);
  const languages = Array.from(new Set([
    ...arrayOfStrings(profile.languages),
    ...arrayOfStrings(profile.languages_spoken),
  ]));

  return JSON.stringify({
    name,
    headline: profile.headline || null,
    bio: profile.bio || null,
    location: location || null,
    services,
    offersIncall: profile.offers_incall === true,
    offersOutcall: profile.offers_outcall === true,
    outcallRadiusMiles: profile.outcall_radius_miles ?? profile.outcall_radius ?? null,
    pricing: formatPricing(profile) || null,
    discounts: profile.regular_discounts || null,
    weeklyDiscount: profile.day_of_week_discount || null,
    rateNotes: profile.rate_disclaimers || null,
    studioHours: profile.studio_hours || profile.business_hours || null,
    mobileHours: profile.mobile_hours || null,
    currentStatus: profile.current_status || null,
    availableNow: profile.available_now === true,
    availableNowExpires: profile.available_now_expires || null,
    travelSchedule: profile.travel_schedule || null,
    yearsExperience: profile.years_experience ?? null,
    startYear: profile.start_year ?? null,
    education: profile.education_entries || profile.education || null,
    training: profile.training || null,
    certifications: profile.certifications || null,
    affiliations,
    languages,
    studioAmenities: amenities,
    mobileExtras,
    massageSetup: setup,
    productsUsed,
    productsAvailable: productsSold,
    paymentMethods,
    lgbtqAffirming: profile.lgbtq_affirming === true,
    acceptsAllGenders: profile.accepts_all_genders === true,
    accessibilityFeatures: profile.accessibility_features || null,
    identityVerified: profile.is_verified_identity === true,
    profileVerified: profile.is_verified_profile === true,
    photosVerified: profile.is_verified_photos === true,
    verificationStatus: profile.verification_status || null,
  });
}

function deterministicProfileReply(profile: ProfileRecord, question: string) {
  const name = displayName(profile);
  const q = question.toLowerCase();
  const services = Array.from(new Set([
    ...arrayOfStrings(profile.massage_techniques),
    ...arrayOfStrings(profile.service_categories),
    ...arrayOfStrings(profile.specialties),
    ...arrayOfStrings(profile.additional_services),
  ]));
  const pricing = formatPricing(profile);
  const location = [profile.neighborhood || profile.neighborhood_name || profile.primary_area, profile.city, profile.state]
    .filter(Boolean)
    .join(", ");

  if (/rate|price|cost|how much|pricing/.test(q)) {
    return pricing
      ? `${name}'s listed rates are ${pricing}. Confirm the final rate and session details directly with ${name}.`
      : `${name} does not currently show a complete rate in the profile. Contact ${name} directly through the profile to confirm pricing.`;
  }
  if (/available|hours|schedule|today|open/.test(q)) {
    const now = profile.available_now === true ? " is marked Available Now" : " is not currently marked Available Now";
    return `${name}${now}. The profile's listed hours and availability can change, so confirm the exact time directly before visiting.`;
  }
  if (/travel|visiting|trip/.test(q)) {
    const travel = Array.isArray(profile.travel_schedule) && profile.travel_schedule.length
      ? JSON.stringify(profile.travel_schedule)
      : null;
    return travel
      ? `${name} currently has travel dates listed on the profile: ${travel}. Confirm the destination dates directly before making plans.`
      : `${name} does not currently have travel dates listed on the profile.`;
  }
  if (/service|massage|technique|special/.test(q) && services.length) {
    return `${name} lists ${services.slice(0, 8).join(", ")}${services.length > 8 ? ", and more" : ""}. Tell me what result you're looking for and I can explain which of those services may fit best.`;
  }
  if (/experience|years|background|education|training/.test(q)) {
    const years = typeof profile.years_experience === "number" ? `${profile.years_experience} years of experience` : "experience details on the profile";
    return `${name} lists ${years}. I can also explain the education, training, or affiliations shown on this profile.`;
  }
  return `${name} is a massage provider${location ? ` in ${location}` : ""}${services.length ? ` offering ${services.slice(0, 5).join(", ")}` : ""}${pricing ? `. Listed pricing includes ${pricing}` : ""}. Ask me about services, rates, availability, amenities, travel, or experience and I'll answer from this profile.`;
}

async function loadPublicProfile(slug: string): Promise<ProfileRecord | null> {
  const admin = createSupabaseAdminClient() as any;
  const { data, error } = await admin
    .from("profiles")
    .select(PROFILE_CONTEXT_SELECT)
    .eq("slug", slug)
    .eq("profile_status", "approved")
    .eq("visibility_status", "public")
    .eq("is_suspended", false)
    .eq("is_banned", false)
    .maybeSingle();

  if (error || !data) return null;
  if (data.is_active === false) return null;
  return data as ProfileRecord;
}

export async function handleProfileKnottyRequest(
  payload: KnottyRequestPayload,
  slug: string,
): Promise<KnottyResponsePayload | null> {
  const profile = await loadPublicProfile(slug);
  if (!profile) return null;

  const question = latestQuestion(payload);
  const guardrails = runKnottyGuardrails(question);
  const sessionId = sanitizeText(payload.sessionId) || `knotty-${Date.now()}`;
  const profilePath = `/therapists/${profile.slug}`;
  const name = displayName(profile);

  if (guardrails.blocked) {
    return {
      ok: true,
      intent: "general",
      blocked: true,
      primary: null,
      alternatives: [],
      reply: guardrails.safeReply,
      nextStep: { label: `View ${name}'s profile`, href: profilePath },
      tracking: { sessionId, recommendationSource: "knotty", recommendationIds: [] },
      debug: {
        learningEnabled: isKnottyLearningEnabled(),
        model: null,
        fallbackUsed: true,
        matchedTerms: guardrails.matches,
        cityHint: profile.city || null,
      },
    };
  }

  const system = [
    `You are Knotty, the profile concierge for ${name} on MasseurMatch.`,
    "The visitor is currently on this exact therapist profile. Answer questions about THIS therapist first; do not switch to another provider unless the visitor explicitly asks for alternatives.",
    "Ground every factual statement in the PROFILE DATA below. Never invent services, pricing, availability, credentials, reviews, identity facts, or policies.",
    "MasseurMatch is a directory only. It does not book appointments, process session payments, verify professional licenses, or guarantee availability. Clients contact independent providers directly.",
    "If a field is missing or unclear, say the profile does not specify it and recommend confirming directly with the provider.",
    "Keep replies concise, warm, professional, nonsexual, and usually 1-3 sentences. Do not claim the provider is licensed unless the profile data explicitly states a credential, and never imply MasseurMatch verified a license.",
    "Do not expose internal status fields, database details, moderation data, or hidden/private information.",
    "",
    `PROFILE DATA FOR ${name}:`,
    compactProfileContext(profile),
  ].join("\n");

  const history: ChatMessage[] = (payload.messages || [])
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-10)
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.content,
    }));

  const result = await chatMessages(
    [{ role: "system", content: system }, ...history],
    { temperature: 0.35, maxTokens: 420, timeoutMs: 7000 },
  );

  return {
    ok: true,
    intent: "general",
    blocked: false,
    primary: null,
    alternatives: [],
    reply: result?.text || deterministicProfileReply(profile, question),
    nextStep: { label: `View ${name}'s profile`, href: profilePath },
    tracking: { sessionId, recommendationSource: "knotty", recommendationIds: [] },
    debug: {
      learningEnabled: isKnottyLearningEnabled(),
      model: result?.model || null,
      fallbackUsed: !result,
      matchedTerms: [],
      cityHint: profile.city || null,
    },
  };
}
