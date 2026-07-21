// Google Business Profile integration and local SEO setup

export interface GBPProfile {
  businessName: string;
  businessType: "LocalBusiness" | "MedicalBusiness" | "HealthAndBeautyBusiness";
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: "US";
  };
  phoneNumber: string;
  email: string;
  website: string;
  hours?: Record<string, { open: string; close: string }>;
  serviceArea?: string[];
}

export const generateGBPListingSchema = (profile: GBPProfile) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://masseurmatch.com/gbp-listing",
  name: profile.businessName,
  description: "LGBTQ+-affirming male massage therapists directory - find verified, licensed professionals",
  url: "https://masseurmatch.com",
  telephone: profile.phoneNumber,
  email: profile.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: profile.address.streetAddress,
    addressLocality: profile.address.addressLocality,
    addressRegion: profile.address.addressRegion,
    postalCode: profile.address.postalCode,
    addressCountry: profile.address.addressCountry,
  },
  ...(profile.hours ? { openingHoursSpecification: formatBusinessHours(profile.hours) } : {}),
  serviceArea: profile.serviceArea?.map((area) => ({
    "@type": "City",
    name: area,
  })),
  image: "https://masseurmatch.com/og-image.jpg",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: 4.8,
    reviewCount: 150,
  },
});

function formatBusinessHours(
  hours: Record<string, { open: string; close: string }>
): Array<{ "@type": string; dayOfWeek: string; opens: string; closes: string }> {
  return Object.entries(hours).map(([day, times]) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: capitalizeDay(day),
    opens: times.open,
    closes: times.close,
  }));
}

function capitalizeDay(day: string): string {
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
}

// GBP Widget component configuration
export const GBP_WIDGET_CONFIG = {
  location_type: "single", // or "multiple" for multi-location
  primary_location: "New York, NY",
  service_areas: [
    "New York, NY",
    "Los Angeles, CA",
    "San Francisco, CA",
    "Austin, TX",
    "Miami, FL",
    "Seattle, WA",
    "Portland, OR",
    "Denver, CO",
    "Boston, MA",
    "Chicago, IL",
  ],
  widgets_to_display: ["posts", "reviews", "photos", "booking"],
  review_aggregation: {
    enabled: true,
    sync_interval: "daily",
    min_rating: 3.0,
  },
};

// Integration checklist for GBP setup
export const GBP_SETUP_CHECKLIST = [
  "Create main Google Business Profile for MasseurMatch",
  "Verify business location and add complete information",
  "Add high-quality business photos and therapist showcase images",
  "Set up booking integration (if available via GBP API)",
  "Publish regular posts (1-2 per week) about services and tips",
  "Monitor and respond to reviews within 24 hours",
  "Add service categories and service areas",
  "Set up Q&A section with common client questions",
  "Embed GBP reviews widget on website homepage",
  "Link individual therapist profiles to main GBP listing",
  "Monitor GBP analytics and insights weekly",
  "Add special offers and promotions seasonally",
];

// Citations and local directories for local SEO
export const LOCAL_CITATION_TARGETS = [
  {
    name: "Google My Business",
    url: "https://mybusiness.google.com",
    priority: "critical",
    categories: ["Massage Therapy", "Health & Beauty"],
  },
  {
    name: "Yelp",
    url: "https://business.yelp.com",
    priority: "high",
    categories: ["Massage Therapy"],
  },
  {
    name: "Apple Maps",
    url: "https://maps.apple.com",
    priority: "high",
    categories: ["Wellness", "Massage"],
  },
  {
    name: "Better Business Bureau",
    url: "https://www.bbb.org",
    priority: "medium",
    categories: ["Massage Therapy"],
  },
  {
    name: "TherapyDen",
    url: "https://www.therapyden.com",
    priority: "medium",
    categories: ["Therapists", "Wellness"],
  },
  {
    name: "Healthgrades",
    url: "https://www.healthgrades.com",
    priority: "medium",
    categories: ["Health Professionals"],
  },
  {
    name: "ZocDoc",
    url: "https://www.zocdoc.com",
    priority: "medium",
    categories: ["Healthcare Providers"],
  },
];
