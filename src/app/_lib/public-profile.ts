import type { PublicTherapist } from "@/app/_lib/directory";

export function getPublicProfileName(profile: Pick<PublicTherapist, "display_name" | "full_name">) {
  return profile.display_name || profile.full_name || "Therapist";
}

export function isVerifiedDirectoryProfile(profile: Pick<PublicTherapist, "subscription_tier" | "verification_status">) {
  return (
    profile.subscription_tier === "standard" ||
    profile.subscription_tier === "pro" ||
    profile.subscription_tier === "elite" ||
    profile.verification_status === "verified"
  );
}

export function getDirectoryTierLabel(profile: Pick<PublicTherapist, "subscription_tier">) {
  const tier = profile.subscription_tier;
  if (tier === "pro" || tier === "elite") {
    return "Premium";
  }
  if (tier === "standard") {
    return "Verified";
  }
  return "Directory";
}

export function normalizePhoneNumber(phone: string | null) {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "");
}

export function getMaskedPhoneLabel(phone: string | null) {
  const digits = normalizePhoneNumber(phone).replace(/[^\d]/g, "");
  if (!digits) return "Contact provider";
  const last4 = digits.slice(-4);
  return last4 ? `Contact ending in ${last4}` : "Contact provider";
}

export function getPublicContactLinks(
  phone: string | null,
  whatsapp_number?: string | null,
  profileId?: string | null,
) {
  const hasPhone = Boolean(normalizePhoneNumber(phone));
  const hasWhatsapp = Boolean(normalizePhoneNumber(whatsapp_number || phone));
  const id = profileId ? encodeURIComponent(profileId) : "";

  return {
    callHref: hasPhone && id ? `/api/public/contact/${id}?method=call` : null,
    whatsappHref: hasWhatsapp && id ? `/api/public/contact/${id}?method=whatsapp` : null,
    smsHref: hasPhone && id ? `/api/public/contact/${id}?method=sms` : null,
    phoneLabel: getMaskedPhoneLabel(phone),
  };
}

export function getPublicTrustHighlights(profile: PublicTherapist) {
  const highlights = [
    profile.available_now ? "Available now" : null,
    profile.verification_status === "verified" ? "Identity reviewed" : null,
    profile.profile_status === "approved" ? "Profile reviewed" : null,
    profile.subscription_tier === "pro" || profile.subscription_tier === "elite" ? "Premium Member" : null,
    profile.starting_price ? "Rates visible before contact" : null,
  ].filter((value): value is string => Boolean(value));

  if (highlights.length > 0) {
    return Array.from(new Set(highlights)).slice(0, 4);
  }

  return ["Direct contact available", "Profile details published", "Review the full listing before reaching out"];
}
