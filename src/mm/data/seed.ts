import type { BlogPost, City, DemoStore, Keyword, Review, Subscription, Therapist, User } from "@/mm/types";
import { hashPassword } from "@/mm/lib/security";
import { slugify } from "@/mm/lib/utils";

const now = "2026-03-14T12:00:00.000Z";

const cities: City[] = [
  {
    id: "city-dallas",
    slug: "dallas",
    name: "Dallas",
    state: "Texas",
    stateCode: "TX",
    description:
      "Dallas blends polished wellness studios, direct communication, and a strong Oak Lawn and Uptown directory audience looking for trustworthy therapist profiles.",
    latitude: 32.7767,
    longitude: -96.797,
    hero:
      "A clean Dallas skyline directory page with therapist cards, city notes, and direct contact options.",
  },
  {
    id: "city-houston",
    slug: "houston",
    name: "Houston",
    state: "Texas",
    stateCode: "TX",
    description:
      "Houston visitors tend to compare neighborhoods, modality depth, and flexible incall or outcall options before they reach out to a provider.",
    latitude: 29.7604,
    longitude: -95.3698,
    hero:
      "A Houston local directory view focused on inclusive therapists, clear modality tags, and contact-first listings.",
  },
  {
    id: "city-austin",
    slug: "austin",
    name: "Austin",
    state: "Texas",
    stateCode: "TX",
    description:
      "Austin searchers respond to personality-rich profiles, detailed bodywork specialties, and directory pages that feel locally informed rather than generic.",
    latitude: 30.2672,
    longitude: -97.7431,
    hero:
      "An Austin directory landing page featuring confident editorial copy and therapist cards arranged around neighborhood discovery.",
  },
];

const keywordLabels = [
  "Deep Tissue",
  "Swedish",
  "Sports Massage",
  "Thai Massage",
  "Myofascial Release",
  "Trigger Point",
  "Lymphatic",
  "Cupping",
  "Stretch Therapy",
  "Prenatal",
  "Relaxation",
  "Aromatherapy",
  "Reflexology",
  "Hot Stone",
  "Recovery",
  "Neck Relief",
  "Shoulder Relief",
  "Back Relief",
  "Hip Relief",
  "Mobility Work",
  "Travel Friendly",
  "Hotel Outcall",
  "Incall Studio",
  "Same Day",
  "Weekend Hours",
  "Evening Hours",
  "English",
  "Spanish",
  "Portuguese",
  "French",
  "LGBTQ Affirming",
  "Gay Friendly",
  "Inclusive",
  "Male Therapist",
  "Female Therapist",
  "Non-Binary Therapist",
  "Bodywork",
  "Therapeutic Massage",
  "Stress Relief",
  "Wellness Recovery",
  "Athletic Recovery",
  "Compassionate Care",
  "First Session Friendly",
  "Quiet Studio",
  "Luxury Listing",
  "Budget Friendly",
  "Professional Boundaries",
  "Direct Contact",
  "Verified Photos",
  "Top Rated",
];

const keywords: Keyword[] = keywordLabels.map((label, index) => ({
  id: `keyword-${index + 1}`,
  slug: slugify(label),
  label,
  category:
    label.includes("Friendly") || label.includes("Affirming") || label.includes("Inclusive")
      ? "identity"
      : label.includes("Hours") || label.includes("Contact") || label.includes("Studio") || label.includes("Outcall")
        ? "intent"
        : "modality",
}));

const users: User[] = [
  {
    id: "user-admin",
    email: "admin@masseurmatch.com",
    fullName: "MasseurMatch Admin",
    role: "admin",
    passwordHash: hashPassword("Admin@MM2025!"),
    createdAt: now,
    emailConfirmed: true,
  },
  {
    id: "user-therapist",
    email: "therapist@masseurmatch.com",
    fullName: "Leo Martinez",
    role: "therapist",
    passwordHash: hashPassword("Therapist@MM2025!"),
    createdAt: now,
    emailConfirmed: true,
  },
];

