import type { PublicTherapist, TherapistTier } from "@/app/_lib/directory";

type FallbackTherapist = PublicTherapist & {
  latitude: number;
  longitude: number;
  zip_code: string | null;
  special_offer_text: string | null;
};

const FUTURE_DATE = "2026-12-31T23:59:59.000Z";

export const FALLBACK_PUBLIC_THERAPISTS: FallbackTherapist[] = [
  {
    id: "fallback-ethan-cole",
    slug: "ethan-cole",
    city: "Dallas",
    display_name: "Ethan Cole",
    full_name: "Ethan Cole",
    bio: "Ethan works from Uptown Dallas with a premium, confidence-first flow built around deep tissue, relaxation, and responsive same-day communication.",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    phone: "+1 (214) 555-0101",
    specialties: ["Relaxation", "Deep Tissue"],
    _tier: "elite",
    modality: "Deep Tissue",
    status: "active",
    profile_views: 621,
    review_count: 28,
    incall_price: 120,
    outcall_price: 150,
    business_hours: null,
    custom_faq: null,
    pricing_sessions: null,
    available_now: true,
    available_now_expires: FUTURE_DATE,
    is_verified_identity: true,
    is_verified_profile: true,
    is_verified_photos: true,
    neighborhood_name: "Uptown Dallas",
    primary_area: "Uptown",
    years_experience: 6,
    start_year: null,
    latitude: 32.8007,
    longitude: -96.8035,
    zip_code: "75204",
    special_offer_text: null,
  },
  {
    id: "fallback-mason-ellis",
    slug: "mason-ellis",
    city: "Dallas",
    display_name: "Mason Ellis",
    full_name: "Mason Ellis",
    bio: "Mason is based near Oak Lawn and focuses on recovery-led bodywork with clear incall and outcall options for clients who want less guesswork before booking.",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
    phone: "+1 (214) 555-0102",
    specialties: ["Sports Recovery", "Deep Tissue"],
    _tier: "pro",
    modality: "Sports Recovery",
    status: "active",
    profile_views: 488,
    review_count: 19,
    incall_price: 110,
    outcall_price: 140,
    business_hours: null,
    custom_faq: null,
    pricing_sessions: null,
    available_now: true,
    available_now_expires: FUTURE_DATE,
    is_verified_identity: true,
    is_verified_profile: true,
    is_verified_photos: true,
    neighborhood_name: "Oak Lawn",
    primary_area: "Central Dallas",
    years_experience: 8,
    start_year: null,
    latitude: 32.8112,
    longitude: -96.8121,
    zip_code: "75219",
    special_offer_text: "10% off weekday recovery sessions",
  },
  {
    id: "fallback-owen-parker",
    slug: "owen-parker",
    city: "Dallas",
    display_name: "Owen Parker",
    full_name: "Owen Parker",
    bio: "Owen keeps his profile simple and approachable for clients who want therapeutic stretch work, a straightforward studio setup, and visible starting rates.",
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    phone: "+1 (214) 555-0103",
    specialties: ["Stretch Therapy", "Therapeutic Massage"],
    _tier: "standard",
    modality: "Stretch Therapy",
    status: "active",
    profile_views: 177,
    review_count: 8,
    incall_price: 95,
    outcall_price: null,
    business_hours: null,
    custom_faq: null,
    pricing_sessions: null,
    available_now: false,
    available_now_expires: null,
    is_verified_identity: true,
    is_verified_profile: true,
    is_verified_photos: false,
    neighborhood_name: "Medical District",
    primary_area: "North Dallas",
    years_experience: 3,
    start_year: null,
    latitude: 32.8105,
    longitude: -96.8413,
    zip_code: "75235",
    special_offer_text: null,
  },
  {
    id: "fallback-leo-martinez",
    slug: "leo-martinez",
    city: "Austin",
    display_name: "Leo Martinez",
    full_name: "Leo Martinez",
    bio: "Leo anchors Austin discovery with polished profile depth, bilingual communication, and a blend of lymphatic, deep tissue, and mobility-focused care.",
    avatar_url: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=900&q=80",
    phone: "+1 (512) 555-0104",
    specialties: ["Lymphatic", "Deep Tissue"],
    _tier: "elite",
    modality: "Lymphatic",
    status: "active",
    profile_views: 563,
    review_count: 33,
    incall_price: 125,
    outcall_price: 165,
    business_hours: null,
    custom_faq: null,
    pricing_sessions: null,
    available_now: false,
    available_now_expires: null,
    is_verified_identity: true,
    is_verified_profile: true,
    is_verified_photos: true,
    neighborhood_name: "South Congress",
    primary_area: "Central Austin",
    years_experience: 7,
    start_year: null,
    latitude: 30.2495,
    longitude: -97.7495,
    zip_code: "78704",
    special_offer_text: "Complimentary add-on stretch for first-time clients",
  },
  {
    id: "fallback-adrian-cole",
    slug: "adrian-cole",
    city: "Houston",
    display_name: "Adrian Cole",
    full_name: "Adrian Cole",
    bio: "Adrian serves Montrose and Downtown Houston with Thai, deep tissue, and mobility work for clients who want a modern, premium discovery experience.",
    avatar_url: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80",
    phone: "+1 (713) 555-0105",
    specialties: ["Thai Massage", "Recovery"],
    _tier: "pro",
    modality: "Thai Massage",
    status: "active",
    profile_views: 349,
    review_count: 21,
    incall_price: 115,
    outcall_price: 155,
    business_hours: null,
    custom_faq: null,
    pricing_sessions: null,
    available_now: true,
    available_now_expires: FUTURE_DATE,
    is_verified_identity: true,
    is_verified_profile: true,
    is_verified_photos: true,
    neighborhood_name: "Montrose",
    primary_area: "Inner Loop",
    years_experience: 5,
    start_year: null,
    latitude: 29.7487,
    longitude: -95.3906,
    zip_code: "77006",
    special_offer_text: null,
  },
  {
    id: "fallback-jordan-brooks",
    slug: "jordan-brooks",
    city: "Houston",
    display_name: "Jordan Brooks",
    full_name: "Jordan Brooks",
    bio: "Jordan keeps the experience warm and low-pressure with relaxation sessions, evening availability, and a studio setup that feels easy to say yes to quickly.",
    avatar_url: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=900&q=80",
    phone: "+1 (713) 555-0106",
    specialties: ["Relaxation", "Swedish"],
    _tier: "standard",
    modality: "Relaxation",
    status: "active",
    profile_views: 214,
    review_count: 14,
    incall_price: 100,
    outcall_price: null,
    business_hours: null,
    custom_faq: null,
    pricing_sessions: null,
    available_now: false,
    available_now_expires: null,
    is_verified_identity: true,
    is_verified_profile: true,
    is_verified_photos: false,
    neighborhood_name: "Downtown Houston",
    primary_area: "Downtown",
    years_experience: 4,
    start_year: null,
    latitude: 29.7604,
    longitude: -95.3698,
    zip_code: "77002",
    special_offer_text: "Late evening rate from $100",
  },
  {
    id: "fallback-nico-hayes",
    slug: "nico-hayes",
    city: "Chicago",
    display_name: "Nico Hayes",
    full_name: "Nico Hayes",
    bio: "Nico is built for clients comparing same-day availability, downtown proximity, and premium recovery work before opening a profile.",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    phone: "+1 (312) 555-0107",
    specialties: ["Sports Recovery", "Deep Tissue"],
    _tier: "elite",
    modality: "Sports Recovery",
    status: "active",
    profile_views: 401,
    review_count: 26,
    incall_price: 130,
    outcall_price: 170,
    business_hours: null,
    custom_faq: null,
    pricing_sessions: null,
    available_now: true,
    available_now_expires: FUTURE_DATE,
    is_verified_identity: true,
    is_verified_profile: true,
    is_verified_photos: true,
    neighborhood_name: "River North",
    primary_area: "Downtown Chicago",
    years_experience: 9,
    start_year: null,
    latitude: 41.8925,
    longitude: -87.6343,
    zip_code: "60654",
    special_offer_text: null,
  },
  {
    id: "fallback-rafael-cruz",
    slug: "rafael-cruz",
    city: "Miami",
    display_name: "Rafael Cruz",
    full_name: "Rafael Cruz",
    bio: "Rafael blends hotel-friendly outcall, Swedish recovery, and polished profile presentation for Miami users who want distance and rate clarity fast.",
    avatar_url: "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?auto=format&fit=crop&w=900&q=80",
    phone: "+1 (305) 555-0108",
    specialties: ["Swedish", "Hotel Outcall"],
    _tier: "pro",
    modality: "Swedish",
    status: "active",
    profile_views: 286,
    review_count: 17,
    incall_price: null,
    outcall_price: 145,
    business_hours: null,
    custom_faq: null,
    pricing_sessions: null,
    available_now: true,
    available_now_expires: FUTURE_DATE,
    is_verified_identity: true,
    is_verified_profile: true,
    is_verified_photos: true,
    neighborhood_name: "Brickell",
    primary_area: "Downtown Miami",
    years_experience: 6,
    start_year: null,
    latitude: 25.7618,
    longitude: -80.1918,
    zip_code: "33131",
    special_offer_text: "Hotel outcall bundle starts at $145",
  },
];

