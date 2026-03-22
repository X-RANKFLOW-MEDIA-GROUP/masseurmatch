import type { PublicTherapist } from "@/app/_lib/directory";

export function getPublicProfileName(profile: Pick<PublicTherapist, "display_name" | "full_name">) {
  return profile.display_name || profile.full_name || "Therapist";
}

export function isVerifiedDirectoryProfile(profile: Pick<PublicTherapist, "_tier" | "is_verified_identity" | "is_verified_profile">) {
  return (
    profile._tier === "standard" ||
    profile._tier === "pro" ||
    profile._tier === "elite" ||
    Boolean(profile.is_verified_identity) ||
    Boolean(profile.is_verified_profile)
  );
}

export function getDirectoryTierLabel(profile: Pick<PublicTherapist, "_tier">) {
  if (profile._tier === "pro" || profile._tier === "elite") {
    return "Premium";
  }

  if (profile._tier === "standard") {
    return "Verified";
  }

  return "Directory";
}

export function normalizePhoneNumber(phone: string | null) {
  if (!phone) {
    return "";
  }

  return phone.replace(/[^\d+]/g, "");
}

export function getPublicContactLinks(phone: string | null) {
  const normalizedPhone = normalizePhoneNumber(phone);

  if (!normalizedPhone) {
    return {
      callHref: null,
      whatsappHref: null,
      smsHref: null,
    };
  }

  return {
    callHref: `tel:${normalizedPhone}`,
    whatsappHref: `https://wa.me/${normalizedPhone.replace(/[^\d]/g, "")}`,
    smsHref: `sms:${normalizedPhone.replace(/[^\d+]/g, "")}`,
  };
}

export function getPublicTrustHighlights(profile: PublicTherapist) {
  const highlights = [
    profile.available_now ? "Available now" : null,
    profile.is_verified_identity ? "Identity reviewed" : null,
    profile.is_verified_profile ? "Profile reviewed" : null,
    profile.is_verified_photos ? "Photos reviewed" : null,
    profile.review_count ? `${profile.review_count} public reviews` : null,
    profile.incall_price || profile.outcall_price ? "Rates visible before contact" : null,
    profile.avatar_url ? "Profile image published" : null,
  ].filter((value): value is string => Boolean(value));

  if (highlights.length > 0) {
    return Array.from(new Set(highlights)).slice(0, 4);
  }

  return ["Direct contact available", "Profile details published", "Review the full listing before reaching out"];
}
