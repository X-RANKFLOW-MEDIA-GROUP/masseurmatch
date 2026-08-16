import type { Database } from "@/integrations/supabase/types";
import type { PublicTherapist } from "@/app/_lib/directory";

type TherapistProfile = Database["public"]["Tables"]["profiles"]["Row"];

export interface IndexEligibilityConfig {
  // Launch phase - determines which pages get indexed
  launchPhase: "pre-launch" | "soft-launch" | "public";

  // City launch whitelist - only these cities are indexed in soft-launch/public
  citiesLiveList: string[];

  // Minimum profiles per city before city page is indexed
  minimumProfilesPerCity: number;

  // Service area pages - when to index
  indexServicePages: boolean;

  // Combination pages - when to index (e.g., "gay massage + dallas")
  indexCombinations: boolean;

  // Travel pages - when to index
  indexTravelPages: boolean;
}

export const indexEligibilityConfig: IndexEligibilityConfig = {
  // Current launch phase
  launchPhase: "public",

  // All US cities eligible for indexing (Verified profiles always indexed)
  // Tier 1 (primary): Major markets with 10+ profiles
  // Tier 2 (secondary): Markets with 3-9 profiles
  // Tier 3 (emerging): Markets with 1-2 profiles (indexed but marked "coming soon")
  citiesLiveList: [
    // Tier 1 - Major metros (10+ profiles)
    "dallas", "denver", "los-angeles", "new-york", "san-francisco",
    "chicago", "miami", "atlanta", "houston", "seattle",
    "boston", "philadelphia", "phoenix", "portland", "austin",
    // Tier 2 - Secondary markets (3-9 profiles)
    "sacramento", "san-diego", "nashville", "minneapolis", "columbus",
    "las-vegas", "dc", "baltimore", "pittsburgh", "brooklyn",
    // Tier 3 - Emerging markets (1-2 profiles)
    "albuquerque", "anchorage", "boise", "providence", "spokane",
    "tucson", "tulsa", "memphis", "louisville", "salt-lake-city",
  ],

  // Require minimum 1 profile before indexing a city page
  minimumProfilesPerCity: 1,

  // Don't index generic service pages yet - too thin
  indexServicePages: false,

  // Don't index combination pages - too thin
  indexCombinations: false,

  // Don't index travel pages - launch after main directory is strong
  indexTravelPages: false,
};

export function shouldIndexPage(pageType: "city" | "service" | "combination" | "travel", metadata?: { citySlug?: string; profileCount?: number }): {
  shouldIndex: boolean;
  reason: string;
} {
  const { launchPhase, citiesLiveList, minimumProfilesPerCity, indexServicePages, indexCombinations, indexTravelPages } = indexEligibilityConfig;

  // During pre-launch, nothing is indexed
  if (launchPhase === "pre-launch") {
    return {
      shouldIndex: false,
      reason: "Site is in pre-launch phase - no pages are indexed",
    };
  }

  switch (pageType) {
    case "city": {
      const citySlug = metadata?.citySlug?.toLowerCase();
      const isLivCity = citySlug && citiesLiveList.map((c) => c.toLowerCase()).includes(citySlug);

      if (!isLivCity) {
        return {
          shouldIndex: false,
          reason: `City "${citySlug}" is not in the launch list. Current live cities: ${citiesLiveList.join(", ")}`,
        };
      }

      const profileCount = metadata?.profileCount || 0;
      if (profileCount < minimumProfilesPerCity) {
        return {
          shouldIndex: false,
          reason: `City has only ${profileCount} profiles, needs minimum ${minimumProfilesPerCity}`,
        };
      }

      return {
        shouldIndex: true,
        reason: `City "${citySlug}" is live with ${profileCount} profiles`,
      };
    }

    case "service": {
      if (!indexServicePages) {
        return {
          shouldIndex: false,
          reason: "Service pages are not yet indexed (waiting for stronger directory foundation)",
        };
      }

      return {
        shouldIndex: true,
        reason: "Service pages are enabled for indexing",
      };
    }

    case "combination": {
      if (!indexCombinations) {
        return {
          shouldIndex: false,
          reason: "Combination pages (service + city) are not yet indexed (waiting for primary content to strengthen)",
        };
      }

      return {
        shouldIndex: true,
        reason: "Combination pages are enabled for indexing",
      };
    }

    case "travel": {
      if (!indexTravelPages) {
        return {
          shouldIndex: false,
          reason: "Travel pages are not yet indexed (launching after directory foundations are established)",
        };
      }

      return {
        shouldIndex: true,
        reason: "Travel pages are enabled for indexing",
      };
    }

    default:
      return {
        shouldIndex: false,
        reason: "Unknown page type",
      };
  }
}

export function getProfileIndexRobots(profile: TherapistProfile | PublicTherapist | null, cityLiveList?: string[]): string {
  if (!profile) {
    return "noindex, nofollow";
  }

  const liveList = cityLiveList || indexEligibilityConfig.citiesLiveList;
  const isVerified = "verification_status" in profile ? profile.verification_status === "verified" : false;

  // is_published is on TherapistProfile but not PublicTherapist
  // PublicTherapist from the query is always published, so assume true if field doesn't exist
  const isPublished = "is_published" in profile ? profile.is_published === true : true;

  const cityInLiveList = profile.city && liveList.map((c) => c.toLowerCase()).includes(profile.city.toLowerCase());

  // Unpublished profiles always noindex
  if (!isPublished) {
    return "noindex, nofollow";
  }

  // Unverified profiles noindex (but allow discovery via links)
  if (!isVerified) {
    return "noindex, follow";
  }

  // Verified profiles anywhere: index (all verified are eligible now)
  if (isVerified) {
    return "index, follow";
  }

  // Unverified in live city: don't index yet, but allow discovery via links
  if (cityInLiveList) {
    return "noindex, follow";
  }

  // Unverified in non-live city: noindex, nofollow
  return "noindex, nofollow";
}

export function shouldShowProfileSeoScore(profile: TherapistProfile | null): boolean {
  if (!profile) return false;

  // Only show SEO score to verified, published profiles
  const isVerified = "verification_status" in profile ? profile.verification_status === "verified" : false;
  const isPublished = "is_published" in profile ? profile.is_published === true : false;
  return isVerified && isPublished;
}
