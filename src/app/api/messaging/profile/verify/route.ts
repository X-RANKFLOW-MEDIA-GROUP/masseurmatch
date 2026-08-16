import { RouteError } from "@/app/api/_lib/http";
import { requireSession } from "@/app/api/_lib/supabase-server";
import { verifyKnottyProfileSession } from "@/lib/messaging/knotty-imessage";

function redirectTo(request: Request, path: string) {
  return Response.redirect(new URL(path, request.url), 303);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() || "";

  if (!token || token.length < 20 || token.length > 200) {
    return redirectTo(request, "/login?error=invalid_text_verification_link");
  }

  try {
    const session = await requireSession(request);
    const result = await verifyKnottyProfileSession(token, session.userId);

    if (result.ok) {
      return redirectTo(request, "/pro/dashboard?text_profile_verified=1");
    }

    if (result.reason === "wrong_account") {
      return redirectTo(request, "/pro/dashboard?text_profile_verified=wrong_account");
    }

    if (result.reason === "expired") {
      return redirectTo(request, "/pro/dashboard?text_profile_verified=expired");
    }

    return redirectTo(request, "/pro/dashboard?text_profile_verified=invalid");
  } catch (error) {
    if (error instanceof RouteError && error.status === 401) {
      const returnPath = `/api/messaging/profile/verify?token=${encodeURIComponent(token)}`;
      return redirectTo(request, `/login?redirect=${encodeURIComponent(returnPath)}`);
    }
    return redirectTo(request, "/pro/dashboard?text_profile_verified=error");
  }
}