const therapists: Therapist[] = [
  {
    id: "therapist-dallas-mason",
    userId: null,
    slug: "mason-ellis",
    displayName: "Mason Ellis",
    citySlug: "dallas",
    state: "TX",
    bio:
      "Mason works from Oak Lawn with a calm, recovery-first style built around deep tissue, stretch work, and direct communication before every session.",
    photoUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
    ],
    modalities: ["deep-tissue", "sports-massage", "stretch-therapy"],
    keywordSlugs: ["deep-tissue", "sports-massage", "athletic-recovery", "gay-friendly", "verified-photos"],
    languages: ["English", "Spanish"],
    contactEmail: "mason@masseurmatch.com",
    phone: "+1 (214) 555-1101",
    website: "https://masseurmatch.com/therapists/mason-ellis",
    incall: true,
    outcall: true,
    priceRange: "$120-$180",
    gayFriendly: true,
    inclusive: true,
    segments: ["gay", "inclusive", "male", "lgbtq"],
    latitude: 32.8093,
    longitude: -96.7995,
    tier: "featured",
    status: "approved",
    viewCount: 412,
    profileCompleteness: 96,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "therapist-dallas-raul",
    userId: null,
    slug: "raul-vega",
    displayName: "Raul Vega",
    citySlug: "dallas",
    state: "TX",
    bio:
      "Raul keeps his Dallas studio straightforward and welcoming, with Swedish and myofascial sessions tailored to stress relief and first-session comfort.",
    photoUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    ],
    modalities: ["swedish", "myofascial-release", "relaxation"],
    keywordSlugs: ["swedish", "myofascial-release", "first-session-friendly", "budget-friendly", "inclusive"],
    languages: ["English"],
    contactEmail: "raul@masseurmatch.com",
    phone: "+1 (972) 555-2202",
    website: "https://masseurmatch.com/therapists/raul-vega",
    incall: true,
    outcall: false,
    priceRange: "$90-$130",
    gayFriendly: false,
    inclusive: true,
    segments: ["inclusive", "male"],
    latitude: 32.783,
    longitude: -96.781,
    tier: "free",
    status: "approved",
    viewCount: 148,
    profileCompleteness: 88,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "therapist-houston-adrian",
    userId: null,
    slug: "adrian-cole",
    displayName: "Adrian Cole",
    citySlug: "houston",
    state: "TX",
    bio:
      "Adrian serves Montrose and Downtown Houston with a polished mix of Thai and deep tissue work, especially for clients who want clear pressure adjustments and consistent pacing.",
    photoUrl:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80",
    ],
    modalities: ["thai-massage", "deep-tissue", "mobility-work"],
    keywordSlugs: ["thai-massage", "deep-tissue", "mobility-work", "gay-friendly", "weekend-hours"],
    languages: ["English", "Portuguese"],
    contactEmail: "adrian@masseurmatch.com",
    phone: "+1 (713) 555-3303",
    website: "https://masseurmatch.com/therapists/adrian-cole",
    incall: true,
    outcall: true,
    priceRange: "$115-$175",
    gayFriendly: true,
    inclusive: true,
    segments: ["gay", "inclusive", "male", "lgbtq"],
    latitude: 29.7421,
    longitude: -95.378,
    tier: "pro",
    status: "approved",
    viewCount: 286,
    profileCompleteness: 92,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "therapist-houston-jordan",
    userId: null,
    slug: "jordan-brooks",
    displayName: "Jordan Brooks",
    citySlug: "houston",
    state: "TX",
    bio:
      "Jordan focuses on steady relaxation sessions for Houston visitors who want evening hours, direct contact details, and a calm neighborhood studio with professional boundaries.",
    photoUrl:
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=900&q=80",
    ],
    modalities: ["relaxation", "swedish", "aromatherapy"],
    keywordSlugs: ["relaxation", "swedish", "evening-hours", "direct-contact", "inclusive"],
    languages: ["English", "French"],
    contactEmail: "jordan@masseurmatch.com",
    phone: "+1 (832) 555-4404",
    website: "https://masseurmatch.com/therapists/jordan-brooks",
    incall: true,
    outcall: false,
    priceRange: "$95-$140",
    gayFriendly: false,
    inclusive: true,
    segments: ["inclusive", "female"],
    latitude: 29.7606,
    longitude: -95.3672,
    tier: "free",
    status: "approved",
    viewCount: 97,
    profileCompleteness: 84,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "therapist-austin-leo",
    userId: "user-therapist",
    slug: "leo-martinez",
    displayName: "Leo Martinez",
    citySlug: "austin",
    state: "TX",
    bio:
      "Leo anchors the Austin seed account with a fully developed profile, inclusive language, bilingual communication, and a detailed blend of deep tissue and lymphatic recovery work.",
    photoUrl:
      "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?auto=format&fit=crop&w=900&q=80",
    ],
    modalities: ["deep-tissue", "lymphatic", "recovery"],
    keywordSlugs: ["deep-tissue", "lymphatic", "recovery", "gay-friendly", "spanish", "luxury-listing"],
    languages: ["English", "Spanish"],
    contactEmail: "therapist@masseurmatch.com",
    phone: "+1 (512) 555-5505",
    website: "https://masseurmatch.com/therapists/leo-martinez",
    incall: true,
    outcall: true,
    priceRange: "$125-$185",
    gayFriendly: true,
    inclusive: true,
    segments: ["gay", "inclusive", "male", "lgbtq"],
    latitude: 30.2678,
    longitude: -97.7414,
    tier: "featured",
    status: "approved",
    viewCount: 525,
    profileCompleteness: 100,
    createdAt: now,
    updatedAt: now,
  },
];

