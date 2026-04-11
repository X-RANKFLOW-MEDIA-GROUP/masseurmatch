import type { Metadata } from "next";
import { SITE_URL, siteUrl } from "@/lib/site";
import { buildCanonicalPath } from "@/app/_lib/route-normalization";

export const SITE_NAME = "MasseurMatch";
export const SITE_TAGLINE = "The safest and most trusted premium male massage directory for direct connection";
export const SITE_DESCRIPTION =
  "Find verified male massage therapists in major US cities, compare trust signals and specialties, and connect directly through a safer premium directory.";
export const DEFAULT_SOCIAL_HANDLE = "@masseurmatch";
export const appUrl = SITE_URL;

export const DEFAULT_KEYWORDS = [
  "massage therapists",
  "massage therapist directory",
  "male massage therapist",
  "verified male massage therapist",
  "gay massage directory",
  "massage near me",
  "trusted male massage directory",
  "sports massage",
  "deep tissue massage",
  "swedish massage",
  "premium wellness directory",
  "city massage listings",
];

type PageMetadataInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type ItemListEntry = {
  name: string;
  path: string;
};

type ProfileReview = {
  rating: number | null;
  reviewText: string;
  reviewerName?: string | null;
};

type ProfileJsonLdInput = {
  name: string;
  path: string;
  description: string;
  city?: string | null;
  specialties?: string[] | null;
  image?: string | null;
  tier?: string | null;
  incallPrice?: number | null;
  outcallPrice?: number | null;
  reviews?: ProfileReview[];
};

type ArticleJsonLdInput = {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  author: string;
};

type HealthAndBeautyBusinessJsonLdInput = {
  name: string;
  slug: string;
  description: string;
  city?: string | null;
  stateCode?: string | null;
  specialty: string;
  image?: string | null;
  phone?: string | null;
  incallPrice?: number | null;
  outcallPrice?: number | null;
  reviews?: ProfileReview[];
};

type LocalBusinessJsonLdInput = {
  cityName: string;
  stateName: string;
  path: string;
  therapistCount: number;
  averageRating?: number | null;
  reviewCount?: number;
};

const dedupeStrings = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))));

export const buildOgImageUrl = (params: Record<string, string | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return siteUrl(query ? `/api/og?${query}` : "/api/og");
};

export const createPageMetadata = ({
  title,
  description,
  path = "/",
  image,
  keywords = [],
  type = "website",
  noIndex = false,
}: PageMetadataInput): Metadata => {
  const canonical = siteUrl(buildCanonicalPath(path));
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const socialImage = image || buildOgImageUrl({ title, label: SITE_NAME });

  return {
    title: fullTitle,
    description,
    keywords: dedupeStrings([...DEFAULT_KEYWORDS, ...keywords]),
    alternates: {
      canonical,
    },
    openGraph: {
      type,
      url: canonical,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      locale: "en_US",
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [socialImage],
      creator: DEFAULT_SOCIAL_HANDLE,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
};

export const buildOrganizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: buildOgImageUrl({ title: SITE_NAME, label: "Logo" }),
  email: "support@masseurmatch.com",
  sameAs: [
    "https://x.com/masseurmatch",
    "https://www.instagram.com/masseurmatch",
  ],
});

export const buildWebsiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl("/search")}?city={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const buildBreadcrumbJsonLd = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: siteUrl(item.path),
  })),
});

export const buildCollectionPageJsonLd = ({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name,
  description,
  url: siteUrl(path),
  isPartOf: {
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
});

export const buildItemListJsonLd = ({
  name,
  path,
  items,
}: {
  name: string;
  path: string;
  items: ItemListEntry[];
}) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  url: siteUrl(path),
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    url: siteUrl(item.path),
  })),
});

export const buildFaqJsonLd = (items: FaqItem[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

export const buildContactPageJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: `Contact ${SITE_NAME}`,
  url: siteUrl("/contact"),
  description: "Reach the MasseurMatch team for support, trust and safety, or partnership questions.",
});

