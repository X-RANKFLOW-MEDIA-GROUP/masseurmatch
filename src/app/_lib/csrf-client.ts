"use client";

let cachedCsrfToken: string | null = null;
const CSRF_TTL_MS = 60 * 60 * 1000; // 1 hour

function isTokenExpired(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return true;

  try {
    const timestamp = parseInt(parts[1], 10);
    const now = Date.now();
    return now - timestamp > CSRF_TTL_MS;
  } catch {
    return true;
  }
}

export async function getCsrfToken(): Promise<string> {
  if (cachedCsrfToken && !isTokenExpired(cachedCsrfToken)) {
    return cachedCsrfToken;
  }

  cachedCsrfToken = null;

  const response = await fetch("/api/auth/login", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch CSRF token");
  }

  const data = await response.json();
  if (typeof data.csrfToken !== "string") {
    throw new Error("Server did not return CSRF token");
  }
  cachedCsrfToken = data.csrfToken ?? null;
  if (!cachedCsrfToken) throw new Error('CSRF token missing');
  return cachedCsrfToken;
}

export function clearCsrfToken() {
  cachedCsrfToken = null;
}
