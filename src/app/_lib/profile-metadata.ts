import type { Metadata } from "next";
import { getProfileIndexRobots } from "@/lib/index-eligibility";
import type { Database } from "@/integrations/supabase/types";
import type { PublicTherapist } from "@/app/_lib/directory";

type TherapistProfile = Database["public"]["Tables"]["therapist_profiles"]["Row"];

interface RobotsMetadata {
  index: boolean;
  follow: boolean;
}

/**
 * Generate robots meta tag based on profile eligibility for indexing.
 * Used in page metadata to control search engine crawling.
 */
export function getProfileRobotsMetadata(
  profile: TherapistProfile | PublicTherapist | null,
): RobotsMetadata {
  const robotsDirective = getProfileIndexRobots(profile);

  const [indexing, following] = robotsDirective.split(",").map((s) => s.trim());

  return {
    index: indexing === "index",
    follow: following === "follow",
  };
}

/** Generate canonical URL for profile page. */
export function getProfileCanonicalUrl(slug: string, siteUrl: string): string {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, "");
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
  return `${normalizedSiteUrl}/therapists/${normalizedSlug}`;
}

/** Enhanced profile metadata with SEO optimization and indexing rules. */
export function buildProfilePageMetadata(
  profile: TherapistProfile | PublicTherapist | null,
  slug: string,
  siteUrl: string,
  seoTitle?: string,
  seoDescription?: string,
  ogImage?: string,
): Metadata {
  const canonicalUrl = getProfileCanonicalUrl(slug, siteUrl);
  const robotsMetadata = getProfileRobotsMetadata(profile);

  let displayName = "Therapist";
  if (profile) {
    if ("display_name" in profile && profile.display_name) {
      displayName = profile.display_name;
    } else if ("full_name" in profile && profile.full_name) {
      displayName = profile.full_name;
    }
  }

  const city =
    profile && "city" in profile && typeof profile.city === "string" && profile.city.trim()
      ? profile.city
      : "your area";

  const title = seoTitle || `${displayName || "Therapist"} - MasseurMatch`;
  const description =
    seoDescription ||
    `${displayName || "Massage Therapist"} in ${city} - LGBTQ+-affirming massage therapist`;

  return {
    title,
    description,
    robots: {
      index: robotsMetadata.index,
      follow: robotsMetadata.follow,
      googleBot: {
        index: robotsMetadata.index,
        follow: robotsMetadata.follow,
        "max-snippet": robotsMetadata.index ? -1 : 0,
        "max-image-preview": robotsMetadata.index ? "large" : "none",
        "max-video-preview": robotsMetadata.index ? -1 : 0,
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage, alt: title }] : [],
      url: canonicalUrl,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}
