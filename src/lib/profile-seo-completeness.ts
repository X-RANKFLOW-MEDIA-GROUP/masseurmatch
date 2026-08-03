import type { ProfileViewModel } from "@/components/profile/profile-utils";

export interface SeoCompletenessResult {
  score: number; // 0-100
  level: "incomplete" | "basic" | "good" | "excellent";
  checklist: SeoChecklistItem[];
  missingItems: string[];
  suggestions: string[];
}

interface SeoChecklistItem {
  category: string;
  item: string;
  complete: boolean;
  weight: number;
  points: number;
}

export function calculateProfileSeoCompleteness(profile: ProfileViewModel): SeoCompletenessResult {
  const checklist: SeoChecklistItem[] = [];
  let totalPoints = 0;
  let earnedPoints = 0;
  const missingItems: string[] = [];
  const suggestions: string[] = [];

  // Profile Photo - Critical
  const hasProfilePhoto = Boolean(profile.profilePhotoUrl);
  const profilePhotoItem = {
    category: "Profile Content",
    item: "Profile photo",
    complete: hasProfilePhoto,
    weight: 15,
    points: hasProfilePhoto ? 15 : 0,
  };
  checklist.push(profilePhotoItem);
  totalPoints += profilePhotoItem.weight;
  earnedPoints += profilePhotoItem.points;
  if (!hasProfilePhoto) missingItems.push("Professional profile photo");

  // Bio/Description - Critical for ranking
  const hasDescription = Boolean(profile.bio && profile.bio.length > 50);
  const bioItem = {
    category: "Profile Content",
    item: "Professional biography (50+ characters)",
    complete: hasDescription,
    weight: 15,
    points: hasDescription ? 15 : 0,
  };
  checklist.push(bioItem);
  totalPoints += bioItem.weight;
  earnedPoints += bioItem.points;
  if (!hasDescription) {
    missingItems.push("Professional biography");
    suggestions.push("Add a 50-100 character bio describing your experience and specialties");
  }

  // Services - High impact
  const hasServices = Boolean(profile.services && profile.services.length >= 1);
  const servicesItem = {
    category: "Profile Content",
    item: "Services listed (1+ required)",
    complete: hasServices,
    weight: 12,
    points: hasServices ? 12 : 0,
  };
  checklist.push(servicesItem);
  totalPoints += servicesItem.weight;
  earnedPoints += servicesItem.points;
  if (!hasServices) {
    missingItems.push("At least one service");
    suggestions.push("List massage types you offer (e.g., Swedish, deep tissue, sports)");
  }

  // Specialties - Medium impact
  const hasSpecialties = Boolean(profile.specialties && profile.specialties.length >= 1);
  const specialtiesItem = {
    category: "Profile Content",
    item: "Specialties (1+ recommended)",
    complete: hasSpecialties,
    weight: 10,
    points: hasSpecialties ? 10 : 0,
  };
  checklist.push(specialtiesItem);
  totalPoints += specialtiesItem.weight;
  earnedPoints += specialtiesItem.points;
  if (!hasSpecialties) suggestions.push("Add specialties (e.g., sports injury recovery, stress relief)");

  // Pricing - High impact for search
  const hasPricing = Boolean(profile.pricing && profile.pricing.length >= 1);
  const pricingItem = {
    category: "Booking Info",
    item: "Session pricing",
    complete: hasPricing,
    weight: 12,
    points: hasPricing ? 12 : 0,
  };
  checklist.push(pricingItem);
  totalPoints += pricingItem.weight;
  earnedPoints += pricingItem.points;
  if (!hasPricing) {
    missingItems.push("Session pricing");
    suggestions.push("Set pricing for 60-min and 90-min sessions (incall/outcall)");
  }

  // Availability info - Medium impact
  const hasAvailability = Boolean(
    profile.availabilityDays && profile.availabilityDays.length > 0,
  );
  const availabilityItem = {
    category: "Booking Info",
    item: "Availability information",
    complete: hasAvailability,
    weight: 8,
    points: hasAvailability ? 8 : 0,
  };
  checklist.push(availabilityItem);
  totalPoints += availabilityItem.weight;
  earnedPoints += availabilityItem.points;
  if (!hasAvailability) suggestions.push("Specify your availability (hours, days, booking lead time)");

  // Contact method - Critical for conversion
  const hasContactMethod = Boolean(profile.phone || profile.email || profile.website);
  const contactItem = {
    category: "Booking Info",
    item: "Contact method (phone, email, or website)",
    complete: hasContactMethod,
    weight: 10,
    points: hasContactMethod ? 10 : 0,
  };
  checklist.push(contactItem);
  totalPoints += contactItem.weight;
  earnedPoints += contactItem.points;
  if (!hasContactMethod) {
    missingItems.push("Contact method");
    suggestions.push("Add at least one contact method: phone number, email, or website");
  }

  // Verification badge - Trust signal
  const isVerified = profile.isVerified;
  const verificationItem = {
    category: "Trust & Verification",
    item: "Profile verified by MasseurMatch",
    complete: isVerified,
    weight: 8,
    points: isVerified ? 8 : 0,
  };
  checklist.push(verificationItem);
  totalPoints += verificationItem.weight;
  earnedPoints += verificationItem.points;
  if (!isVerified) suggestions.push("Complete verification to increase trust and visibility");

  // Languages - Low impact but nice to have
  const hasLanguages = Boolean(profile.languages && profile.languages.length > 0);
  const languagesItem = {
    category: "Additional Info",
    item: "Languages spoken",
    complete: hasLanguages,
    weight: 5,
    points: hasLanguages ? 5 : 0,
  };
  checklist.push(languagesItem);
  totalPoints += languagesItem.weight;
  earnedPoints += languagesItem.points;

  // Service areas - Geo targeting
  const hasServiceAreas = Boolean(profile.serviceAreas && profile.serviceAreas.length > 0);
  const serviceAreasItem = {
    category: "Geo Targeting",
    item: "Service areas specified",
    complete: hasServiceAreas,
    weight: 5,
    points: hasServiceAreas ? 5 : 0,
  };
  checklist.push(serviceAreasItem);
  totalPoints += serviceAreasItem.weight;
  earnedPoints += serviceAreasItem.points;

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  let level: "incomplete" | "basic" | "good" | "excellent";
  if (score >= 85) level = "excellent";
  else if (score >= 70) level = "good";
  else if (score >= 50) level = "basic";
  else level = "incomplete";

  return {
    score,
    level,
    checklist,
    missingItems,
    suggestions,
  };
}

