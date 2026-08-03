import type { Database } from "@/integrations/supabase/types";

type TherapistProfile = Database["public"]["Tables"]["therapist_profiles"]["Row"];

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
  launchPhase: "soft-launch",

  // Cities currently live (should have 5-10+ verified profiles each)
  citiesLiveList: ["dallas", "denver", "los-angeles", "new-york", "san-francisco"],

  // Require minimum 3-5 profiles before indexing a city page
  minimumProfilesPerCity: 3,

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

export function getProfileIndexRobots(profile: TherapistProfile | null, cityLiveList?: string[]): string {
  if (!profile) {
    return "noindex, nofollow";
  }

  const liveList = cityLiveList || indexEligibilityConfig.citiesLiveList;
  const isVerified = profile.verification_status === "verified";
  const isPublished = profile.is_published === true;
  const cityInLiveList = profile.city && liveList.map((c) => c.toLowerCase()).includes(profile.city.toLowerCase());

  // Unpublished profiles always noindex
  if (!isPublished) {
    return "noindex, nofollow";
  }

  // Unverified profiles noindex (but allow discovery via links)
  if (!isVerified) {
    return "noindex, follow";
  }

  // Verified profiles in live cities: index
  if (isVerified && cityInLiveList) {
    return "index, follow";
  }

  // Verified but not in a live city yet: noindex but allow discovery
  return "noindex, follow";
}

export function shouldShowProfileSeoScore(profile: TherapistProfile | null): boolean {
  if (!profile) return false;

  // Only show SEO score to verified, published profiles
  return profile.verification_status === "verified" && profile.is_published === true;
}
