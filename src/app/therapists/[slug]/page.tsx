import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  getCities,
  getImportedReviews,
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
import { PremiumProfilePage } from "./_components/PremiumProfilePage";

// Demo/fallback profiles for SEO and testing
const DEMO_PROFILES: Record<string, any> = {
  'bruno-dallas-tx': {
    id: 'bruno-demo-001',
    slug: 'bruno-dallas-tx',
    display_name: 'Bruno',
    full_name: 'Bruno Martinez',
    city: 'Dallas',
    state: 'Texas',
    neighborhood_name: 'Oak Lawn',
    primary_area: 'Uptown Dallas',
    bio: 'Professional licensed massage therapist with 8 years of experience specializing in deep tissue and therapeutic massage. I create a welcoming, judgment-free environment for all clients. My approach combines traditional Swedish techniques with targeted deep tissue work to address your specific needs, whether that\'s stress relief, muscle recovery, or chronic pain management.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=face',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=face',
    modality: 'Licensed Massage Therapist',
    specialties: ['Deep Tissue', 'Swedish', 'Sports Massage', 'Therapeutic'],
    languages: ['English', 'Spanish'],
    contact_email: 'bruno@masseurmatch.com',
    phone: '214-555-0123',
    website: 'https://masseurmatch.com',
    incall_price: 120,
    outcall_price: 150,
    years_experience: 8,
    lgbtq_affirming: true,
    gay_friendly: true,
    inclusive: true,
    available_now: true,
    is_verified_identity: true,
    is_verified_profile: true,
    _tier: 'pro',
    travel_schedule: [
      { city: 'Austin', start_date: '2026-04-01', end_date: '2026-04-04' },
      { city: 'Houston', start_date: '2026-04-15', end_date: '2026-04-18' },
    ],
    custom_faq: [
      {
        question: 'What should I expect during my first session?',
        answer: 'During your first visit, we will discuss your goals, any areas of concern, and your preferred pressure level. The session is tailored entirely to your needs.'
      },
      {
        question: 'Do you offer outcall services?',
        answer: 'Yes, I offer mobile massage services throughout the Dallas area including Oak Lawn, Uptown, Downtown, and surrounding neighborhoods.'
      },
      {
        question: 'What is your cancellation policy?',
        answer: 'I require 24 hours notice for cancellations. Late cancellations may be subject to a fee.'
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

  const reviews = await getImportedReviews(profile.id, 5);

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
        reviews={reviews}
        cityPath={cityPath}
      />
    </>
  );
}
