import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  getCities,
  getImportedReviews,
  getProfilePhotos,
  getPublicTherapistBySlug,
  getPublicTherapists,
} from "@/app/_lib/directory";
import { getPublicProfileName } from "@/app/_lib/public-profile";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildHealthAndBeautyBusinessJsonLd,
  buildProfilePageJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import { galleryLimit } from "./_components/galleryLimit";
import { PremiumProfilePage } from "./_components/PremiumProfilePage";

// Demo/fallback profiles for SEO and testing
const DEMO_PROFILES: Record<string, any> = {
  'bruno-dallas-tx': {
    id: 'bruno-demo-001',
    slug: 'bruno-dallas-tx',
    display_name: 'Bruno',
    full_name: 'Bruno Santos',
    city: 'Dallas',
    state: 'Texas',
    neighborhood_name: 'Oak Lawn',
    primary_area: 'Uptown Dallas',
    bio: 'With 14 years of professional experience, I bring a unique blend of Brazilian therapeutic bodywork and diverse massage modalities to every session. My practice is rooted in both Brazilian and American massage traditions, offering techniques ranging from traditional AMMA Therapy and Zero Balancing to Deep Tissue, Shiatsu, Hot Stone, and Lymphatic Drainage. Based in Oak Lawn, I operate from a private studio with full amenities — shower, private restroom, and hot towels included. My practice is proudly LGBTQ+ owned and operated. Whether you prefer an in-studio session or a mobile outcall to your home or hotel throughout Dallas, I customize every session to your specific needs. Member of the National Association of Massage Therapists.',
    avatar_url: '/photos/bruno/photo-4.jpg',
    photo_url: '/photos/bruno/photo-4.jpg',
    gallery_photos: [
      '/photos/bruno/photo-4.jpg',
      '/photos/bruno/photo-3.jpg',
      '/photos/bruno/photo-1.jpg',
      '/photos/bruno/photo-2.jpg',
    ],
    modality: 'Licensed Massage Therapist',
    specialties: ['AMMA Therapy', 'Deep Tissue', 'Hot Stone', 'Lymphatic Drainage', 'Myofascial Release', 'Shiatsu', 'Swedish', 'Zero Balancing'],
    languages_spoken: ['English', 'Portuguese'],
    contact_email: 'bruno@masseurmatch.com',
    phone: '(762) 334-5300',
    incall_price: 175,
    outcall_price: 175,
    pricing_sessions: [
      { name: 'Standard Session', duration: 60, incall: 175, outcall: 175 },
      { name: 'Extended Session', duration: 90, incall: 250, outcall: 250 },
    ],
    years_experience: 14,
    lgbtq_affirming: true,
    accepts_all_genders: true,
    available_now: true,
    is_verified_identity: true,
    is_verified_profile: true,
    review_count: 12,
    _tier: 'pro',
    areas_served: ['Highland Park', 'University Park', 'Downtown Dallas', 'Turtle Creek', 'Oak Lawn', 'Uptown'],
    education: 'Degree in Accounting and Business, UFRJ (2000–2003)',
    training: [
      { label: 'National Association of Massage Therapists', detail: 'Professional Member' }
    ],
    promotions: [
      { title: 'Monday Special', description: '10% off any session on Mondays' },
      { title: 'Weekly Offer', description: '$10 off any session – week of April 5' },
      { title: 'Loyalty & Service Discounts', description: 'Special discounts for military, law enforcement, and repeat clients' },
    ],
    add_ons: [
      { name: 'Cupping Therapy', price: 25 },
      { name: 'Fitness Training', price: 50 },
    ],
    travel_schedule: [
      { city: 'Pensacola', state: 'FL', start_date: '2026-04-01', end_date: '2026-04-01' },
      { city: 'Tallahassee', state: 'FL', start_date: '2026-04-02', end_date: '2026-04-02' },
    ],
    custom_faq: [
      {
        question: 'What massage techniques do you offer?',
        answer: 'I offer AMMA Therapy, Deep Tissue, Hot Stone, Lymphatic Drainage, Myofascial Release, Shiatsu, Swedish, and Zero Balancing. I also offer cupping therapy and fitness training as add-ons.'
      },
      {
        question: 'What are your rates?',
        answer: '60-minute sessions start at $175 and 90-minute sessions are $250. I offer a 10% Monday discount and periodic promotional deals. Special pricing available for military, law enforcement, and repeat clients.'
      },
      {
        question: 'Do you offer outcall services?',
        answer: 'Yes! I offer mobile massage to homes and hotels throughout Dallas, including Highland Park, University Park, Downtown Dallas, Turtle Creek, Oak Lawn, and Uptown.'
      },
      {
        question: 'What are your hours?',
        answer: 'I am available daily from midnight to 11pm. Contact me via text or call to schedule your session.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'I accept Apple Pay, Cash, Mastercard, Venmo, Visa, and Zelle.'
      },
      {
        question: 'Is your practice LGBTQ+ friendly?',
        answer: 'Absolutely. My practice is proudly LGBTQ+ owned and operated. I welcome all clients and create a safe, inclusive, and judgment-free environment.'
      }
    ]
  }
};

