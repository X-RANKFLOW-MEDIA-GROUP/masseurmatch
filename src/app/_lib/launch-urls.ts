export const FIRST_30_URLS_IN_ORDER = [
  "/dallas",
  "/dallas/verified-profiles",
  "/dallas/lgbtq-friendly",
  "/dallas/male-therapists",
  "/dallas/wellness",
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
  "/dallas/areas/deep-ellum",
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
  "/houston",
  "/houston/verified-profiles",
  "/houston/wellness",
  "/houston/wellness/outcall",
  "/houston/wellness/incall",
  "/houston/wellness/swedish",
  "/houston/wellness/thai",
  "/houston/areas/montrose",
  "/houston/areas/the-heights",
  "/houston/areas/midtown",
  "/houston/areas/downtown-houston",
  "/austin",
  "/austin/verified-profiles",
  "/austin/wellness",
  "/austin/wellness/deep-tissue",
  "/austin/wellness/outcall",
  "/austin/wellness/incall",
  "/austin/areas/south-congress",
  "/austin/areas/east-austin",
  "/miami",
  "/miami/verified-profiles",
  "/miami/wellness",
  "/miami/wellness/outcall",
  "/miami/wellness/swedish",
  "/miami/wellness/hotel-massage",
  "/miami/areas/brickell",
  "/chicago",
  "/chicago/verified-profiles",
  "/chicago/wellness",
  "/chicago/wellness/deep-tissue",
  "/chicago/wellness/outcall",
  "/chicago/wellness/incall",
  "/chicago/wellness/sports-recovery",
  "/chicago/areas/river-north",
  // ── Gay massage SEO aggressive pages ──
  "/dallas/gay-massage",
  "/houston/gay-massage",
  "/austin/gay-massage",
  "/miami/gay-massage",
  "/chicago/gay-massage",
  "/los-angeles/gay-massage",
  "/new-york/gay-massage",
  "/san-francisco/gay-massage",
  "/atlanta/gay-massage",
  "/denver/gay-massage",
  "/seattle/gay-massage",
  "/portland/gay-massage",
  "/fort-lauderdale/gay-massage",
  "/west-hollywood/gay-massage",
  "/palm-springs/gay-massage",
  "/provincetown/gay-massage",
  "/key-west/gay-massage",
  "/fire-island/gay-massage",
  "/san-diego/gay-massage",
  "/phoenix/gay-massage",
  "/las-vegas/gay-massage",
  "/nashville/gay-massage",
  "/new-orleans/gay-massage",
  "/philadelphia/gay-massage",
  "/minneapolis/gay-massage",
  "/washington-dc/gay-massage",
  "/san-antonio/areas/king-william",
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