const reviews: Review[] = [
  {
    id: "review-1",
    therapistId: "therapist-austin-leo",
    authorName: "Marco",
    rating: 5,
    body: "Clear communication, excellent pressure control, and a studio that felt calm from the start.",
    status: "approved",
    createdAt: now,
  },
  {
    id: "review-2",
    therapistId: "therapist-dallas-mason",
    authorName: "Tyler",
    rating: 5,
    body: "Great deep tissue work and no guesswork about what the session would cover.",
    status: "approved",
    createdAt: now,
  },
  {
    id: "review-3",
    therapistId: "therapist-houston-jordan",
    authorName: "Avery",
    rating: 4,
    body: "Comfortable atmosphere and thoughtful follow-up directions after the session.",
    status: "pending",
    createdAt: now,
  },
];

const blogPosts: BlogPost[] = [
  {
    id: "blog-1",
    slug: "best-gay-massage-directory-2026",
    title: "What Makes a Strong Massage Directory in 2026",
    excerpt:
      "The best directories help people compare therapists quickly, understand trust signals, and reach out without extra friction.",
    seoDescription:
      "Learn what makes a modern massage directory work for therapist discovery, city search, and direct contact.",
    content: `## Directory-first discovery

Strong directory products answer three questions quickly: who is available in the city, what kind of bodywork they offer, and how direct outreach works.

## Trust beats clutter

Visitors respond to clean profiles, real modality tags, visible contact methods, and profile status that makes approval or suspension obvious.

## City pages should feel local

Local directory pages work best when they explain neighborhoods, pricing context, and identity-friendly filters without sounding generic.`,
    tags: ["directory", "seo", "cities"],
    publishedAt: now,
    updatedAt: now,
  },
  {
    id: "blog-2",
    slug: "how-to-contact-a-therapist-confidently",
    title: "How to Reach Out to a Therapist Confidently",
    excerpt:
      "Direct outreach works best when profiles make services, boundaries, and preferred contact methods obvious.",
    seoDescription:
      "A practical guide to using therapist directory profiles to make clear first contact and ask better questions.",
    content: `## Start with the profile

Before you send a message, review the therapist's services, schedule style, neighborhood, and languages.

## Keep the first message direct

Mention your goal, preferred timeframe, and whether you are looking for incall or outcall options.

## Respect boundaries

Directories work best when contact details are used thoughtfully and therapists do not have to decode vague requests.`,
    tags: ["contact", "directory", "profiles"],
    publishedAt: now,
    updatedAt: now,
  },
  {
    id: "blog-3",
    slug: "austin-dallas-houston-directory-guide",
    title: "Austin, Dallas, and Houston: A Texas Directory Guide",
    excerpt:
      "Each city searches differently. Here is how to structure therapist discovery pages for Austin, Dallas, and Houston.",
    seoDescription:
      "Explore how Texas city directory pages can balance local context, identity filters, and direct therapist outreach.",
    content: `## Dallas

Dallas pages should foreground Oak Lawn, Uptown, and strong contact clarity.

## Houston

Houston directory visitors often compare neighborhoods and therapist flexibility before they reach out.

## Austin

Austin responds well to profiles with voice, modality depth, and a strong sense of neighborhood fit.`,
    tags: ["texas", "cities", "seo"],
    publishedAt: now,
    updatedAt: now,
  },
];

const subscriptions: Subscription[] = [
  {
    id: "sub-therapist",
    userId: "user-therapist",
    tier: "featured",
    status: "active",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    currentPeriodEnd: "2026-04-14T12:00:00.000Z",
  },
];

export function createSeedStore(): DemoStore {
  return {
    users,
    therapists,
    reviews,
    cities,
    keywords,
    blogPosts,
    subscriptions,
  };
}
