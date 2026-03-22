import { json, withSetCookie } from "@/app/api/_lib/http";
import { clearSessionCookie } from "@/app/api/_lib/session";

export async function POST() {
  return withSetCookie(
    json({
      ok: true,
    }),
    clearSessionCookie(),
  );
}
