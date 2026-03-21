export const FIRST_30_URLS_IN_ORDER = [
  "/dallas",
  "/dallas/lgbtq-friendly",
  "/dallas/male-therapists",
  "/dallas/wellness/deep-tissue",
  "/dallas/wellness/outcall",
  "/dallas/wellness/incall",
  "/dallas/wellness/swedish",
  "/dallas/wellness/sports-recovery",
  "/dallas/wellness/mobile-massage",
  "/dallas/wellness/hotel-massage",
  "/dallas/areas/oak-lawn",
  "/dallas/areas/turtle-creek",
  "/dallas/areas/uptown",
  "/dallas/areas/medical-district",
  "/dallas/areas/love-field",
  "/dallas/areas/dfw-airport",
  "/dallas/areas/highland-park",
  "/dallas/areas/university-park",
  "/dallas/areas/downtown",
  "/dallas/areas/design-district",
  "/plano",
  "/plano/lgbtq-friendly",
  "/plano/male-therapists",
  "/plano/wellness/deep-tissue",
  "/plano/wellness/outcall",
  "/irving",
  "/irving/lgbtq-friendly",
  "/irving/male-therapists",
  "/irving/wellness/outcall",
  "/highland-park",
] as const;

const FIRST_30_SET: ReadonlySet<string> = new Set(FIRST_30_URLS_IN_ORDER);

export function isLaunchUrl(path: string): boolean {
  return FIRST_30_SET.has(path);
}

export function getLaunchCityPaths(): string[] {
  return FIRST_30_URLS_IN_ORDER.filter((path) => path.split("/").filter(Boolean).length === 1);
}

export function getLaunchSegmentPaths(): string[] {
  return FIRST_30_URLS_IN_ORDER.filter((path) => path.split("/").filter(Boolean).length === 2);
}

export function getLaunchKeywordPaths(): string[] {
  return FIRST_30_URLS_IN_ORDER.filter((path) => path.split("/").filter(Boolean).length === 3 && path.includes("/wellness/"));
}

export function getLaunchAreaPaths(): string[] {
  return FIRST_30_URLS_IN_ORDER.filter((path) => path.split("/").filter(Boolean).length === 3 && path.includes("/areas/"));
}
