import { calculateProfileSeoCompleteness, getProfileIndexEligibility } from "./profile-seo-completeness";
import { indexEligibilityConfig } from "./index-eligibility";
import type { ProfileViewModel } from "@/components/profile/profile-utils";

export interface LaunchReadinessReport {
  generatedAt: string;
  summary: LaunchReadinessSummary;
  byCity: Record<string, CityAudit>;
  qualityMetrics: QualityMetrics;
  recommendations: string[];
}

export interface LaunchReadinessSummary {
  totalProfiles: number;
  verifiedProfiles: number;
  indexableProfiles: number;
  excellentProfiles: number;
  launchPhase: string;
  citiesLive: number;
  averageSeoScore: number;
  readinessPercentage: number;
}

export interface CityAudit {
  cityName: string;
  profileCount: number;
  verifiedCount: number;
  indexableCount: number;
  averageSeoScore: number;
  isLive: boolean;
  missingProfiles: number; // profiles needed to reach minimum
  profiles: ProfileAuditEntry[];
}

export interface ProfileAuditEntry {
  id: string;
  name: string;
  slug: string;
  seoScore: number;
  isVerified: boolean;
  isIndexable: boolean;
  missingItems: string[];
}

export interface QualityMetrics {
  profilePhotoCompletion: number; // %
  descriptionCompletion: number; // %
  pricingCompletion: number; // %
  verificationCompletion: number; // %
  averagePhotosPerProfile: number;
  profilesWithoutContact: number;
  profilesWithoutServices: number;
  lowestScoringProfiles: ProfileAuditEntry[];
}

export function generateLaunchReadinessReport(
  profiles: ProfileViewModel[],
): LaunchReadinessReport {
  const now = new Date().toISOString();
  const summary = generateSummary(profiles);
  const byCity = generateCityAudits(profiles);
  const qualityMetrics = generateQualityMetrics(profiles);
  const recommendations = generateRecommendations(summary, byCity, qualityMetrics);

  return {
    generatedAt: now,
    summary,
    byCity,
    qualityMetrics,
    recommendations,
  };
}

function generateSummary(profiles: ProfileViewModel[]): LaunchReadinessSummary {
  const verifiedProfiles = profiles.filter((p) => p.isVerified);
  const indexableProfiles = profiles.filter((p) => {
    const eligibility = getProfileIndexEligibility(p);
    return eligibility.eligible;
  });
  const excellentProfiles = profiles.filter((p) => {
    const completeness = calculateProfileSeoCompleteness(p);
    return completeness.level === "excellent";
  });

  const seoScores = profiles.map((p) => calculateProfileSeoCompleteness(p).score);
  const averageSeoScore = seoScores.length > 0 ? Math.round(seoScores.reduce((a, b) => a + b) / seoScores.length) : 0;

  const citieLive = profiles.filter((p) =>
    indexEligibilityConfig.citiesLiveList
      .map((c) => c.toLowerCase())
      .includes(p.city.toLowerCase()),
  ).length;

  const readinessPercentage = profiles.length > 0 ? Math.round((indexableProfiles.length / profiles.length) * 100) : 0;

  return {
    totalProfiles: profiles.length,
    verifiedProfiles: verifiedProfiles.length,
    indexableProfiles: indexableProfiles.length,
    excellentProfiles: excellentProfiles.length,
    launchPhase: indexEligibilityConfig.launchPhase,
    citiesLive: indexEligibilityConfig.citiesLiveList.length,
    averageSeoScore,
    readinessPercentage,
  };
}

