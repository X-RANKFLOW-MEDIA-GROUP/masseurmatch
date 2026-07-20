"use client";

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

type CsrfTokenResponse = {
  ok: boolean;
  csrfToken?: string;
};

let cachedCsrfToken: string | null = null;
let csrfFetchPromise: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  if (cachedCsrfToken) {
    return cachedCsrfToken;
  }

  if (csrfFetchPromise) {
    return csrfFetchPromise;
  }

  csrfFetchPromise = (async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch CSRF token");
      }

      const data = (await response.json()) as CsrfTokenResponse;

      if (!data.csrfToken) {
        throw new Error("CSRF token not in response");
      }

      cachedCsrfToken = data.csrfToken;
      return data.csrfToken;
    } finally {
      csrfFetchPromise = null;
    }
  })();

  return csrfFetchPromise;
}

export async function requestJson<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const method = (init.method || "GET").toUpperCase();
  if ((method === "POST" || method === "DELETE" || method === "PUT" || method === "PATCH") && !headers.has("x-csrf-token")) {
    try {
      const csrfToken = await fetchCsrfToken();
      headers.set("x-csrf-token", csrfToken);
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
      throw new ApiError("Failed to fetch CSRF token", 403);
    }
  }

  const response = await fetch(input, {
    credentials: "include",
    ...init,
    headers,
  });

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
