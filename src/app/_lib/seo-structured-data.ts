import { siteUrl, SITE_URL } from "@/lib/site";

export const generateLocalServiceSchema = ({
  name,
  slug,
  description,
  city,
  stateCode,
  specialty,
  image,
  phone,
  serviceType = "Massage Therapy",
  incallPrice,
  outcallPrice,
  reviews = [],
}: {
  name: string;
  slug: string;
  description: string;
  city?: string | null;
  stateCode?: string | null;
  specialty: string;
  image?: string | null;
  phone?: string | null;
  serviceType?: string;
  incallPrice?: number | null;
  outcallPrice?: number | null;
  reviews?: Array<{ rating: number | null; reviewText: string; reviewerName?: string | null }>;
}) => {
  const ratedReviews = reviews.filter((r) => typeof r.rating === "number");
  const averageRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / ratedReviews.length
      : null;

  const priceRange =
    (incallPrice ?? 0) >= 200 || (outcallPrice ?? 0) >= 200 ? "$$$" : (incallPrice ?? 0) >= 100 ? "$$" : "$";

  return {
    "@context": "https://schema.org",
    "@type": "LocalService",
    name,
    description,
    url: siteUrl(`/therapists/${slug}`),
    image: image || undefined,
    ...(phone ? { telephone: phone } : {}),
    priceRange,
    areaServed: {
      "@type": "City",
      name: city,
      ...(stateCode ? { containedInPlace: { "@type": "State", name: stateCode } } : {}),
    },
    serviceType,
    ...(incallPrice || outcallPrice
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            ...(incallPrice ? { price: incallPrice } : {}),
            ...(outcallPrice ? { price: outcallPrice } : {}),
            availability: "https://schema.org/ByAppointment",
          },
        }
      : {}),
    ...(averageRating !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(averageRating.toFixed(1)),
            reviewCount: ratedReviews.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
};

export const generateCityLocalBusinessCollectionSchema = ({
  cityName,
  stateName,
  stateCode,
  path,
  therapistCount,
  averageRating,
  reviewCount,
}: {
  cityName: string;
  stateName: string;
  stateCode: string;
  path: string;
  therapistCount: number;
  averageRating?: number | null;
  reviewCount?: number;
}) => ({
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "CollectionPage"],
  name: `Male Massage Therapists Directory — ${cityName}, ${stateName}`,
  description: `Directory of verified LGBTQ+-affirming independent male massage therapists in ${cityName}, ${stateName}. Browse ${therapistCount}+ therapists, compare specialties, pricing, reviews, and direct contact.`,
  url: siteUrl(path),
  address: {
    "@type": "PostalAddress",
    addressLocality: cityName,
    addressRegion: stateCode,
    addressCountry: "US",
  },
  areaServed: {
    "@type": "City",
    name: cityName,
    containedInPlace: {
      "@type": "State",
      name: stateName,
    },
  },
  geo: {
    "@type": "Place",
    name: `${cityName}, ${stateName}`,
  },
  ...(averageRating != null && reviewCount
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: Number(averageRating.toFixed(1)),
          reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }
    : {}),
  numberOfItems: therapistCount,
  itemListElement: [], // Will be populated by the page renderer if needed
});

export const generateFAQSchema = (
  faqs: Array<{
    question: string;
    answer: string;
  }>
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

export const generateBreadcrumbSchema = (
  breadcrumbs: Array<{
    name: string;
    path: string;
  }>
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.map((crumb, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: crumb.name,
    item: siteUrl(crumb.path),
  })),
});

export const DIRECTORY_FAQ_SCHEMA = [
  {
    question: "What is MasseurMatch?",
    answer:
      "MasseurMatch is a premium directory of verified LGBTQ+-affirming independent male massage therapists across the United States. We help clients find trustworthy therapists and allow therapists to connect directly with clients.",
  },
  {
    question: "Are all therapists on MasseurMatch verified?",
    answer:
      "Yes. All therapist profiles undergo an identity verification process before going live. Verification helps ensure trust and safety for both clients and therapists.",
  },
  {
    question: "How do I book an appointment?",
    answer:
      "You can browse therapist profiles on MasseurMatch and contact them directly using the contact information provided on their profile. We facilitate connections but do not process bookings directly.",
  },
  {
    question: "Is MasseurMatch inclusive of LGBTQ+ clients?",
    answer:
      "Absolutely. MasseurMatch specializes in connecting LGBTQ+ clients with affirming male massage therapists. Every therapist on our platform has committed to providing welcoming, non-judgmental service.",
  },
  {
    question: "What types of massage services are available?",
    answer:
      "Our therapists offer a wide range of services including Swedish massage, deep tissue, sports massage, relaxation massage, and specialized therapeutic techniques. Check individual therapist profiles for specific service offerings.",
  },
  {
    question: "How can therapists join MasseurMatch?",
    answer:
      "Therapists can apply to be listed on MasseurMatch. Our onboarding process includes identity verification and compliance with our professional standards. Approved therapists gain access to our client directory and marketing tools.",
  },
  {
    question: "What is the average cost of massage therapy?",
    answer:
      "Pricing varies by therapist and location. Most therapists on MasseurMatch charge between $80-$200+ per session. Individual profiles display specific rates for incall and outcall services.",
  },
  {
    question: "Do therapists offer outcall services?",
    answer:
      "Many therapists on MasseurMatch offer outcall (mobile) services. Filter by availability when browsing profiles to find therapists who come to your location.",
  },
];
