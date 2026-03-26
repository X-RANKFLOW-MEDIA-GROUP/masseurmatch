import { errorResponse, json, parseJsonBody, RouteError, withSetCookie } from "@/app/api/_lib/http";
import { setSessionCookie } from "@/app/api/_lib/session";
import { authLoginSchema } from "@/app/_lib/validation";
import {
  getUserByEmail,
  getUserRole,
  verifyPassword,
} from "@/app/api/_lib/supabase-server";

export async function POST(request: Request) {
  try {
    console.log("[v0] login: parsing body");
    const body = await parseJsonBody(request, authLoginSchema);
    console.log("[v0] login: body parsed", { email: body.email });

    console.log("[v0] login: getting user by email");
    const user = await getUserByEmail(body.email);

    if (!user?.email) {
      console.log("[v0] login: user not found");
      throw new RouteError(401, "Invalid email or password.");
    }
    console.log("[v0] login: user found", { userId: user.id });

    console.log("[v0] login: verifying password");
    await verifyPassword(body.email, body.password);
    console.log("[v0] login: password verified");

    const role = await getUserRole(user.id);
    console.log("[v0] login: role retrieved", { role });

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
        email: user.email,
        role,
      }),
    );
  } catch (error) {
    console.error("[v0] login: error", error);
    return errorResponse(error);
  }
}
