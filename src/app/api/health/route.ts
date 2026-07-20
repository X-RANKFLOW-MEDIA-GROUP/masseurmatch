import { json } from "@/app/api/_lib/http";
import { envOptional } from "@/app/api/_lib/env";

/**
 * Health check endpoint — validates critical environment variables at boot/deploy time.
 * This prevents ships without essential secrets.
 *
 * GET /api/health → { ok: true, checks: {...} }
 * Missing critical var → { ok: false, missing: [...], timestamp: ... }
 */
export async function GET() {
  const checks: Record<string, boolean> = {};
  const missing: string[] = [];

  // Critical env vars that must be set in production
  const critical = [
    { key: "MM_SESSION_SECRET", aliases: ["SESSION_SECRET"] },
    { key: "MM_CSRF_SECRET", aliases: ["CSRF_SECRET"] },
  ];

  for (const { key, aliases } of critical) {
    const value = envOptional([key, ...aliases]);
    checks[key] = !!value;
    if (!value) {
      missing.push(key);
    }
  }

  const ok = missing.length === 0;

  return json(
    {
      ok,
      checks,
      ...(missing.length > 0 && {
        missing,
        timestamp: new Date().toISOString(),
        hint:
          process.env.NODE_ENV === "production"
            ? "Critical environment variables are missing. Check Vercel Settings → Environment Variables."
            : "Development mode: some env vars may be optional.",
      }),
    },
    { status: ok ? 200 : 503 }
  );
}