function generateCityAudits(profiles: ProfileViewModel[]): Record<string, CityAudit> {
  const cityGroups = new Map<string, ProfileViewModel[]>();

  profiles.forEach((p) => {
    const cityKey = p.city.toLowerCase();
    if (!cityGroups.has(cityKey)) {
      cityGroups.set(cityKey, []);
    }
    cityGroups.get(cityKey)!.push(p);
  });

  const audits: Record<string, CityAudit> = {};

  cityGroups.forEach((cityProfiles, cityKey) => {
    const verifiedCount = cityProfiles.filter((p) => p.isVerified).length;
    const indexableCount = cityProfiles.filter((p) => {
      const eligibility = getProfileIndexEligibility(p);
      return eligibility.eligible;
    }).length;

    const seoScores = cityProfiles.map((p) => calculateProfileSeoCompleteness(p).score);
    const averageSeoScore = Math.round(seoScores.reduce((a, b) => a + b) / seoScores.length);

    const isLive = indexEligibilityConfig.citiesLiveList
      .map((c) => c.toLowerCase())
      .includes(cityKey);

    const missingProfiles = Math.max(
      0,
      indexEligibilityConfig.minimumProfilesPerCity - verifiedCount,
    );

    const cityName = cityProfiles[0]?.city || "Unknown";

    audits[cityKey] = {
      cityName,
      profileCount: cityProfiles.length,
      verifiedCount,
      indexableCount,
      averageSeoScore,
      isLive,
      missingProfiles,
      profiles: cityProfiles.map((p) => {
        const completeness = calculateProfileSeoCompleteness(p);
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          seoScore: completeness.score,
          isVerified: p.isVerified,
          isIndexable: getProfileIndexEligibility(p).eligible,
          missingItems: completeness.missingItems,
        };
      }),
    };
  });

  return audits;
}

function generateQualityMetrics(profiles: ProfileViewModel[]): QualityMetrics {
  if (profiles.length === 0) {
    return {
      profilePhotoCompletion: 0,
      descriptionCompletion: 0,
      pricingCompletion: 0,
      verificationCompletion: 0,
      averagePhotosPerProfile: 0,
      profilesWithoutContact: 0,
      profilesWithoutServices: 0,
      lowestScoringProfiles: [],
    };
  }

  const profilePhotoCompletion = Math.round(
    (profiles.filter((p) => p.profilePhotoUrl).length / profiles.length) * 100,
  );

  const descriptionCompletion = Math.round(
    (profiles.filter((p) => p.bio && p.bio.length > 50).length / profiles.length) * 100,
  );

  const pricingCompletion = Math.round(
    (profiles.filter((p) => p.pricing && p.pricing.length > 0).length / profiles.length) * 100,
  );

  const verificationCompletion = Math.round((profiles.filter((p) => p.isVerified).length / profiles.length) * 100);

  const totalPhotos = profiles.reduce((sum, p) => sum + (p.galleryImages?.length || 0), 0);
  const averagePhotosPerProfile = Math.round((totalPhotos / profiles.length) * 10) / 10;

  const profilesWithoutContact = profiles.filter(
    (p) => !p.phone && !p.email && !p.website,
  ).length;

  const profilesWithoutServices = profiles.filter((p) => !p.services || p.services.length === 0).length;

  const scoredProfiles = profiles
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      seoScore: calculateProfileSeoCompleteness(p).score,
      isVerified: p.isVerified,
      isIndexable: getProfileIndexEligibility(p).eligible,
      missingItems: calculateProfileSeoCompleteness(p).missingItems,
    }))
    .sort((a, b) => a.seoScore - b.seoScore)
    .slice(0, 10);

  return {
    profilePhotoCompletion,
    descriptionCompletion,
    pricingCompletion,
    verificationCompletion,
    averagePhotosPerProfile,
    profilesWithoutContact,
    profilesWithoutServices,
    lowestScoringProfiles: scoredProfiles,
  };
}

