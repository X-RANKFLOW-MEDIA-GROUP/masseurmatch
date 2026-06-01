import { errorResponse, json, parseJsonBody, withSetCookie } from "@/app/api/_lib/http";
import { setSessionCookie } from "@/app/api/_lib/session";
import { assertRateLimit } from "@/app/_lib/security";
import { authLoginSchema } from "@/app/_lib/validation";
import {
  ensureUserProfileAndRole,
  verifyPasswordWithRetry,
} from "@/app/api/_lib/supabase-server";

export async function POST(request: Request) {
  try {
    // Throttle credential guessing on a per-IP basis.
    assertRateLimit(request, "auth-login", { limit: 10, windowMs: 60_000 });
    const body = await parseJsonBody(request, authLoginSchema);
    const { user, session } = await verifyPasswordWithRetry(body.email, body.password, 5);
    const { role } = await ensureUserProfileAndRole(user, {
      defaultRole: "provider",
    });

    const response = json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
      },
      role,
      session: session
        ? {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }
        : null,
    });

    return withSetCookie(
      response,
      setSessionCookie({
        userId: user.id,
        email: user.email ?? body.email,
        role,
      }),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
