import type { ProfileViewModel } from "@/components/profile/profile-utils";
import { SITE_URL } from "@/lib/site";

// Shared demo data for the Bruno showcase profiles (/therapists/bruno-dallas-tx
// and /therapists/bruno-santos). These are intentional sample listings used to
// demonstrate the public profile design with realistic content. Real directory
// listings are rendered from the database via the dynamic [slug] route.

const GALLERY = [
  "/marketing/hero/cover.jpg",
  "/marketing/hero/avatar-1.jpg",
  "/marketing/hero/avatar-2.jpg",
  "/marketing/hero/avatar-3.jpg",
  "/marketing/hero/avatar-4.jpg",
  "/images/placeholder-therapist.jpg",
];

export const BRUNO_REVIEWS = [
  {
    quote:
      "Outstanding massage with Bruno. Very skilled, attentive, and truly goes above and beyond. Clean, fresh-smelling space and a deeply relaxing experience. One of the best I've found.",
    author: "Marco D.",
    date: "Apr 2026",
  },
  {
    quote:
      "I was in Dallas for work and booked with Bruno — incredible. Warm smile, sense of humor and strong, confident hands delivering the perfect deep-tissue pressure. I left completely recharged.",
    author: "James W.",
    date: "Jan 2026",
  },
  {
    quote:
      "I've been seeing Bruno for almost a year now, and he's hands-down the best therapist I've found. Incredibly skilled at deep tissue and relaxation, and one of the sweetest people you'll meet.",
    author: "Daniel R.",
    date: "Oct 2025",
  },
];

export const BRUNO_PROFILE: ProfileViewModel = {
  id: "bruno-dallas-tx",
  slug: "bruno-dallas-tx",
  name: "Bruno",
  headline: "Customized therapeutic massage, tailored to your body.",
  bio: "Bruno is a Brazilian-trained, LGBTQ+ owned and operated massage therapist based in Oak Lawn, Dallas. With 14 years of professional experience he blends Brazilian therapeutic bodywork with a range of modalities — Deep Tissue, Swedish, Hot Stone, Shiatsu, AMMA Therapy, Lymphatic Drainage, Myofascial Release, and Zero Balancing. He works from a private studio with full amenities (shower, private restroom, hot towels) and also offers high-end mobile outcall to your home or hotel throughout Dallas.",
  gender: "Male",
  orientation: "Available on request",
  age: "Available on request",
  ethnicity: "Brazilian",
  bodyType: "Available on request",
  height: "Available on request",
  weight: "Available on request",
  yearsExperience: "14+ years",
  languages: ["English", "Portuguese"],
  profilePhotoUrl: "/marketing/hero/cover.jpg",
  coverPhotoUrl: "/marketing/hero/cover.jpg",
  galleryImages: GALLERY,
  city: "Dallas",
  state: "TX",
  country: "United States",
  citySlug: "dallas",
  stateSlug: "texas",
  neighborhood: "Oak Lawn",
  serviceArea: "Oak Lawn, Uptown, Highland Park, University Park, Downtown Dallas, Turtle Creek",
  serviceAreas: ["Oak Lawn", "Uptown", "Highland Park", "University Park", "Downtown Dallas", "Turtle Creek"],
  nearbyCities: [
    { name: "Plano", slug: "plano" },
    { name: "Fort Worth", slug: "fort-worth" },
    { name: "Irving", slug: "irving" },
  ],
  mapLat: 32.8109,
  mapLng: -96.8126,
  travelRadius: "Mobile outcall across the Dallas metro",
  incallAvailable: true,
  outcallAvailable: true,
  services: ["Deep Tissue", "Swedish", "Hot Stone", "Shiatsu", "AMMA Therapy", "Lymphatic Drainage", "Myofascial Release", "Zero Balancing"],
  specialties: ["LGBTQ+ welcoming", "Brazilian bodywork", "Mobile outcall", "Sports recovery"],
  massageTypes: ["Deep Tissue", "Swedish", "Hot Stone", "Myofascial Release"],
  sessionDurationOptions: ["60 minutes", "90 minutes"],
  pricing: [
    { name: "Studio session", duration: "60 minutes", incall: "$175", outcall: "Ask for rates" },
    { name: "Extended session", duration: "90 minutes", incall: "$250", outcall: "Ask for rates" },
  ],
  startingPrice: "$175",
  incallPrice: "$175",
  outcallPrice: "Contact for rates",
  currency: "USD",
  availabilityDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  availabilityHours: "Midnight – 11 PM, every day",
  sameDayAvailable: true,
  advanceBookingRequired: "Same-day welcome; advance booking recommended for peak times",
  lastActiveAt: "Recently active",
  responseTime: "Typically responds quickly",
  memberSince: "2024",
  phone: "(762) 334-5300",
  whatsapp: "+17623345300",
  telegram: null,
  website: null,
  instagram: null,
  email: null,
  preferredContactMethod: "Phone",
  isVerified: true,
  isFeatured: true,
  isPremium: true,
  profileStatus: "approved",
  licenseOptional: "Licensed massage therapist",
  backgroundChecked: true,
  viewsCount: "New",
  favoritesCount: "Save to favorites",
  seoTitle: "Bruno — Verified Male Massage Therapist in Dallas, TX | MasseurMatch",
  seoDescription:
    "Bruno is a verified Brazilian massage therapist in Oak Lawn, Dallas TX. 14 years experience, LGBTQ+ welcoming. Deep Tissue, Hot Stone, Swedish and more. Sessions from $175.",
  seoKeywords: ["Bruno massage Dallas", "male massage therapist Dallas", "deep tissue massage Oak Lawn", "LGBTQ massage Dallas"],
  canonicalUrl: `${SITE_URL}/therapists/bruno-dallas-tx`,
  ogImage: "/marketing/hero/cover.jpg",
  serviceSlug: "deep-tissue",
};
