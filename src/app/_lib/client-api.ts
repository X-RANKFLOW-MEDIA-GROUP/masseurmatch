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

export async function requestJson<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
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
