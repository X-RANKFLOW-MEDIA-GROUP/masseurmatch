import { errorResponse, json, parseJsonBody, withSetCookie } from "@/app/api/_lib/http";
import { setSessionCookie } from "@/app/api/_lib/session";
import { authLoginSchema } from "@/app/_lib/validation";
import {
  getUserRole,
  verifyPassword,
} from "@/app/api/_lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, authLoginSchema);
    const { user } = await verifyPassword(body.email, body.password);
    const role = await getUserRole(user.id);

    const response = json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
      },
      role,
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
