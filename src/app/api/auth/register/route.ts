import { errorResponse, json, parseJsonBody, withSetCookie } from "@/app/api/_lib/http";
import { RouteError } from "@/app/api/_lib/http";
import { setSessionCookie } from "@/app/api/_lib/session";
import { authRegisterSchema } from "@/app/_lib/validation";
import {
  createTherapistUser,
  verifyPasswordWithRetry,
} from "@/app/api/_lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, authRegisterSchema);
    const result = await createTherapistUser(body);
    const signInResult = await verifyPasswordWithRetry(body.email, body.password, 5);

    const response = json({
      ok: true,
      user: {
        id: result.user.id,
        email: result.user.email,
      },
      role: result.role,
      session: signInResult.session
        ? {
            access_token: signInResult.session.access_token,
            refresh_token: signInResult.session.refresh_token,
          }
        : null,
    });

    return withSetCookie(
      response,
      setSessionCookie({
        userId: result.user.id,
        email: result.user.email || body.email,
        role: result.role,
      }),
    );
  } catch (error) {
    if (error instanceof RouteError && error.status === 400) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("duplicate")) {
        return json(
          { ok: false, error: "An account with this email already exists. Please sign in instead.", code: "USER_EXISTS" },
          { status: 409 },
        );
      }
    }
    return errorResponse(error);
  }
}
