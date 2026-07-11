import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { processPendingMigrations } from "@/app/api/migrate/_lib/processor";

export const maxDuration = 60;

// Vercel Cron (and manual admin triggers) hit this route to sweep pending
// migrations. Vercel sends `Authorization: Bearer ${CRON_SECRET}` automatically
// when the CRON_SECRET env var is set on the project.
function assertAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV !== "production") return;
    throw new RouteError(500, "CRON_SECRET is not configured.");
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    throw new RouteError(401, "Not authorized.");
  }
}

async function handle(request: Request) {
  try {
    assertAuthorized(request);
    const result = await processPendingMigrations();
    return json({ ok: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
