import type { PublicTherapist, ProfilePhoto } from "@/app/_lib/directory";
import { getCities } from "@/app/_lib/directory";
import { SITE_URL } from "@/lib/site";

export type ProfileViewModel = {
  id: string;
  slug: string;
  name: string;
  headline: string;
  bio: string;
  gender: string;
  orientation: string;
  age: string;
  ethnicity: string;
  bodyType: string;
  height: string;
  weight: string;
  rawBodyType: string | null;
  rawHeightInches: number | null;
  rawWeightLb: number | null;
  yearsExperience: string;
  languages: string[];
  profilePhotoUrl: string;
  coverPhotoUrl: string;
  galleryImages: string[];
  city: string;
  state: string;
  country: string;
  citySlug: string;
  stateSlug: string;
  neighborhood: string;
  serviceArea: string;
  serviceAreas: string[];
  nearbyCities: Array<{ name: string; slug: string }>;
  mapLat: number | null;
  mapLng: number | null;
  travelRadius: string;
  incallAvailable: boolean;
  outcallAvailable: boolean;
  services: string[];
  specialties: string[];
  massageTypes: string[];
  sessionDurationOptions: string[];
  pricing: Array<{ name: string; duration: string; incall: string; outcall: string }>;
  startingPrice: string;
  incallPrice: string;
  outcallPrice: string;
  currency: string;
  availabilityDays: string[];
  availabilityHours: string;
  sameDayAvailable: boolean;
  advanceBookingRequired: string;
  lastActiveAt: string;
  responseTime: string;
  memberSince: string;
  phone: string | null;
  whatsapp: string | null;
  telegram: string | null;
  website: string | null;
  instagram: string | null;
  email: string | null;
  preferredContactMethod: string;
  isVerified: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  profileStatus: string;
  licenseOptional: string;
  backgroundChecked: boolean;
  viewsCount: string;
  favoritesCount: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  canonicalUrl: string;
  ogImage: string;
  serviceSlug: string;
};

type AnyProfile = PublicTherapist & Record<string, unknown>;

const PLACEHOLDER = "/images/placeholder-therapist.jpg";
const DEFAULT_COVER = "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80";

export function slugify(value: string | null | undefined) {
  return (value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function money(value: unknown, currency = "USD") {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) return "Contact for rates";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `$${Math.round(value)}`;
  }
}

