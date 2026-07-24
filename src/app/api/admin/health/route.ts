export const dynamic = "force-dynamic";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { supabaseFromRequest } from "@/app/api/_lib/session";

// Admin-only environment diagnostic. Reports whether required integration
// secrets are configured as booleans ONLY — it never returns, logs, or hints
// at the actual values. Useful to confirm the password-reset path (Resend +
// service role) and other integrations are wired in each deployment.
function isSet(...names: string[]): boolean {
  return names.some((name) => {
    const value = process.env[name];
    return typeof value === "string" && value.trim().length > 0;
  });
}

// Authorize WITHOUT the service-role admin client. Identity is verified by the
// cookie-bound anon client (getUser), and the role is read from app_metadata —
// which is server-writable only (mirrored by the role-assignment path), so it
// is safe to trust and is the same source the middleware authorizes from. This
// deliberately avoids getUserRole()/the service-role client so the endpoint can
// still report SUPABASE_SERVICE_ROLE_KEY: false when that key is the very thing
// that is missing (otherwise the auth check itself would 500 first).
async function requireAdminFromCookie(request: Request): Promise<void> {
  const supabase = supabaseFromRequest(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new RouteError(401, "Authentication required.");
  }

  const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  if (role !== "admin") {
    throw new RouteError(403, "Admin access required.");
  }
}

export async function GET(request: Request) {
  try {
    await requireAdminFromCookie(request);

    const env = {
      // Password reset (token_hash email) depends on both of these.
      RESEND_API_KEY: isSet("RESEND_API_KEY"),
      SUPABASE_SERVICE_ROLE_KEY: isSet("SUPABASE_SERVICE_ROLE_KEY"),
      // Supporting integrations, reported for completeness.
      NEXT_PUBLIC_SUPABASE_URL: isSet(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_STORAGE_SUPABASE_URL",
        "VITE_SUPABASE_URL",
      ),
      STRIPE_SECRET_KEY: isSet("STRIPE_SECRET_KEY"),
    };

    // The password-reset flow is fully code-controlled only when both the
    // Resend key and the service-role key are present; otherwise it falls back
    // to Supabase's built-in template email.
    const passwordResetReady = env.RESEND_API_KEY && env.SUPABASE_SERVICE_ROLE_KEY;

    return json({
      ok: true,
      env,
      passwordResetReady,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
