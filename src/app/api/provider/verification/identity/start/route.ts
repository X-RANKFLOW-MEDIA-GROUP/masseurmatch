import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { requireSession } from "@/app/api/_lib/supabase-server";

async function startManualFallback(request: Request) {
  const manualRes = await fetch(new URL("/api/provider/verification/identity/manual/start", request.url).toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: request.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({}),
  });
  const manualData = await manualRes.json().catch(() => ({}));
  if (!manualRes.ok) {
    throw new RouteError(
      manualRes.status as 400 | 401 | 403 | 404 | 500,
      manualData.error ?? "Unable to start manual identity verification.",
    );
  }

  const params = new URLSearchParams({
    verificationId: manualData.verificationId,
    challengeCode: manualData.challengeCode,
  });

  return json({
    ok: true,
    mode: "manual",
    url: `/pro/trust/verify?${params.toString()}`,
    verificationId: manualData.verificationId,
  });
}

export async function POST(request: Request) {
  try {
    await requireSession(request);

    if (process.env.IDENTITY_VERIFICATION_MODE === "manual") {
      return startManualFallback(request);
    }

    const res = await fetch(new URL("/api/stripe/identity/create-session", request.url).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({ returnTo: "pro_trust" }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.url) {
      return json({ ok: true, mode: "stripe", ...data });
    }

    const message = typeof data.error === "string" ? data.error.toLowerCase() : "";
    const accountRestricted =
      res.status >= 500 ||
      message.includes("unable to perform this action") ||
      message.includes("contact us via") ||
      message.includes("account") && message.includes("restricted");

    if (accountRestricted) {
      console.warn("[identity/start] Stripe unavailable; using manual identity verification fallback.");
      return startManualFallback(request);
    }

    throw new RouteError(
      res.status as 400 | 401 | 403 | 404 | 500,
      data.error ?? "Failed to start identity verification.",
    );
  } catch (error) {
    return errorResponse(error);
  }
}