function dateLabel(value: unknown, fallback: string) {
  if (typeof value !== "string" || !value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function fullDateLabel(value: unknown, fallback: string) {
  if (typeof value !== "string" || !value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatHeight(inches: unknown) {
  if (typeof inches !== "number" || inches <= 0) return "Available on request";
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

function formatWeight(weight: unknown) {
  if (typeof weight !== "number" || weight <= 0) return "Available on request";
  return `${weight} lb`;
}

function businessDays(hours: unknown) {
  if (!hours || typeof hours !== "object" || Array.isArray(hours)) return [];
  return Object.entries(hours as Record<string, unknown>)
    .filter(([, value]) => Boolean((value as { enabled?: boolean })?.enabled ?? value))
    .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));
}

export function buildProfileViewModel(profile: PublicTherapist, photos: ProfilePhoto[] = []): ProfileViewModel {
  const p = profile as AnyProfile;
  const name = profile.display_name || profile.full_name || String(p.name || "MasseurMatch Therapist");
  const city = profile.city || "Your city";
  const state = profile.state || String(p.state_code || "US");
  const country = String(p.country || "United States");
  const matchedCity = getCities().find((item) => item.name.toLowerCase() === city.toLowerCase());
  const citySlug = String(p.city_slug || matchedCity?.slug || slugify(`${city}-${state}`) || "search");
  const stateSlug = String(p.state_slug || slugify(state) || "states");
  const services = asStringArray(p.services).concat(asStringArray(profile.service_categories));
  const specialties = asStringArray(profile.specialties);
  const massageTypes = asStringArray(p.massage_types).concat(asStringArray(profile.massage_techniques));
  const allServices = Array.from(new Set([...services, ...specialties, ...massageTypes])).filter(Boolean);
  const serviceSlug = String(p.service_slug || slugify(allServices[0]) || "massage");
  const currency = String(p.currency || "USD");
  const galleryFromProfile = asStringArray(p.gallery_images).concat(profile.gallery_photos || []);
  const galleryFromPhotos = photos.map((photo) => photo.storage_path).filter(Boolean);
  const profilePhotoUrl = String(p.profile_photo_url || profile.profile_photo || profile.avatar_url || photos.find((photo) => photo.is_primary)?.storage_path || PLACEHOLDER);
  const coverPhotoUrl = String(p.cover_photo_url || p.cover_photo || galleryFromProfile[0] || galleryFromPhotos.find((url) => url !== profilePhotoUrl) || DEFAULT_COVER);
  const galleryImages = Array.from(new Set([profilePhotoUrl, coverPhotoUrl, ...galleryFromProfile, ...galleryFromPhotos])).filter(Boolean).slice(0, 12);
  const pricingSessions = Array.isArray(profile.pricing_sessions) ? profile.pricing_sessions : [];
  const serviceAreas = Array.from(new Set([...asStringArray(p.service_areas), ...(profile.areas_served || [])])).filter(Boolean);
  const nearbyCities = getCities()
    .filter((item) => item.name.toLowerCase() !== city.toLowerCase() && (!matchedCity || item.stateCode === matchedCity.stateCode))
    .slice(0, 5)
    .map((item) => ({ name: item.name, slug: item.slug }));
  const incallAvailable = Boolean(p.incall_available ?? p.offers_incall ?? profile.incall_price);
  const outcallAvailable = Boolean(p.outcall_available ?? p.offers_outcall ?? profile.outcall_price ?? profile.outcall_radius_miles);
  const tier = profile.subscription_tier || String(p.tier || "");
  const seoKeywords = asStringArray(p.seo_keywords);
  const canonicalUrl = String(p.canonical_url || `${SITE_URL}/therapists/${profile.slug || profile.id}`);

  return {
    id: profile.id,
    slug: profile.slug || profile.id,
    name,
    headline: profile.headline || `${allServices[0] || "Massage"} therapist in ${city}`,
    bio: profile.bio || `${name} is a massage therapist based in ${city}, ${state}, offering professional massage services.`,
    gender: String(p.gender || "Available on request"),
    orientation: String(p.orientation || "Available on request"),
    age: p.age ? String(p.age) : "Available on request",
    ethnicity: String(p.ethnicity || "Available on request"),
    bodyType: profile.body_type || "Available on request",
    height: formatHeight(profile.height_inches),
    weight: formatWeight(profile.weight_lb),
    rawBodyType: profile.body_type || null,
    rawHeightInches: typeof profile.height_inches === "number" ? profile.height_inches : null,
    rawWeightLb: typeof profile.weight_lb === "number" ? profile.weight_lb : null,
    yearsExperience: profile.years_experience ? `${profile.years_experience}+ years` : "Experience listed on request",
    languages: asStringArray(profile.languages).length ? asStringArray(profile.languages) : ["English"],
    profilePhotoUrl,
    coverPhotoUrl,
    galleryImages,
    city,
    state,
    country,
    citySlug,
    stateSlug,
    neighborhood: profile.neighborhood_name || profile.neighborhood || profile.primary_area || "Serving central areas",
    serviceArea: String(p.service_area || serviceAreas.join(", ") || `${city} metro`),
    serviceAreas: serviceAreas.length ? serviceAreas : [city],
    nearbyCities,
    mapLat: typeof p.map_lat === "number" ? p.map_lat : profile.latitude ?? null,
    mapLng: typeof p.map_lng === "number" ? p.map_lng : profile.longitude ?? null,
    travelRadius: profile.outcall_radius_miles ? `${profile.outcall_radius_miles} miles` : p.travel_radius ? `${p.travel_radius} miles` : "Travel radius on request",
    incallAvailable,
    outcallAvailable,
    services: services.length ? Array.from(new Set(services)) : ["Professional massage"],
    specialties: specialties.length ? specialties : ["Personalized bodywork"],
    massageTypes: massageTypes.length ? Array.from(new Set(massageTypes)) : ["Therapeutic massage"],
    sessionDurationOptions: asStringArray(p.session_duration_options).length
      ? asStringArray(p.session_duration_options)
      : pricingSessions.map((item) => item.duration ? `${item.duration} minutes` : item.name || "Session").filter(Boolean),
    pricing: pricingSessions.map((item) => ({
      name: item.name || "Massage session",
      duration: item.duration ? `${item.duration} minutes` : "Custom duration",
      incall: money(item.incall, currency),
      outcall: money(item.outcall, currency),
    })),
    startingPrice: money(profile.starting_price || profile.incall_price || profile.outcall_price, currency),
    incallPrice: money(profile.incall_price, currency),
    outcallPrice: money(profile.outcall_price, currency),
    currency,
    availabilityDays: asStringArray(p.availability_days).length ? asStringArray(p.availability_days) : businessDays(profile.business_hours),
    availabilityHours: String(p.availability_hours || "Hours available by direct request"),
    sameDayAvailable: Boolean(p.same_day_available ?? profile.available_now),
    advanceBookingRequired: String(p.advance_booking_required || "Advance booking recommended"),
    lastActiveAt: fullDateLabel(p.last_active_at || profile.updated_at, "Recently active"),
    responseTime: String(p.response_time || (profile.available_now ? "Typically responds quickly" : "Response time available after contact")),
    memberSince: dateLabel(p.member_since || p.created_at || profile.updated_at, "Member profile active"),
    phone: profile.phone,
    whatsapp: profile.whatsapp_number,
    telegram: typeof p.telegram === "string" ? p.telegram : typeof p.telegram_handle === "string" ? p.telegram_handle : null,
    website: profile.website,
    instagram: typeof p.instagram === "string" ? p.instagram : null,
    email: profile.email_address,
    preferredContactMethod: String(p.preferred_contact_method || p.preferred_contact || (profile.whatsapp_number ? "WhatsApp" : profile.phone ? "Phone" : "Email")),
    isVerified: Boolean(p.is_verified ?? profile.is_verified_identity ?? profile.is_verified_profile ?? profile.verification_status === "verified"),
    isFeatured: Boolean(profile.is_featured),
    isPremium: ["standard", "pro", "elite", "Premium", "Pro", "Elite"].includes(String(tier)),
    profileStatus: profile.profile_status || "active",
    licenseOptional: String(p.license_optional || "Licensing details available on request"),
    backgroundChecked: Boolean(p.background_checked ?? profile.verification_status === "verified"),
    viewsCount: String(p.views_count || profile.profile_views || profile.contact_clicks || "New"),
    favoritesCount: String(p.favorites_count || "Save to favorites"),
    seoTitle: String(p.seo_title || `${name} | Massage Therapist in ${city}, ${state} | MasseurMatch`),
    seoDescription: String(p.seo_description || `Contact ${name}, a massage therapist in ${city}, ${state}. View massage services, availability, pricing, gallery, and contact details on MasseurMatch.`),
    seoKeywords: seoKeywords.length ? seoKeywords : Array.from(new Set([name, `massage therapist ${city}`, `massage services ${city}`, `incall massage ${city}`, `outcall massage ${city}`, ...specialties])),
    canonicalUrl,
    ogImage: String(p.og_image || profilePhotoUrl || coverPhotoUrl),
    serviceSlug,
  };
}

export function contactHref(type: "phone" | "whatsapp" | "telegram" | "email" | "website" | "instagram", value: string | null) {
  if (!value) return null;
  if (type === "phone") return `tel:${value.replace(/[^+\d]/g, "")}`;
  if (type === "whatsapp") return `https://wa.me/${value.replace(/[^\d]/g, "")}`;
  if (type === "telegram") return value.startsWith("http") ? value : `https://t.me/${value.replace(/^@/, "")}`;
  if (type === "email") return `mailto:${value}`;
  if (type === "instagram") return value.startsWith("http") ? value : `https://instagram.com/${value.replace(/^@/, "")}`;
  return value.startsWith("http") ? value : `https://${value}`;
}
