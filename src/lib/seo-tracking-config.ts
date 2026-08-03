/**
 * SEO and Analytics Tracking Configuration
 *
 * This file centralizes configuration for:
 * - Google Analytics 4 (GA4) tracking
 * - Google Search Console integration
 * - Structured data validation
 * - Core Web Vitals monitoring
 */

export const SeoPlatforms = {
  GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GA4_ID || "",
  SEARCH_CONSOLE_SITE: "https://masseurmatch.com",
  GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  GOOGLE_TAGMANAGER_ID: process.env.NEXT_PUBLIC_GTM_ID || "",
} as const;

export const AnalyticsEvents = {
  // Profile Events
  PROFILE_VIEW: "page_view",
  PROFILE_CONTACT_CLICK: "contact_click",
  PROFILE_PHONE_CALL: "phone_call",
  PROFILE_EMAIL_OPEN: "email_click",
  PROFILE_WEBSITE_CLICK: "website_click",
  PROFILE_FAVORITE: "add_to_favorites",
  PROFILE_SHARE: "share_profile",

  // Search Events
  SEARCH_PERFORMED: "search_performed",
  SEARCH_FILTER_APPLIED: "filter_applied",
  SEARCH_RESULTS_VIEW: "search_results_view",

  // Directory Events
  CITY_PAGE_VIEW: "city_page_view",
  CITY_FILTER_USED: "city_filter_used",

  // Conversion Events
  CONTACT_INITIATED: "contact_initiated",
  BOOKING_INITIATED: "booking_initiated",
} as const;

export const CrawlablePages = {
  // Core pages that should be crawlable
  HOMEPAGE: "/",
  THERAPISTS_DIRECTORY: "/therapists",
  CITIES: "/:city",
  SERVICES: "/services/:service",

  // Pages that should NOT be crawled yet
  ADMIN: "/admin",
  PRO: "/pro",
  AUTH: "/auth",
} as const;

export const StructuredDataValidation = {
  // Required schema.org types for profile pages
  PROFILE_SCHEMA_TYPES: ["ProfilePage", "LocalBusiness", "Person", "Service"],

  // Minimum required fields in profile schema
  REQUIRED_FIELDS: ["name", "address", "description", "url"],

  // Recommended but not required
  RECOMMENDED_FIELDS: [
    "image",
    "telephone",
    "email",
    "hasOfferCatalog",
    "hasCredential",
    "knowsAbout",
    "knowsLanguage",
  ],
} as const;

export interface SeoMetrics {
  // Core Web Vitals
  largestContentfulPaint: number | null; // ms
  firstInputDelay: number | null; // ms
  cumulativeLayoutShift: number | null; // unitless

  // Performance
  firstContentfulPaint: number | null; // ms
  domInteractive: number | null; // ms
  pageLoadTime: number | null; // ms

  // Engagement
  timeOnPage: number; // seconds
  scrollDepth: number; // percentage
  clicks: number;
}

export interface SeoAuditResult {
  score: number; // 0-100
  lastAuditedAt: string; // ISO timestamp
  issues: SeoIssue[];
}

export interface SeoIssue {
  id: string;
  severity: "critical" | "warning" | "info";
  category: "schema" | "performance" | "accessibility" | "mobile" | "content";
  message: string;
  url?: string;
  affectedElement?: string;
  suggestedFix?: string;
}

/**
 * Tracks an analytics event with custom parameters
 * Usage: trackEvent("profile_view", { profileId: "123", city: "dallas" })
 */
export function trackAnalyticsEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;

  try {
    if (window.gtag) {
      window.gtag("event", eventName, eventParams);
    }
  } catch (error) {
    console.error("[Analytics] Error tracking event:", error);
  }
}

/**
 * Tracks Page view with custom metadata
 * Usage: trackPageView("/therapists/john-smith", { city: "dallas" })
 */
export function trackPageView(path: string, metadata?: Record<string, string>) {
  trackAnalyticsEvent("page_view", {
    page_path: path,
    ...metadata,
  });
}

/**
 * Tracks conversion events (contact initiated, etc.)
 */
export function trackConversion(type: "contact" | "booking" | "call" | "email", profileId: string) {
  const eventName = type === "contact" ? "contact_initiated" : `${type}_initiated`;

  trackAnalyticsEvent(eventName, {
    profile_id: profileId,
    event_category: "engagement",
    event_label: type,
  });
}

/**
 * Log SEO issues for monitoring
 * Usage: logSeoIssue({ id: "schema_001", severity: "critical", message: "Missing schema.org markup" })
 */
export function logSeoIssue(issue: SeoIssue) {
  console.warn(`[SEO] ${issue.severity.toUpperCase()}: ${issue.message}`, {
    id: issue.id,
    category: issue.category,
    url: issue.url,
  });

  // In production, send to error tracking service (Sentry, etc.)
  if (process.env.NODE_ENV === "production") {
    // Example: Sentry.captureMessage(`SEO Issue: ${issue.message}`, "warning");
  }
}
