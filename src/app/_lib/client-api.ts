"use client";

import { getCsrfToken, clearCsrfToken } from "@/app/_lib/csrf-client";

export class ApiError extends Error {
  /**
   * Machine-readable error code from the API envelope (`{ ok: false, error,
   * code }`). Callers must branch on this instead of pattern-matching the
   * human-readable message — matching on prose is how a wrong-password reply
   * ended up being shown to users as a security-token failure.
   */
  readonly code?: string;

  constructor(
    message: string,
    public status: number,
    public payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = extractErrorCode(payload);
  }
}

function extractErrorCode(payload: unknown): string | undefined {
  if (typeof payload !== "object" || !payload || !("code" in payload)) {
    return undefined;
  }

  const raw = (payload as { code: unknown }).code;
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
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

function extractErrorMessage(payload: unknown, status: number): string {
  const fallback = `Request failed with status ${status}.`;

  if (typeof payload !== "object" || !payload || !("error" in payload)) {
    return fallback;
  }

  const raw = (payload as { error: unknown }).error;
  const candidate =
    typeof raw === "string"
      ? raw
      : typeof raw === "object" &&
          raw !== null &&
          "message" in raw &&
          typeof (raw as { message: unknown }).message === "string"
        ? (raw as { message: string }).message
        : "";

  // Reject empty or JSON-shaped messages (e.g. a stringified error body such
  // as "{}") so raw payloads never reach the UI.
  const message = candidate.trim();
  if (!message || message.startsWith("{") || message.startsWith("[")) {
    return fallback;
  }

  return message;
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
    throw new ApiError(extractErrorMessage(payload, response.status), response.status, payload);
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
