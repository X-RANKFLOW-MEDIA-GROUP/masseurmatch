import { ZodError, type ZodTypeAny, z } from "zod";

// SECURITY: Request timeout to prevent hanging connections
const DEFAULT_TIMEOUT_MS = 10_000; // 10 seconds

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  operation = "Request"
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new RouteError(504, `${operation} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

// SECURITY: CSRF validation for state-changing requests
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const ALLOWED_ORIGINS = new Set([
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : null,
].filter(Boolean));

export function assertCsrfSafe(request: Request): void {
  // Safe methods don't need CSRF protection
  if (SAFE_METHODS.has(request.method)) {
    return;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // API requests from same origin are allowed
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    return;
  }

  // Check referer as fallback
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (ALLOWED_ORIGINS.has(refererUrl.origin)) {
        return;
      }
    } catch {
      // Invalid referer URL
    }
  }

  // Allow requests with custom header (used by fetch from same origin)
  const customHeader = request.headers.get("x-requested-with");
  if (customHeader === "XMLHttpRequest" || customHeader === "fetch") {
    return;
  }

  // Allow if no origin/referer but has authorization (API key auth)
  if (!origin && !referer && request.headers.get("authorization")) {
    return;
  }

  // Reject suspicious cross-origin requests
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    throw new RouteError(403, "Cross-origin request rejected.");
  }
}

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

export function redirectResponse(location: string, cookie?: string): Response {
  const headers = new Headers({ Location: location });
  if (cookie) {
    headers.append("Set-Cookie", cookie);
  }

  return new Response(null, {
    status: 303,
    headers,
  });
}

export function parseCookieHeader(header: string | null): Record<string, string> {
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

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error.";
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ZodError) {
    // SECURITY: Only expose field-level validation errors, not internal schema details
    const flattened = error.flatten();
    return json(
      {
        ok: false,
        error: "Validation failed.",
        issues: {
          fieldErrors: flattened.fieldErrors,
          formErrors: flattened.formErrors.length > 0 ? ["Invalid input"] : [],
        },
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

  // SECURITY FIX: Log full error server-side but return generic message to client
  console.error("[http] Unhandled error:", error instanceof Error ? error.message : "unknown");
  return json(
    {
      ok: false,
      error: "An unexpected error occurred. Please try again.",
    },
    { status: 500 },
  );
}
