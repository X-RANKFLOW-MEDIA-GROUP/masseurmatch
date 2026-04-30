import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { RouteError } from "@/app/api/_lib/http";
import { authRegisterSchema } from "@/app/_lib/validation";
import {
  createTherapistUser,
} from "@/app/api/_lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, authRegisterSchema);
    const { origin } = new URL(request.url);
    const result = await createTherapistUser({
      ...body,
      emailRedirectTo: `${origin}/api/auth/callback?next=/pro/onboard`,
    });

    return json({
      ok: true,
      user: {
        id: result.user.id,
        email: result.user.email,
      },
      role: null,
      session: result.session
        ? {
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        }
        : null,
      requiresEmailConfirmation: true,
      message: "Check your email to confirm your account before continuing.",
    });
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
