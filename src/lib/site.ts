const DEFAULT_APP_URL = "https://masseurmatch.com";

const runtimeProcess = globalThis as {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

const processEnv = runtimeProcess.process?.env ?? {};

export const SITE_URL =
  (
    processEnv.NEXT_PUBLIC_APP_URL ||
    processEnv.SITE_URL ||
    processEnv.VITE_PUBLIC_APP_URL ||
    DEFAULT_APP_URL
  ).replace(/\/+$/, "");

export const siteUrl = (path = "/"): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
};
