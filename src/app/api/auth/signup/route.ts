import { json } from "@/app/api/_lib/http";

/**
 * POST /api/auth/signup is no longer available.
 * Use POST /api/auth/register instead.
 *
 * This handler prevents "Method not allowed" errors and directs clients to the correct endpoint.
 */
export async function POST(request: Request) {
  return json(
    {
      ok: false,
      error: "This endpoint has been moved.",
      message: "Use POST /api/auth/register instead.",
      deprecation: {
        oldEndpoint: "/api/auth/signup",
        newEndpoint: "/api/auth/register",
      },
    },
    { status: 410 } // 410 Gone — permanently removed
  );
}

export async function GET() {
  return json(
    {
      ok: false,
      error: "Method not allowed.",
      message: "Use POST /api/auth/register to create an account.",
    },
    { status: 405, headers: { Allow: "POST" } }
  );
}

export const runtime = "nodejs";
