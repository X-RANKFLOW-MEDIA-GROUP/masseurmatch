"use client";

let cachedCsrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (cachedCsrfToken) {
    return cachedCsrfToken;
  }

  const response = await fetch("/api/auth/login", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch CSRF token");
  }

  const data = await response.json();
  cachedCsrfToken = data.csrfToken;
  return cachedCsrfToken;
}

export function clearCsrfToken() {
  cachedCsrfToken = null;
}
