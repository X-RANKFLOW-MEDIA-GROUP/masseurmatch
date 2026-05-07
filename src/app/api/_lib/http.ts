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