export function validateProfileStructuredData(profile: ProfileViewModel): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields for schema.org/Person
  if (!profile.name) errors.push("Profile name is required for structured data");
  if (!profile.city) errors.push("City is required for structured data");
  if (!profile.state) errors.push("State is required for structured data");

  // Strongly recommended
  if (!profile.profilePhotoUrl) warnings.push("Profile photo improves schema completeness");
  if (!profile.phone && !profile.email)
    warnings.push("At least phone or email should be provided for contact point");

  // Service/offer data
  if (!profile.services || profile.services.length === 0) {
    warnings.push("Services list is empty - schema.org/Service requires itemOffered");
  }

  if (!profile.pricing || profile.pricing.length === 0) {
    warnings.push("Pricing information improves schema.org/Offer structure");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function getProfileIndexEligibility(profile: ProfileViewModel): {
  eligible: boolean;
  reason: string;
  minimumScore: number;
} {
  const completeness = calculateProfileSeoCompleteness(profile);

  // Minimum requirements for indexing
  const minimumScore = 50;
  const hasRequiredFields = Boolean(profile.name && profile.city && profile.state);
  const hasContactMethod = Boolean(profile.phone || profile.email || profile.website);
  const isVerified = profile.isVerified;

  const eligible =
    completeness.score >= minimumScore && hasRequiredFields && hasContactMethod && isVerified;

  let reason = "";
  if (!isVerified) {
    reason = "Profile must be verified before indexing";
  } else if (!hasContactMethod) {
    reason = "Profile must have at least one contact method (phone, email, or website)";
  } else if (completeness.score < minimumScore) {
    reason = `Profile SEO score (${completeness.score}/100) is below minimum (${minimumScore}/100)`;
  } else if (!hasRequiredFields) {
    reason = "Profile is missing required fields (name, city, state)";
  } else {
    reason = "Profile is eligible for indexing";
  }

  return {
    eligible,
    reason,
    minimumScore,
  };
}
