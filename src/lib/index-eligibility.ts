import type { Database } from "@/integrations/supabase/types";
import type { PublicTherapist } from "@/app/_lib/directory";

type TherapistProfile = Database["public"]["Tables"]["profiles"]["Row"];

export interface IndexEligibilityConfig {
  launchPhase: "pre-launch" | "soft-launch" | "public";
  citiesLiveList: string[];
  minimumProfilesPerCity: number;
  indexServicePages: boolean;
  indexCombinations: boolean;
  indexTravelPages: boolean;
}

export const indexEligibilityConfig: IndexEligibilityConfig = {
  launchPhase: "public",
  citiesLiveList: [
    "dallas", "denver", "los-angeles", "new-york", "san-francisco",
    "chicago", "miami", "atlanta", "houston", "seattle",
    "boston", "philadelphia", "phoenix", "portland", "austin",
    "sacramento", "san-diego", "nashville", "minneapolis", "columbus",
    "las-vegas", "dc", "baltimore", "pittsburgh", "brooklyn",
    "albuquerque", "anchorage", "boise", "providence", "spokane",
    "tucson", "tulsa", "memphis", "louisville", "salt-lake-city",
  ],
  minimumProfilesPerCity: 1,
  indexServicePages: false,
  indexCombinations: false,
  indexTravelPages: false,
};

export function shouldIndexPage(pageType: "city" | "service" | "combination" | "travel", metadata?: { citySlug?: string; profileCount?: number }): {
  shouldIndex: boolean;
  reason: string;
} {
  const { launchPhase, citiesLiveList, minimumProfilesPerCity, indexServicePages, indexCombinations, indexTravelPages } = indexEligibilityConfig;

  if (launchPhase === "pre-launch") {
    return { shouldIndex: false, reason: "Site is in pre-launch phase - no pages are indexed" };
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
        return { shouldIndex: false, reason: `City has only ${profileCount} profiles, needs minimum ${minimumProfilesPerCity}` };
      }
      return { shouldIndex: true, reason: `City "${citySlug}" is live with ${profileCount} profiles` };
    }
    case "service":
      return indexServicePages
        ? { shouldIndex: true, reason: "Service pages are enabled for indexing" }
        : { shouldIndex: false, reason: "Service pages are not yet indexed (waiting for stronger directory foundation)" };
    case "combination":
      return indexCombinations
        ? { shouldIndex: true, reason: "Combination pages are enabled for indexing" }
        : { shouldIndex: false, reason: "Combination pages (service + city) are not yet indexed (waiting for primary content to strengthen)" };
    case "travel":
      return indexTravelPages
        ? { shouldIndex: true, reason: "Travel pages are enabled for indexing" }
        : { shouldIndex: false, reason: "Travel pages are not yet indexed (launching after directory foundations are established)" };
    default:
      return { shouldIndex: false, reason: "Unknown page type" };
  }
}

export function getProfileIndexRobots(profile: TherapistProfile | PublicTherapist | null, cityLiveList?: string[]): string {
  if (!profile) return "noindex, nofollow";

  const liveList = cityLiveList || indexEligibilityConfig.citiesLiveList;
  const isVerified = "verification_status" in profile ? profile.verification_status === "verified" : false;
  const isPublished = "is_published" in profile ? profile.is_published === true : true;
  const city = "city" in profile && typeof profile.city === "string" ? profile.city : null;
  const cityInLiveList = Boolean(city && liveList.map((c) => c.toLowerCase()).includes(city.toLowerCase()));

  if (!isPublished) return "noindex, nofollow";
  if (!isVerified) return cityInLiveList ? "noindex, follow" : "noindex, nofollow";
  return "index, follow";
}

export function shouldShowProfileSeoScore(profile: TherapistProfile | null): boolean {
  if (!profile) return false;
  const isVerified = "verification_status" in profile ? profile.verification_status === "verified" : false;
  const isPublished = "is_published" in profile ? profile.is_published === true : false;
  return isVerified && isPublished;
}