type Params = { slug: string };

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const res = await getPublicTherapists({ page: 1, pageSize: 200 });
    const dbParams = res.items.map((item) => ({ slug: item.slug || item.id }));
    
    // Always include demo profiles
    const demoParams = Object.keys(DEMO_PROFILES).map(slug => ({ slug }));
    
    // Merge and deduplicate
    const allParams = [...demoParams, ...dbParams];
    const seen = new Set<string>();
    return allParams.filter(p => {
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    });
  } catch {
    // If DB fails, return demo profiles
    return Object.keys(DEMO_PROFILES).map(slug => ({ slug }));
  }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  let profile = await getPublicTherapistBySlug(resolvedParams.slug);

  // Use demo profile as fallback
  if (!profile && DEMO_PROFILES[resolvedParams.slug]) {
    profile = DEMO_PROFILES[resolvedParams.slug];
  }

  if (!profile) {
    return createPageMetadata({
      title: "Therapist profile",
      description: "Public massage therapist profile.",
      path: `/therapists/${resolvedParams.slug}`,
      noIndex: true,
    });
  }

  const name = getPublicProfileName(profile);
  const city = profile.city || "US";
  const neighborhood = profile.neighborhood_name || profile.primary_area;
  const topTechnique = profile.specialties?.[0] || profile.modality || "Massage";
  const yearsExp =
    profile.years_experience ?? (profile.start_year ? new Date().getFullYear() - profile.start_year : null);
  const verified = profile.is_verified_identity || profile.is_verified_profile;
  const priceFrom = [profile.incall_price, profile.outcall_price]
    .filter((p): p is number => typeof p === "number" && p > 0)
    .sort((a, b) => a - b)[0];

  const titleParts = [
    name,
    [verified ? "Verified" : null, topTechnique, "Therapist"].filter(Boolean).join(" "),
    [neighborhood, city].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(" | ");

  const descParts = [
    `${name} is a${yearsExp ? ` ${yearsExp}+ year` : ""} professional massage therapist`,
    neighborhood ? `in ${neighborhood}, ${city}` : `in ${city}`,
    `specializing in ${topTechnique}.`,
    priceFrom ? `Sessions from $${priceFrom}.` : null,
    verified ? "Identity verified." : null,
    "View rates, availability & book directly.",
  ].filter(Boolean);

  const description = profile.bio
    ? profile.bio.length > 160 ? profile.bio.slice(0, 157) + "..." : profile.bio
    : descParts.join(" ");

  return createPageMetadata({
    title: titleParts,
    description,
    path: `/therapists/${profile.slug || profile.id}`,
    type: "profile",
    image: profile.avatar_url || undefined,
    keywords: [
      profile.city,
      neighborhood,
      profile.modality,
      ...(profile.specialties || []),
      "massage therapist",
      "male massage therapist",
      "verified massage therapist",
      neighborhood ? `massage ${neighborhood}` : null,
      profile.city ? `gay massage ${profile.city}` : null,
      profile.city ? `LGBTQ massage ${profile.city}` : null,
    ].filter((value): value is string => Boolean(value)),
  });
}

export default async function TherapistPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  let profile = await getPublicTherapistBySlug(resolvedParams.slug);

  // Use demo profile as fallback
  if (!profile && DEMO_PROFILES[resolvedParams.slug]) {
    profile = DEMO_PROFILES[resolvedParams.slug];
  }

  if (!profile) {
    notFound();
  }

  const photoLimit = galleryLimit(profile._tier);
  const [reviews, photos] = await Promise.all([
    getImportedReviews(profile.id, 5),
    getProfilePhotos(profile.id, photoLimit),
  ]);

  const name = getPublicProfileName(profile);
  const profilePath = `/therapists/${profile.slug || profile.id}`;
  const matchedCity = getCities().find((city) => city.name.toLowerCase() === (profile.city || "").toLowerCase());
  const cityPath = matchedCity
    ? `/${matchedCity.slug}`
    : profile.city
      ? `/search?city=${encodeURIComponent(profile.city)}`
      : "/search";

  const faqItems =
    Array.isArray(profile.custom_faq) && profile.custom_faq.length > 0
      ? (profile.custom_faq as { question: string; answer: string }[])
      : [];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Therapists", path: "/therapists" },
          ...(matchedCity ? [{ name: matchedCity.name, path: `/${matchedCity.slug}` }] : []),
          { name, path: profilePath },
        ])}
      />
      <JsonLd
        data={buildProfilePageJsonLd({
          name,
          path: profilePath,
          description:
            profile.bio ||
            `${name} is listed on MasseurMatch with city context, specialties, and direct contact information.`,
          city: profile.city,
          specialties: profile.specialties,
          image: profile.avatar_url,
          tier: profile._tier,
          incallPrice: profile.incall_price,
          outcallPrice: profile.outcall_price,
          reviews: reviews.map((review) => ({
            rating: review.rating,
            reviewText: review.review_text,
            reviewerName: review.reviewer_name,
          })),
        })}
      />
      <JsonLd
        data={buildHealthAndBeautyBusinessJsonLd({
          name,
          slug: profile.slug || profile.id,
          description:
            profile.bio ||
            `${name} is a professional massage therapist in ${profile.city || "the US"} specializing in ${profile.specialties?.[0] || profile.modality || "Massage"}.`,
          city: profile.city,
          stateCode: matchedCity?.stateCode,
          specialty: profile.specialties?.[0] || profile.modality || "Massage",
          image: profile.avatar_url,
          phone: profile.phone,
          incallPrice: profile.incall_price,
          outcallPrice: profile.outcall_price,
          reviews: reviews.map((review) => ({
            rating: review.rating,
            reviewText: review.review_text,
            reviewerName: review.reviewer_name,
          })),
        })}
      />
      {faqItems.length > 0 ? <JsonLd data={buildFaqJsonLd(faqItems)} /> : null}

      <PremiumProfilePage
        profile={profile}
        photos={photos}
        reviews={reviews}
        cityPath={cityPath}
      />
    </>
  );
}
