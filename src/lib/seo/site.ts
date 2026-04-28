export const SITE_NAME = "MasseurMatch";
export const SITE_URL = "https://masseurmatch.com";
export const SUPPORT_EMAILS = {
  legal: "legal@masseurmatch.com",
  billing: "billing@masseurmatch.com",
  support: "support@masseurmatch.com",
} as const;

export const PRIVATE_ROUTE_PATTERNS = [
  "/admin",
  "/dashboard",
  "/client",
  "/login",
  "/register",
  "/billing",
  "/api",
  "/verification",
  "/checkout",
  "/account",
  "/auth/callback",
  "/signup",
];

export const TOP_CITY_SLUGS = ["new-york-ny", "los-angeles-ca", "chicago-il", "miami-fl", "dallas-tx"];

export function siteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;
}
