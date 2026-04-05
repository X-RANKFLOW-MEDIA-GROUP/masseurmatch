const DEFAULT_APP_URL = "https://masseurmatch.com";

const isVercelProduction = process.env.VERCEL_ENV === "production";

export const SITE_URL =
  (isVercelProduction
    ? DEFAULT_APP_URL
    : process.env.NEXT_PUBLIC_APP_URL ||
      process.env.SITE_URL ||
      DEFAULT_APP_URL
  ).replace(/\/+$/, "");

export const siteUrl = (path = "/"): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
};
