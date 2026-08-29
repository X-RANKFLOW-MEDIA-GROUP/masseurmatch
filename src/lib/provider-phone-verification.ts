export type ProviderPhoneVerificationInput = {
  profilePhone?: string | null;
  profilePhoneNumber?: string | null;
  isVerifiedPhone?: boolean | null;
  authPhone?: string | null;
  phoneConfirmedAt?: string | null;
};

export function normalizeProviderPhone(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (trimmed.startsWith("+")) return `+${digits}`;
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

export function getProviderPhoneVerificationState(input: ProviderPhoneVerificationInput) {
  const profilePhone =
    normalizeProviderPhone(input.profilePhone) ||
    normalizeProviderPhone(input.profilePhoneNumber);
  const authPhone = normalizeProviderPhone(input.authPhone);
  const authConfirmedForProfile = Boolean(
    profilePhone &&
      authPhone &&
      input.phoneConfirmedAt &&
      profilePhone === authPhone,
  );

  return {
    profilePhone,
    authPhone,
    authConfirmedForProfile,
    verified: input.isVerifiedPhone === true && authConfirmedForProfile,
  };
}