type BasicDirectoryFilters = {
  city?: string;
  modality?: string;
  keyword?: string;
  session?: "home-visit" | "incall";
  verified?: boolean;
  availableToday?: boolean;
  tier?: TherapistTier;
  page?: number;
  pageSize?: number;
};

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function matchesCity(profile: FallbackTherapist, city?: string) {
  if (!city) {
    return true;
  }

  return normalize(profile.city) === normalize(city);
}

function matchesModality(profile: FallbackTherapist, modality?: string) {
  if (!modality) {
    return true;
  }

  const needle = normalize(modality);
  const haystack = [profile.modality, ...(profile.specialties || []), profile.bio]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(needle);
}

function matchesKeyword(profile: FallbackTherapist, keyword?: string) {
  if (!keyword) {
    return true;
  }

  const needle = normalize(keyword);
  const haystack = [
    profile.display_name,
    profile.full_name,
    profile.modality,
    profile.bio,
    ...(profile.specialties || []),
    profile.neighborhood_name,
    profile.primary_area,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(needle);
}

function matchesSession(profile: FallbackTherapist, session?: "home-visit" | "incall") {
  if (session === "home-visit") {
    return Boolean(profile.outcall_price);
  }

  if (session === "incall") {
    return Boolean(profile.incall_price);
  }

  return true;
}

function matchesVerified(profile: FallbackTherapist, verified?: boolean) {
  if (!verified) {
    return true;
  }

  return Boolean(
    profile._tier === "standard" ||
      profile._tier === "pro" ||
      profile._tier === "elite" ||
      profile.is_verified_identity ||
      profile.is_verified_profile,
  );
}

function matchesAvailableToday(profile: FallbackTherapist, availableToday?: boolean) {
  if (!availableToday) {
    return true;
  }

  if (!profile.available_now) return false;
  if (profile.available_now_expires) {
    return new Date(profile.available_now_expires) > new Date();
  }
  return true;
}

function matchesTier(profile: FallbackTherapist, tier?: TherapistTier) {
  if (!tier) {
    return true;
  }

  return profile._tier === tier;
}

const TIER_PRIORITY: Record<TherapistTier, number> = {
  elite: 0,
  pro: 1,
  standard: 2,
  free: 3,
};

export function getFallbackPublicTherapists(filters: BasicDirectoryFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.max(1, Math.min(500, filters.pageSize ?? 12));

  const filtered = FALLBACK_PUBLIC_THERAPISTS
    .filter((profile) => matchesCity(profile, filters.city))
    .filter((profile) => matchesModality(profile, filters.modality))
    .filter((profile) => matchesKeyword(profile, filters.keyword))
    .filter((profile) => matchesSession(profile, filters.session))
    .filter((profile) => matchesVerified(profile, filters.verified))
    .filter((profile) => matchesAvailableToday(profile, filters.availableToday))
    .filter((profile) => matchesTier(profile, filters.tier))
    .sort((left, right) => {
      const now = new Date();
      const leftActive = Boolean(left.available_now) && (!left.available_now_expires || new Date(left.available_now_expires) > now);
      const rightActive = Boolean(right.available_now) && (!right.available_now_expires || new Date(right.available_now_expires) > now);
      if (leftActive !== rightActive) {
        return Number(rightActive) - Number(leftActive);
      }

      const leftTier = TIER_PRIORITY[left._tier || "free"];
      const rightTier = TIER_PRIORITY[right._tier || "free"];
      if (leftTier !== rightTier) {
        return leftTier - rightTier;
      }

      return (right.review_count || 0) - (left.review_count || 0);
    });

  const from = (page - 1) * pageSize;
  const to = from + pageSize;

  return {
    items: filtered.slice(from, to),
    total: filtered.length,
    page,
    pageSize,
  };
}

export function getFallbackPublicTherapistBySlug(slug: string) {
  const normalizedSlug = normalize(slug);
  return (
    FALLBACK_PUBLIC_THERAPISTS.find(
      (profile) => normalize(profile.slug) === normalizedSlug || normalize(profile.id) === normalizedSlug,
    ) || null
  );
}