export const buildArticleJsonLd = ({
  title,
  description,
  path,
  publishedAt,
  author,
}: ArticleJsonLdInput) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: title,
  description,
  datePublished: publishedAt,
  dateModified: publishedAt,
  author: {
    "@type": "Person",
    name: author,
  },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  },
  mainEntityOfPage: siteUrl(path),
  image: [buildOgImageUrl({ title, label: "Blog" })],
});

export const buildProfilePageJsonLd = ({
  name,
  path,
  description,
  city,
  specialties,
  image,
  tier,
  incallPrice,
  outcallPrice,
  reviews = [],
}: ProfileJsonLdInput) => {
  const ratedReviews = reviews.filter((review) => typeof review.rating === "number");
  const averageRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce((total, review) => total + (review.rating || 0), 0) / ratedReviews.length
      : null;

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${name} on ${SITE_NAME}`,
    description,
    url: siteUrl(path),
    mainEntity: {
      "@type": "Person",
      name,
      description,
      image: image || buildOgImageUrl({ title: name, label: "Profile" }),
      address: city
        ? {
            "@type": "PostalAddress",
            addressLocality: city,
            addressCountry: "US",
          }
        : undefined,
      knowsAbout: specialties || undefined,
      makesOffer:
        incallPrice || outcallPrice
          ? {
              "@type": "Offer",
              priceCurrency: "USD",
              price: incallPrice || outcallPrice || undefined,
              availability: "https://schema.org/InStock",
              category: tier || "directory listing",
            }
          : undefined,
      aggregateRating:
        averageRating !== null
          ? {
              "@type": "AggregateRating",
              ratingValue: Number(averageRating.toFixed(1)),
              reviewCount: ratedReviews.length,
            }
          : undefined,
      review:
        reviews.length > 0
          ? reviews.map((review) => ({
              "@type": "Review",
              reviewBody: review.reviewText,
              author: {
                "@type": "Person",
                name: review.reviewerName || "Anonymous",
              },
              reviewRating:
                typeof review.rating === "number"
                  ? {
                      "@type": "Rating",
                      ratingValue: review.rating,
                      bestRating: 5,
                    }
                  : undefined,
            }))
          : undefined,
    },
  };
};

export const buildHealthAndBeautyBusinessJsonLd = ({
  name,
  slug,
  description,
  city,
  stateCode,
  specialty,
  image,
  phone,
  incallPrice,
  outcallPrice,
  reviews = [],
}: HealthAndBeautyBusinessJsonLdInput) => {
  const profileUrl = siteUrl(`/therapists/${slug}`);
  const ratedReviews = reviews.filter((r) => typeof r.rating === "number");
  const averageRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / ratedReviews.length
      : null;

  const priceRange =
    (incallPrice ?? 0) >= 200 || (outcallPrice ?? 0) >= 200 ? "$$$" : (incallPrice ?? 0) >= 100 ? "$$" : "$";

  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name,
    image: image || buildOgImageUrl({ title: name, label: "Profile" }),
    "@id": profileUrl,
    url: profileUrl,
    ...(phone ? { telephone: phone } : {}),
    priceRange,
    description,
    address: city
      ? {
          "@type": "PostalAddress",
          addressLocality: city,
          ...(stateCode ? { addressRegion: stateCode } : {}),
          addressCountry: "US",
        }
      : undefined,
    ...(averageRating !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(averageRating.toFixed(1)),
            reviewCount: ratedReviews.length,
            bestRating: 5,
          },
        }
      : {}),
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: specialty,
      },
    },
  };
};

export const buildLocalBusinessJsonLd = ({
  cityName,
  stateName,
  path,
  therapistCount,
  averageRating,
  reviewCount,
}: LocalBusinessJsonLdInput) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: `${SITE_NAME} — ${cityName}`,
  description: `Browse ${therapistCount} verified male massage therapists in ${cityName}, ${stateName}. Transparent pricing, real availability, and direct contact.`,
  url: siteUrl(path),
  address: {
    "@type": "PostalAddress",
    addressLocality: cityName,
    addressRegion: stateName,
    addressCountry: "US",
  },
  ...(averageRating != null && reviewCount
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: Number(averageRating.toFixed(1)),
          reviewCount,
          bestRating: 5,
        },
      }
    : {}),
});