function generateRecommendations(
  summary: LaunchReadinessSummary,
  byCity: Record<string, CityAudit>,
  metrics: QualityMetrics,
): string[] {
  const recommendations: string[] = [];

  // Readiness check
  if (summary.readinessPercentage < 50) {
    recommendations.push(
      `🔴 BLOCKER: Only ${summary.readinessPercentage}% of profiles are indexable. Target 80%+ for public launch.`,
    );
  } else if (summary.readinessPercentage < 80) {
    recommendations.push(
      `🟡 WARNING: ${summary.readinessPercentage}% of profiles are indexable. Work toward 80%+ for public launch.`,
    );
  } else {
    recommendations.push(
      `✅ Readiness: ${summary.readinessPercentage}% of profiles are indexable. On track for launch.`,
    );
  }

  // Verification check
  if (summary.verifiedProfiles < 20) {
    recommendations.push(
      `🟡 Low verified count: ${summary.verifiedProfiles}/profile. Target 50+ verified profiles before public launch.`,
    );
  }

  // City check
  Object.entries(byCity).forEach(([cityKey, audit]) => {
    if (audit.isLive && audit.missingProfiles > 0) {
      recommendations.push(
        `🟡 ${audit.cityName}: Add ${audit.missingProfiles} more verified profiles (currently ${audit.verifiedCount}/${indexEligibilityConfig.minimumProfilesPerCity} minimum).`,
      );
    }
  });

  // Quality metrics
  if (metrics.profilePhotoCompletion < 90) {
    recommendations.push(
      `📸 Profile photos: ${metrics.profilePhotoCompletion}% complete. Encourage providers to upload photos for better SEO and trust.`,
    );
  }

  if (metrics.descriptionCompletion < 85) {
    recommendations.push(
      `✍️ Bios: ${metrics.descriptionCompletion}% complete. Encourage detailed professional bios (50+ chars) for better ranking.`,
    );
  }

  if (metrics.pricingCompletion < 80) {
    recommendations.push(
      `💰 Pricing: ${metrics.pricingCompletion}% complete. More transparent pricing improves user confidence and conversions.`,
    );
  }

  if (metrics.profilesWithoutContact > 0) {
    recommendations.push(
      `📞 Contact info: ${metrics.profilesWithoutContact} profiles missing phone/email/website. Required for indexing.`,
    );
  }

  // Excellent score threshold
  if (summary.excellentProfiles < Math.ceil(summary.indexableProfiles * 0.3)) {
    recommendations.push(
      `✨ Only ${summary.excellentProfiles} profiles at excellent level. Focus on elevating top performers for better rankings.`,
    );
  }

  return recommendations;
}

export function formatReadinessReport(report: LaunchReadinessReport): string {
  const lines: string[] = [];

  lines.push("=".repeat(60));
  lines.push("LAUNCH READINESS AUDIT");
  lines.push(`Generated: ${new Date(report.generatedAt).toLocaleString()}`);
  lines.push("=".repeat(60));
  lines.push("");

  // Summary
  lines.push("SUMMARY");
  lines.push(`Total Profiles: ${report.summary.totalProfiles}`);
  lines.push(`Verified: ${report.summary.verifiedProfiles} (${Math.round((report.summary.verifiedProfiles / report.summary.totalProfiles) * 100)}%)`);
  lines.push(`Indexable: ${report.summary.indexableProfiles} (${report.summary.readinessPercentage}%)`);
  lines.push(`Excellent: ${report.summary.excellentProfiles}`);
  lines.push(`Average SEO Score: ${report.summary.averageSeoScore}/100`);
  lines.push(`Launch Phase: ${report.summary.launchPhase}`);
  lines.push(`Cities Live: ${report.summary.citiesLive}`);
  lines.push("");

  // Quality Metrics
  lines.push("QUALITY METRICS");
  lines.push(`Profile Photos: ${report.qualityMetrics.profilePhotoCompletion}%`);
  lines.push(`Descriptions: ${report.qualityMetrics.descriptionCompletion}%`);
  lines.push(`Pricing: ${report.qualityMetrics.pricingCompletion}%`);
  lines.push(`Verification: ${report.qualityMetrics.verificationCompletion}%`);
  lines.push(`Avg Photos/Profile: ${report.qualityMetrics.averagePhotosPerProfile}`);
  lines.push("");

  // Issues
  if (report.qualityMetrics.profilesWithoutContact > 0) {
    lines.push(
      `⚠️ ${report.qualityMetrics.profilesWithoutContact} profiles missing contact info`,
    );
  }
  if (report.qualityMetrics.profilesWithoutServices > 0) {
    lines.push(
      `⚠️ ${report.qualityMetrics.profilesWithoutServices} profiles missing services`,
    );
  }
  lines.push("");

  // Recommendations
  lines.push("RECOMMENDATIONS");
  report.recommendations.forEach((rec) => {
    lines.push(`• ${rec}`);
  });
  lines.push("");

  return lines.join("\n");
}
