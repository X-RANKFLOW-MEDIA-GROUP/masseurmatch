import { errorResponse, json, parseJsonBody, withSetCookie } from "@/app/api/_lib/http";
import { RouteError } from "@/app/api/_lib/http";
import { setSessionCookie } from "@/app/api/_lib/session";
import { authRegisterSchema } from "@/app/_lib/validation";
import { createTherapistUser, getUserByEmail } from "@/app/api/_lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, authRegisterSchema);

    // Check if user already exists before attempting to create
    const existingUser = await getUserByEmail(body.email);
    if (existingUser) {
      return json(
        {
          ok: false,
          error: "An account with this email already exists. Please sign in instead.",
          code: "USER_EXISTS",
        },
        { status: 409 },
      );
    }

    const result = await createTherapistUser(body);

    const response = json({
      ok: true,
      user: {
        id: result.user.id,
        email: result.user.email,
      },
      role: result.role,
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
    return errorResponse(error);
  }
}
