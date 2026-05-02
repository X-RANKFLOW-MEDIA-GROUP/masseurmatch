export const KNOTTY_INTENTS = [
  "available_now",
  "mobile",
  "verified",
  "budget",
  "premium",
  "nearby",
  "technique",
  "travel",
  "help_choose",
  "general",
] as const;

export type KnottyIntent = (typeof KNOTTY_INTENTS)[number];

export const KNOTTY_EVENT_NAMES = [
  "knotty_open",
  "knotty_recommendation_shown",
  "knotty_profile_clicked",
  "knotty_contact_clicked",
  "knotty_call_clicked",
  "knotty_text_clicked",
  "knotty_whatsapp_clicked",
  "profile_viewed",
  "search_pending_approval",
  "filter_applied",
] as const;

export type KnottyEventName = (typeof KNOTTY_EVENT_NAMES)[number];

export const KNOTTY_QUICK_ACTIONS = [
  "available_now",
  "mobile",
  "verified",
  "help_choose",
] as const;

export type KnottyQuickAction = (typeof KNOTTY_QUICK_ACTIONS)[number];

export const KNOTTY_DEVICE_TYPES = ["mobile", "tablet", "desktop", "unknown"] as const;

export type KnottyDeviceType = (typeof KNOTTY_DEVICE_TYPES)[number];

export type KnottyMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type KnottyContext = {
  pagePath?: string;
  pageQuery?: string;
  city?: string | null;
  neighborhood?: string | null;
  lat?: number | null;
  lng?: number | null;
  radiusMiles?: number | null;
  deviceType?: KnottyDeviceType;
  filters?: Record<string, string | number | boolean | null | undefined>;
};

export type KnottyRequestPayload = {
  sessionId: string;
  messages?: KnottyMessage[];
  quickAction?: KnottyQuickAction;
  context?: KnottyContext;
};

export type KnottyScoreBreakdown = {
  base: number;
  learning: number;
  exploration: number;
  final: number;
  signals: {
    availableNow: number;
    distance: number;
    verified: number;
    intentMatch: number;
    pricingVisibility: number;
    profileQuality: number;
    physicalMatch: number;
    boost: number;
  };
};

export type KnottyRecommendation = {
  therapistId: string;
  slug: string;
  name: string;
  city: string | null;
  neighborhood: string | null;
  specialty: string;
  priceFrom: number | null;
  availableNow: boolean;
  verified: boolean;
  distanceMiles: number | null;
  why: string[];
  profilePath: string;
  intent: KnottyIntent;
  position: number;
  score?: KnottyScoreBreakdown;
};

export type KnottyResponsePayload = {
  ok: true;
  intent: KnottyIntent;
  blocked: boolean;
  primary: KnottyRecommendation | null;
  alternatives: KnottyRecommendation[];
  reply: string;
  nextStep: {
    label: string;
    href: string | null;
  } | null;
  tracking: {
    sessionId: string;
    recommendationSource: "knotty";
    recommendationIds: string[];
  };
  debug?: {
    learningEnabled: boolean;
    model: string | null;
    fallbackUsed: boolean;
    matchedTerms?: string[];
    cityHint?: string | null;
  };
};

export type KnottyEventPayload = {
  event: KnottyEventName;
  session_id: string;
  therapist_id?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  intent?: KnottyIntent | null;
  device_type?: KnottyDeviceType | null;
  position_in_results?: number | null;
  recommendation_source?: string | null;
  metadata?: Record<string, unknown>;
  ts?: number;
};

export type KnottyLearningRow = {
  therapist_id: string;
  city: string;
  intent: KnottyIntent | "general";
  impressions: number;
  profile_clicks: number;
  contact_clicks: number;
  ctr: number;
  contact_rate: number;
  intent_conversion_rate: number;
  score_7d: number;
  score_30d: number;
  weighted_score: number;
  updated_at: string;
};

export type KnottyCandidate = {
  id: string;
  slug: string | null;
  display_name: string | null;
  full_name: string | null;
  _tier?: string | null;
  city: string | null;
  neighborhood_name: string | null;
  primary_area: string | null;
  avatar_url: string | null;
  bio: string | null;
  specialties: string[] | null;
  modality: string | null;
  incall_price: number | null;
  outcall_price: number | null;
  available_now: boolean | null;
  available_now_expires: string | null;
  is_verified_identity: boolean | null;
  is_verified_profile: boolean | null;
  years_experience: number | null;
  start_year: number | null;
  training: Array<Record<string, unknown>> | null;
  latitude: number | null;
  longitude: number | null;
  boost_score: number | null;
  outcall_radius_miles: number | null;
  travel_schedule: Array<Record<string, unknown>> | null;
  height_inches: number | null;
  weight_lb: number | null;
  body_type: string | null;
  featured_until?: string | null;
  special_offer_text?: string | null;
  distance_miles?: number | null;
};
