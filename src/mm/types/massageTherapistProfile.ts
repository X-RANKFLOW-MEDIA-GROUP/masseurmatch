// TypeScript interface para o perfil do massagista
export interface MassageTherapistProfile {
  // Step 1 — Basics
  full_name: string;
  display_name: string;
  headline: string;
  bio_short: string;
  bio_full: string;
  experience_start: string; // ISO date
  languages: string[];

  // Step 2 — Location
  city: string;
  state: string;
  neighborhood: string;
  location_description: string;
  zip_code?: string;
  is_mappable: boolean;
  landmarks: string[];

  // Step 3 — Appointment Types
  offers_incall: boolean;
  offers_outcall: boolean;
  outcall_radius?: number;
  service_area_cities: string[];

  // Step 4 — Services
  massage_techniques: string[];
  specialties: string[];
  massage_setup: string[];
  mobile_extras: string[];
  incall_amenities: string[];
  additional_services: string[];
  products_used: string[];
  products_sold: string[];

  // Step 5 — Pricing
  starting_rate: number;
  rates_incall: { duration_minutes: number; price: number; display_note?: string }[];
  rates_outcall: { duration_minutes: number; price_or_label: string; display_note?: string }[];
  discounts?: string;
  weekly_specials?: string;
  rate_disclaimer?: string;
  payment_methods: string[];

  // Step 6 — Hours / Availability
  incall_hours: Record<string, { enabled: boolean; start: string; end: string }>;
  outcall_hours: Record<string, { enabled: boolean; start: string; end: string }>;
  available_now: boolean;
  available_today: boolean;
  same_day_booking: boolean;

  // Step 7 — Travel / Business Trips
  is_traveling: boolean;
  travel_cities: string[];
  travel_dates?: { start: string; end: string };
  travel_note?: string;

  // Step 8 — Professional Info
  years_experience: number;
  education: { school_name: string; program_name: string; city: string; country: string; start_date: string; end_date: string }[];
  licenses: { title: string; issuer: string; year: string }[];
  affiliations: string[];

  // Step 9 — Contact
  phone_number: string;
  show_email_button: boolean;
  email_address?: string;
  booking_link?: string;
  whatsapp_number?: string;
  telegram_handle?: string;

  // Step 10 — Profile Media
  profile_photo: string;
  gallery_photos: string[];
  cover_photo?: string;
  video_intro?: string;

  // Step 11 — Badges / Trust / Status
  tier: 'Free' | 'Standard' | 'Pro' | 'Elite';
  is_verified_profile: boolean;
  lgbtq_friendly: boolean;
  visiting_soon: boolean;
  top_rated: boolean;

  // Step 12 — SEO Fields Internos
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  slug: string;
  canonical_city?: string;

  // Step 13 — FAQs
  faqs?: { question: string; answer: string }[];

  // Step 14 — User Actions
  is_favorited?: boolean; // Se o usuário atual favoritou este perfil
  is_saved?: boolean;     // Se o usuário salvou este perfil
  can_report?: boolean;   // Se o usuário pode reportar este perfil
}
