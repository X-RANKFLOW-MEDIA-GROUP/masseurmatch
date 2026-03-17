import { errorResponse, json, parseJsonBody, withSetCookie } from "@/app/api/_lib/http";
import { setSessionCookie } from "@/app/api/_lib/session";
import { authRegisterSchema } from "@/app/_lib/validation";
import { createTherapistUser } from "@/app/api/_lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, authRegisterSchema);
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
