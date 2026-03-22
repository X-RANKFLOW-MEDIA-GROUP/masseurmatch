import { getCities } from "@/app/_lib/directory";
import { sanitizeText } from "@/app/_lib/security";
import type { KnottyIntent, KnottyQuickAction } from "@/lib/knotty/types";

type IntentMatch = {
  intent: KnottyIntent;
  cityHint: string | null;
  techniqueHint: string | null;
  normalizedMessage: string;
  matchedTerms: string[];
};

const QUICK_ACTION_TO_INTENT: Record<KnottyQuickAction, KnottyIntent> = {
  available_now: "available_now",
  mobile: "mobile",
  verified: "verified",
  help_choose: "help_choose",
};

const TECHNIQUE_TERMS = [
  "deep tissue",
  "swedish",
  "sports",
  "recovery",
  "stretch",
  "relaxation",
  "mobility",
  "thai",
];

const INTENT_KEYWORDS: Array<{ intent: KnottyIntent; terms: string[] }> = [
  { intent: "available_now", terms: ["available now", "right now", "asap", "urgent", "immediately", "someone now", "today"] },
  { intent: "mobile", terms: ["mobile", "outcall", "come to me", "hotel", "travel to me", "visit me", "house call"] },
  { intent: "verified", terms: ["verified", "safe", "trusted", "trust", "reviewed"] },
  { intent: "budget", terms: ["budget", "affordable", "cheap", "under $", "low cost", "best price"] },
  { intent: "premium", terms: ["premium", "luxury", "elite", "top tier", "best therapist"] },
  { intent: "nearby", terms: ["nearby", "near me", "closest", "close by", "close to me"] },
  { intent: "travel", terms: ["traveling", "visiting", "in town", "visitor", "trip"] },
  { intent: "help_choose", terms: ["help me choose", "not sure", "which one", "recommend one", "help choose"] },
];

function matchCityHint(message: string) {
  const cities = getCities();
  const normalized = message.toLowerCase();
  const match = cities.find((city) => {
    return (
      normalized.includes(city.name.toLowerCase()) ||
      normalized.includes(city.slug.replace(/-/g, " "))
    );
  });

  return match?.name || null;
}

function matchTechnique(message: string) {
  const normalized = message.toLowerCase();
  return TECHNIQUE_TERMS.find((term) => normalized.includes(term)) || null;
}

export function detectKnottyIntent(input: {
  message: string;
  quickAction?: KnottyQuickAction | null;
}): IntentMatch {
  const normalizedMessage = sanitizeText(input.message).toLowerCase();
  const cityHint = matchCityHint(normalizedMessage);
  const techniqueHint = matchTechnique(normalizedMessage);

  if (input.quickAction) {
    return {
      intent: QUICK_ACTION_TO_INTENT[input.quickAction],
      cityHint,
      techniqueHint,
      normalizedMessage,
      matchedTerms: [input.quickAction],
    };
  }

  if (techniqueHint) {
    return {
      intent: "technique",
      cityHint,
      techniqueHint,
      normalizedMessage,
      matchedTerms: [techniqueHint],
    };
  }

  for (const entry of INTENT_KEYWORDS) {
    const matchedTerms = entry.terms.filter((term) => normalizedMessage.includes(term));
    if (matchedTerms.length > 0) {
      return {
        intent: entry.intent,
        cityHint,
        techniqueHint,
        normalizedMessage,
        matchedTerms,
      };
    }
  }

  return {
    intent: "general",
    cityHint,
    techniqueHint,
    normalizedMessage,
    matchedTerms: [],
  };
}
