import { SITE_URL, siteUrl } from "@/lib/site";

export const SEO_ENHANCEMENTS = {
  CORE_WEB_VITALS: {
    lcp: {
      target: "2.5s",
      strategy: [
        "Defer non-critical CSS",
        "Preload fonts (Satoshi woff2)",
        "Optimize hero image (WebP, responsive srcset)",
        "Remove render-blocking JavaScript",
        "Enable font-display: swap",
      ],
    },
    inp: {
      target: "200ms",
      strategy: [
        "Break up long JavaScript tasks",
        "Defer non-essential work",
        "Use requestIdleCallback for analytics",
        "Optimize event handlers",
      ],
    },
    cls: {
      target: "0.1",
      strategy: [
        "Reserve space for images (aspect-ratio)",
        "Avoid unsized DOM insertions",
        "Use transform instead of top/left",
        "Stable Google Ads/Analytics loading",
      ],
    },
  },
  IMAGE_OPTIMIZATION: {
    guidelines: [
      "Convert all images to WebP with JPEG fallback",
      "Use Next.js Image component with priority",
      "Responsive srcset for therapist photos",
      "Lazy loading for below-fold images",
      "Max width 1200px for web, 800px for mobile",
    ],
    therapistProfiles: {
      avatar: { width: 400, height: 400, format: "webp" },
      gallery: { width: 800, height: 600, format: "webp" },
    },
  },
  FONT_OPTIMIZATION: {
    satoshi: {
      strategy: "font-display: swap, preload woff2, subset Latin",
      preload: true,
      weights: [400, 500, 600, 700],
    },
  },
  STRUCTURED_DATA: {
    schemas: [
      "Organization (site-wide)",
      "WebSite (search action)",
      "LocalBusiness (city pages)",
      "LocalService (therapist profiles)",
      "AggregateRating (reviews)",
      "BreadcrumbList (navigation)",
      "FAQPage (trust/help content)",
      "CollectionPage (directory pages)",
    ],
    implementation: "JSON-LD in <head>, not inline HTML",
  },
  INTERNAL_LINKING: {
    patterns: [
      {
        name: "Homepage → City Pages",
        ratio: "Primary keyword + location modifier",
      },
      {
        name: "City Pages → Therapist Profiles",
        ratio: "Breadcrumb + primary CTA",
      },
      {
        name: "Therapist → Related Profiles",
        ratio: "Service type, specialty, location",
      },
      {
        name: "Blog → Cityguides",
        ratio: "Contextual, non-aggressive",
      },
    ],
  },
  META_TAGS: {
    characteristics: [
      "Title: 50-60 chars, keyword first, include location",
      "Description: 155-160 chars, action-oriented",
      "og:image: 1200x630 dynamic, text overlay",
      "twitter:card: summary_large_image",
      "Canonical: Always present, trailing slash normalized",
    ],
    cityPageExample: {
      title: "N Male Massage Therapists in [City], [State] | MasseurMatch",
      description:
        "Find verified LGBTQ+-affirming massage therapists in [City]. Compare specialties, pricing, reviews & direct contact.",
    },
  },
  TECHNICAL_SEO: {
    robots: {
      allowlist: ["/", "/[city]", "/[city]/[segment]", "/blog", "/about"],
      disallowlist: ["/admin", "/api", "/auth", "/dashboard", "/pro"],
    },
    sitemap: {
      refreshInterval: "1 hour",
      priority: {
        homepage: 1.0,
        cityPages: 0.9,
        therapistProfiles: 0.8,
        blog: 0.7,
      },
      changefreq: {
        homepage: "weekly",
        cityPages: "daily",
        therapistProfiles: "weekly",
        blog: "monthly",
      },
    },
    canonicals: "Normalize trailing slashes, enforce HTTPS, use absolute URLs",
  },
  PERFORMANCE_TARGETS: {
    lighthouse: {
      performance: 85,
      seo: 95,
      accessibility: 90,
      bestPractices: 90,
    },
    pageSpeed: {
      mobile: "60+",
      desktop: "80+",
    },
  },
};

export const buildServiceOfferSchema = ({
  name,
  description,
  priceMin,
  priceMax,
  areaServed = "US",
}: {
  name: string;
  description: string;
  priceMin: number;
  priceMax: number;
  areaServed?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name,
  description,
  provider: {
    "@type": "LocalBusiness",
    name: "MasseurMatch Therapist",
    areaServed,
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: priceMin,
    highPrice: priceMax,
    offerCount: 1,
  },
});

export const buildFAQPageSchema = (faqs: Array<{ q: string; a: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
});

export const buildBreadcrumbSchema = (
  breadcrumbs: Array<{ name: string; path: string }>
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.map((item, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: item.name,
    item: siteUrl(item.path),
  })),
});
