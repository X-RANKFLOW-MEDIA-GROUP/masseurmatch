import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { requireSession } from "@/app/api/_lib/supabase-server";

async function startManualVerification(request: Request) {
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
      manualData.error ?? "Unable to start identity verification.",
    );
  }

  const params = new URLSearchParams({ verificationId: manualData.verificationId });

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
    return startManualVerification(request);
  } catch (error) {
    return errorResponse(error);
  }
}
