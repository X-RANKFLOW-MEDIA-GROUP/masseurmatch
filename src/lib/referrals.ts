export const REFERRAL_CODE_RE = /^REF[A-F0-9]{10}$/;
export const REFERRAL_COOKIE_NAME = "mm_referral_code";
export const REFERRAL_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const REFERRAL_MAX_REWARD_MONTHS = 6;
export const REFERRAL_REWARD_TIER = "standard" as const;

export function normalizeReferralCode(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toUpperCase();
  return REFERRAL_CODE_RE.test(normalized) ? normalized : null;
}

export function clearReferralCookieHeader(secure = process.env.NODE_ENV === "production") {
  return [
    `${REFERRAL_COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
    secure ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");
}
