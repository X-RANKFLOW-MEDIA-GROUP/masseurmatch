import { haversineDistance } from "@/lib/distance";
import { buildKnottyProfilePath } from "@/lib/knotty/attribution";
import {
  getExplorationScore,
  isKnottyLearningEnabled,
  normalizeLearningScore,
} from "@/lib/knotty/learning";
import type {
  KnottyCandidate,
  KnottyIntent,
  KnottyLearningRow,
  KnottyRecommendation,
  KnottyScoreBreakdown,
} from "@/lib/knotty/types";

type RankedCandidate = {
  candidate: KnottyCandidate;
  score: KnottyScoreBreakdown;
  distanceMiles: number | null;
  priceFrom: number | null;
  verified: boolean;
  availableNow: boolean;
  why: string[];
  specialty: string;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function computePriceFrom(candidate: KnottyCandidate) {
  const prices = [candidate.incall_price, candidate.outcall_price].filter(
    (value): value is number => typeof value === "number" && value > 0,
  );

  return prices.length > 0 ? Math.min(...prices) : null;
}

function isAvailableNow(candidate: KnottyCandidate) {
  if (!candidate.available_now) {
    return false;
  }

  if (!candidate.available_now_expires) {
    return true;
  }

  return new Date(candidate.available_now_expires).getTime() > Date.now();
}

function getYearsExperience(candidate: KnottyCandidate) {
  if (typeof candidate.years_experience === "number") {
    return candidate.years_experience;
  }

  if (typeof candidate.start_year === "number") {
    return Math.max(0, new Date().getFullYear() - candidate.start_year);
  }

  return null;
}

function computeProfileQuality(candidate: KnottyCandidate, priceFrom: number | null) {
  const checks = [
    Boolean(candidate.neighborhood_name || candidate.primary_area || candidate.city),
    Boolean(candidate.avatar_url),
    (candidate.bio || "").trim().length >= 140,
    typeof priceFrom === "number",
    Boolean(candidate.specialties?.length || candidate.modality),
    Boolean(getYearsExperience(candidate) || candidate.training?.length),
  ];

  return checks.filter(Boolean).length / checks.length;
}

function isVerifiedCandidate(candidate: KnottyCandidate) {
  return (
    candidate._tier === "standard" ||
    candidate._tier === "pro" ||
    candidate._tier === "elite" ||
    Boolean(candidate.is_verified_identity) ||
    Boolean(candidate.is_verified_profile)
  );
}

function computeDistanceMiles(candidate: KnottyCandidate, location: { lat?: number | null; lng?: number | null }) {
  if (typeof candidate.distance_miles === "number") {
    return candidate.distance_miles;
  }

  if (
    typeof location.lat === "number" &&
    typeof location.lng === "number" &&
    typeof candidate.latitude === "number" &&
    typeof candidate.longitude === "number"
  ) {
    return haversineDistance(location.lat, location.lng, candidate.latitude, candidate.longitude);
  }

  return null;
}

function computeDistanceScore(distanceMiles: number | null, cityMatches: boolean, radiusMiles: number) {
  if (typeof distanceMiles === "number") {
    return clamp(1 - Math.min(distanceMiles, radiusMiles) / radiusMiles);
  }

  return cityMatches ? 0.55 : 0.25;
}

function computeIntentMatch(input: {
  intent: KnottyIntent;
  candidate: KnottyCandidate;
  availableNow: boolean;
  verified: boolean;
  distanceMiles: number | null;
  priceFrom: number | null;
  message: string;
  techniqueHint: string | null;
}) {
  const normalizedMessage = input.message.toLowerCase();
  const specialtyBlob = [input.candidate.modality, ...(input.candidate.specialties || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  switch (input.intent) {
    case "available_now":
      return input.availableNow ? 1 : 0;
    case "mobile":
      return input.candidate.outcall_price || input.candidate.outcall_radius_miles ? 1 : 0;
    case "verified":
      return input.verified ? 1 : 0;
    case "budget":
      if (typeof input.priceFrom !== "number") {
        return 0.2;
      }
      return clamp(1 - Math.min(input.priceFrom, 250) / 250);
    case "premium":
      return input.candidate.boost_score || input.candidate.featured_until ? 1 : 0.4;
    case "nearby":
      return typeof input.distanceMiles === "number" ? clamp(1 - Math.min(input.distanceMiles, 25) / 25) : 0.25;
    case "technique":
      if (input.techniqueHint && specialtyBlob.includes(input.techniqueHint)) {
        return 1;
      }
      return specialtyBlob && specialtyBlob.split(" ").some((word) => normalizedMessage.includes(word)) ? 0.7 : 0.15;
    case "travel":
      return input.candidate.travel_schedule?.length ? 1 : 0.1;
    case "help_choose":
      return 0.8;
    default:
      return 0.65;
  }
}

function normalizeBoostScore(candidate: KnottyCandidate) {
  return clamp((candidate.boost_score || 0) / 100);
}

function buildWhyLines(input: {
  candidate: KnottyCandidate;
  availableNow: boolean;
  verified: boolean;
  distanceMiles: number | null;
  priceFrom: number | null;
  intent: KnottyIntent;
  profileQuality: number;
}) {
  const reasons: string[] = [];

  if (input.availableNow) {
    reasons.push("Available right now");
  }

  if (input.intent === "mobile" && (input.candidate.outcall_price || input.candidate.outcall_radius_miles)) {
    reasons.push("Offers mobile or outcall sessions");
  }

  if (input.verified) {
    reasons.push("Shows visible verification signals");
  }

  if (typeof input.distanceMiles === "number") {
    reasons.push(`${input.distanceMiles < 10 ? input.distanceMiles.toFixed(1) : Math.round(input.distanceMiles)} miles away`);
  }

  if (typeof input.priceFrom === "number") {
    reasons.push(`Visible pricing from $${input.priceFrom}`);
  }

  if (input.profileQuality >= 0.8) {
    reasons.push("Strong profile quality");
  }

  return reasons.slice(0, 3);
}

function sortRankedCandidates(items: RankedCandidate[]) {
  return [...items].sort((left, right) => {
    if (right.score.final !== left.score.final) {
      return right.score.final - left.score.final;
    }

    if (Number(right.availableNow) !== Number(left.availableNow)) {
      return Number(right.availableNow) - Number(left.availableNow);
    }

    return (left.distanceMiles ?? Number.MAX_SAFE_INTEGER) - (right.distanceMiles ?? Number.MAX_SAFE_INTEGER);
  });
}

export function rankKnottyCandidates(input: {
  candidates: KnottyCandidate[];
  intent: KnottyIntent;
  message: string;
  techniqueHint: string | null;
  city: string | null;
  sessionId: string;
  radiusMiles?: number | null;
  lat?: number | null;
  lng?: number | null;
  learningScores?: Map<string, KnottyLearningRow | null>;
}) {
  const radiusMiles = input.radiusMiles && input.radiusMiles > 0 ? input.radiusMiles : 25;
  const normalizedCity = input.city?.trim().toLowerCase() || null;
  const learningEnabled = isKnottyLearningEnabled();

  const ranked = input.candidates.map<RankedCandidate>((candidate) => {
    const priceFrom = computePriceFrom(candidate);
    const availableNow = isAvailableNow(candidate);
    const verified = isVerifiedCandidate(candidate);
    const distanceMiles = computeDistanceMiles(candidate, {
      lat: input.lat,
      lng: input.lng,
    });
    const distance = computeDistanceScore(
      distanceMiles,
      Boolean(normalizedCity && candidate.city?.trim().toLowerCase() === normalizedCity),
      radiusMiles,
    );
    const profileQuality = computeProfileQuality(candidate, priceFrom);
    const pricingVisibility = typeof priceFrom === "number" ? 1 : 0;
    const intentMatch = computeIntentMatch({
      intent: input.intent,
      candidate,
      availableNow,
      verified,
      distanceMiles,
      priceFrom,
      message: input.message,
      techniqueHint: input.techniqueHint,
    });
    const learningRow = input.learningScores?.get(candidate.id) || null;
    const learning = normalizeLearningScore(learningRow);
    const exploration = getExplorationScore(candidate, learningRow, input.sessionId);
    const base =
      (availableNow ? 1 : 0) * 0.3 +
      distance * 0.18 +
      (verified ? 1 : 0) * 0.14 +
      intentMatch * 0.16 +
      pricingVisibility * 0.1 +
      profileQuality * 0.07 +
      normalizeBoostScore(candidate) * 0.05;
    const final = learningEnabled
      ? base * 0.6 + learning * 0.3 + exploration * 0.1
      : base;

    return {
      candidate,
      distanceMiles,
      priceFrom,
      verified,
      availableNow,
      specialty: candidate.specialties?.[0] || candidate.modality || "Massage therapy",
      why: buildWhyLines({
        candidate,
        availableNow,
        verified,
        distanceMiles,
        priceFrom,
        intent: input.intent,
        profileQuality,
      }),
      score: {
        base,
        learning,
        exploration,
        final,
        signals: {
          availableNow: availableNow ? 1 : 0,
          distance,
          verified: verified ? 1 : 0,
          intentMatch,
          pricingVisibility,
          profileQuality,
          boost: normalizeBoostScore(candidate),
        },
      },
    };
  });

  const sorted = sortRankedCandidates(ranked);

  if (!learningEnabled || sorted.length <= 2) {
    return sorted;
  }

  const [primary, ...rest] = sorted;
  const reorderedRest = [...rest].sort((left, right) => {
    const leftExploration = left.score.exploration;
    const rightExploration = right.score.exploration;

    if (rightExploration !== leftExploration) {
      return rightExploration - leftExploration;
    }

    return right.score.final - left.score.final;
  });

  return [primary, ...reorderedRest];
}

export function toKnottyRecommendations(input: {
  ranked: RankedCandidate[];
  intent: KnottyIntent;
  sessionId: string;
  includeDebug?: boolean;
}) {
  return input.ranked.slice(0, 3).map<KnottyRecommendation>((item, index) => {
    const slug = item.candidate.slug || item.candidate.id;
    return {
      therapistId: item.candidate.id,
      slug,
      name: item.candidate.display_name || item.candidate.full_name || "Therapist",
      city: item.candidate.city,
      neighborhood: item.candidate.neighborhood_name || item.candidate.primary_area || null,
      specialty: item.specialty,
      priceFrom: item.priceFrom,
      availableNow: item.availableNow,
      verified: item.verified,
      distanceMiles: item.distanceMiles,
      why: item.why,
      profilePath: buildKnottyProfilePath(`/therapists/${slug}`, {
        intent: input.intent,
        position: index + 1,
        sessionId: input.sessionId,
      }),
      intent: input.intent,
      position: index + 1,
      score: input.includeDebug ? item.score : undefined,
    };
  });
}
