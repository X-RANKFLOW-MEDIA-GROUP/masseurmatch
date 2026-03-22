import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { signAuthToken } from "@/app/_lib/auth-token";
import { isProduction } from "@/app/_lib/env";
import { forgotPasswordSchema } from "@/app/_lib/validation";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, forgotPasswordSchema);
    const previewToken = await signAuthToken(
      {
        sub: body.email,
        email: body.email,
        scope: "password-reset",
      },
      "30m",
    );

    return json({
      ok: true,
      message: "If an account exists for that email, a password reset link will be sent.",
      reset: {
        mock: true,
        email: body.email,
        redirectTo: body.redirectTo || "/reset-password",
        requestedAt: new Date().toISOString(),
        previewToken: isProduction ? undefined : previewToken,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
