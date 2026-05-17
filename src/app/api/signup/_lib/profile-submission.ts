import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import type { TablesUpdate } from "@/integrations/supabase/types";

export interface SubmittedProfile {
  displayName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  tagline?: string;
  languages?: string[];
  education?: string;
  certifications?: string;
  yearsExperience?: number | string | null;
  serviceCategories?: string[];
  sessionLengths?: string[];
  locationType?: "incall" | "outcall" | "both" | "";
  startingPrice?: number | string | null;
  addOns?: string;
  availableNow?: boolean;
  termsAccepted?: boolean;
  complianceAcknowledged?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  identityVerified?: boolean;
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function parseSessionDuration(label: string) {
  const match = label.match(/(\d+)/);
  if (!match) return null;

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function buildPricingSessions(
  sessionLengths: string[] | undefined,
  startingPrice: number | null,
  locationType: SubmittedProfile["locationType"],
) {
  if (!Array.isArray(sessionLengths) || sessionLengths.length === 0) {
    return null;
  }

  const sessions: Array<{
    name: string;
    duration: number;
    incall?: number;
    outcall?: number;
  }> = [];

  for (const label of sessionLengths) {
    const duration = parseSessionDuration(label);
    if (!duration) {
      continue;
    }

    sessions.push({
      name: label,
      duration,
      incall:
        locationType === "incall" || locationType === "both" ? startingPrice ?? undefined : undefined,
      outcall:
        locationType === "outcall" || locationType === "both" ? startingPrice ?? undefined : undefined,
    });
  }

  return sessions.length > 0 ? sessions : null;
}

function buildAddOns(addOns: string | undefined) {
  if (!addOns?.trim()) {
    return null;
  }

  const match = addOns.match(/^(.*?)(?:\s*\+\$?(\d+(?:\.\d+)?))?$/);
  if (!match) {
    return [{ name: addOns.trim(), price: 0 }];
  }

  const name = match[1]?.trim() || addOns.trim();
  const price = match[2] ? Number(match[2]) : 0;

  return [{ name, price: Number.isFinite(price) ? price : 0 }];
}

export async function persistSubmittedProfile(
  userId: string,
  profile: SubmittedProfile,
  planTier?: string,
): Promise<string | null> {
  const adminClient = createSupabaseAdminClient();
  const startingPrice = toNumber(profile.startingPrice);
  const yearsExperience = toNumber(profile.yearsExperience);

  const profileUpdate: TablesUpdate<"profiles"> = {
    status: "pending_approval",
    is_active: false,
    updated_at: new Date().toISOString(),
  };

  if (profile.displayName || profile.fullName) {
    profileUpdate.display_name = profile.displayName || profile.fullName;
  }
  if (profile.fullName) {
    profileUpdate.full_name = profile.fullName;
  }
  if (profile.bio) {
    profileUpdate.bio = profile.bio;
  }
  if (profile.phone) {
    profileUpdate.phone = profile.phone;
  }
  if (profile.city) {
    profileUpdate.city = profile.city;
  }
  if (profile.state) {
    profileUpdate.state = profile.state;
  }
  if (profile.neighborhood) {
    profileUpdate.neighborhood_name = profile.neighborhood;
  }
  if (profile.tagline) {
    profileUpdate.tagline = profile.tagline;
  }
  if (Array.isArray(profile.languages)) {
    profileUpdate.languages_spoken = profile.languages;
  }
  if (profile.education) {
    profileUpdate.education = profile.education;
  }
  if (profile.certifications) {
    profileUpdate.certifications = profile.certifications;
  }
  if (yearsExperience !== null) {
    profileUpdate.years_experience = yearsExperience;
  }
  if (Array.isArray(profile.serviceCategories)) {
    profileUpdate.specialties = profile.serviceCategories;
    profileUpdate.massage_techniques = profile.serviceCategories;
    profileUpdate.modality = profile.serviceCategories[0] ?? null;
  }
  if (startingPrice !== null) {
    if (profile.locationType === "incall" || profile.locationType === "both") {
      profileUpdate.incall_price = startingPrice;
    }
    if (profile.locationType === "outcall" || profile.locationType === "both") {
      profileUpdate.outcall_price = startingPrice;
    }
  }

  const pricingSessions = buildPricingSessions(
    profile.sessionLengths,
    startingPrice,
    profile.locationType,
  );
  if (pricingSessions) {
    profileUpdate.pricing_sessions = pricingSessions;
  }

  const parsedAddOns = buildAddOns(profile.addOns);
  if (parsedAddOns) {
    profileUpdate.add_ons = parsedAddOns;
  }

  if (typeof profile.availableNow === "boolean") {
    profileUpdate.available_now = profile.availableNow;
  }
  if (profile.termsAccepted) {
    profileUpdate.terms_accepted_at = new Date().toISOString();
  }
  if (typeof profile.phoneVerified === "boolean") {
    profileUpdate.is_verified_phone = profile.phoneVerified;
  }
  if (typeof profile.identityVerified === "boolean") {
    profileUpdate.is_verified_identity = profile.identityVerified;
  }
  if (planTier) {
    profileUpdate._tier = planTier;
  }

  const { error } = await adminClient
    .from("profiles")
    .update(profileUpdate)
    .eq("user_id", userId);

  if (error) {
    return error.message;
  }

  return null;
}
