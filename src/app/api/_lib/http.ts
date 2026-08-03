import { ZodError, type ZodTypeAny, z } from "zod";

export class RouteError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "RouteError";
  }
}

export async function readRequestJson(request: Request): Promise<unknown> {
  const raw = await request.text();

  if (!raw.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new RouteError(400, "Request body must be valid JSON.");
  }
}

export async function parseJsonBody<TSchema extends ZodTypeAny>(
  request: Request,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  const body = await readRequestJson(request);
  return schema.parse(body);
}

export function json(data: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json; charset=utf-8");
  }

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

export function withSetCookie(response: Response, cookie: string): Response {
  const headers = new Headers(response.headers);
  headers.append("Set-Cookie", cookie);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function redirectResponse(location: string, cookie?: string): Response {
  const headers = new Headers({ Location: location });
  if (cookie) {
    headers.append("Set-Cookie", cookie);
  }

  return new Response(null, {
    status: 303,
    headers,
  });
}

function parseCookieHeader(header: string | null): Record<string, string> {
  if (!header) {
    return {};
  }

  return header.split(";").reduce<Record<string, string>>((accumulator, part) => {
    const [name, ...valueParts] = part.trim().split("=");
    if (!name) {
      return accumulator;
    }

    accumulator[name] = decodeURIComponent(valueParts.join("="));
    return accumulator;
  }, {});
}

/**
 * Guard user-facing error copy. Upstream libraries sometimes produce
 * machine-shaped messages — supabase-js, for one, falls back to
 * `JSON.stringify(body)` when an auth response has no message field, which
 * surfaces as a literal "{}" in the UI. Reject empty or JSON-looking strings
 * and use the provided fallback instead.
 */
export function toUserErrorMessage(raw: unknown, fallback: string): string {
  if (typeof raw !== "string") {
    return fallback;
  }

  const message = raw.trim();
  if (!message || message.startsWith("{") || message.startsWith("[")) {
    return fallback;
  }

  return message;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return toUserErrorMessage(error.message, "Something went wrong. Please try again.");
  }

  return "Unknown error.";
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ZodError) {
    return json(
      {
        ok: false,
        error: "Validation failed.",
        issues: error.flatten(),
      },
      { status: 422 },
    );
  }

  if (error instanceof RouteError) {
    return json(
      {
        ok: false,
        error: error.message,
        code: error.code,
      },
      { status: error.status },
    );
  }

  return json(
    {
      ok: false,
      error: getErrorMessage(error),
    },
    { status: 500 },
  );
}
