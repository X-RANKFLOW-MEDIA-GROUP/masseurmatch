"use client";

import { getCsrfToken, clearCsrfToken } from "@/app/_lib/csrf-client";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parsePayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function needsCsrfToken(url: string, method?: string): boolean {
  return (
    method === "POST" &&
    (url.includes("/api/auth/login") ||
      url.includes("/api/auth/register") ||
      url.includes("/api/auth/forgot-password"))
  );
}

export async function requestJson<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = typeof input === "string" ? input : input.toString();
  const csrfProtected = needsCsrfToken(url, init.method) && !headers.has("x-csrf-token");

  if (csrfProtected) {
    headers.set("x-csrf-token", await getCsrfToken());
  }

  let response = await fetch(input, {
    credentials: "include",
    ...init,
    headers,
  });

  // The cached CSRF token can outlive the server-side one (1h TTL). On a
  // CSRF rejection, refetch a fresh token and retry once.
  if (response.status === 403 && csrfProtected) {
    clearCsrfToken();
    headers.set("x-csrf-token", await getCsrfToken());
    response = await fetch(input, {
      credentials: "include",
      ...init,
      headers,
    });
  }

  const payload = await parsePayload(response);

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? String(payload.error)
        : `Request failed with status ${response.status}.`;

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export function postJson<T>(url: string, body?: unknown) {
  return requestJson<T>(url, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function deleteJson<T>(url: string, body?: unknown) {
  return requestJson<T>(url, {
    method: "DELETE",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
