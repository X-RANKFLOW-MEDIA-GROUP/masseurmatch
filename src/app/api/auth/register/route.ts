import { errorResponse, json, parseJsonBody, withSetCookie } from "@/app/api/_lib/http";
import { RouteError } from "@/app/api/_lib/http";
import { setSessionCookie } from "@/app/api/_lib/session";
import { authRegisterSchema } from "@/app/_lib/validation";
import { createTherapistUser, getUserByEmail } from "@/app/api/_lib/supabase-server";

export async function POST(request: Request) {
  try {
    console.log("[v0] register: parsing body");
    const body = await parseJsonBody(request, authRegisterSchema);
    console.log("[v0] register: body parsed", { email: body.email, fullName: body.fullName });

    // Check if user already exists before attempting to create
    console.log("[v0] register: checking if user exists");
    const existingUser = await getUserByEmail(body.email);
    if (existingUser) {
      console.log("[v0] register: user already exists");
      return json(
        {
          ok: false,
          error: "An account with this email already exists. Please sign in instead.",
          code: "USER_EXISTS",
        },
        { status: 409 },
      );
    }

    console.log("[v0] register: creating therapist user");
    const result = await createTherapistUser(body);
    console.log("[v0] register: user created", { userId: result.user.id, role: result.role });

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
    console.error("[v0] register: error", error);
    return errorResponse(error);
  }
}
