export function getSafeAuthRedirect(value: string | null | undefined, fallback = "/pro/dashboard") {
  if (!value) {
    return fallback;
  }

  try {
    const decoded = decodeURIComponent(value);

    if (!decoded.startsWith("/") || decoded.startsWith("//")) {
      return fallback;
    }

    return decoded;
  } catch {
    return fallback;
  }
}
