import { errorResponse, json, parseJsonBody, withSetCookie } from "@/app/api/_lib/http";
import { RouteError } from "@/app/api/_lib/http";
import { setSessionCookie } from "@/app/api/_lib/session";
import { authRegisterSchema } from "@/app/_lib/validation";
import {
  createTherapistUser,
  verifyPasswordWithRetry,
} from "@/app/api/_lib/supabase-server";

function isDuplicateAccountError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("already") || normalized.includes("registered") || normalized.includes("duplicate");
}

function isSupabaseSignupDatabaseError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("database error creating new user") ||
    normalized.includes("error creating new user") ||
    normalized.includes("trigger") ||
    normalized.includes("violates check constraint") ||
    normalized.includes("violates not-null constraint") ||
    normalized.includes("relation") ||
    normalized.includes("column")
  );
}

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
    if (error instanceof RouteError) {
      const message = error.message;

      if (error.status === 400 && isDuplicateAccountError(message)) {
        return json(
          { ok: false, error: "An account with this email already exists. Please sign in instead.", code: "USER_EXISTS" },
          { status: 409 },
        );
      }

      if (isSupabaseSignupDatabaseError(message)) {
        return json(
          {
            ok: false,
            error:
              "Signup is blocked by a Supabase database trigger or schema mismatch. Apply migration 20260428103000_harden_auth_signup_triggers.sql, then try again.",
            code: "SIGNUP_DATABASE_TRIGGER_ERROR",
          },
          { status: 503 },
        );
      }
    }

    return errorResponse(error);
  }
}
