import { timingSafeEqual } from "node:crypto";

import { RouteError } from "@/app/api/_lib/http";

function constantTimeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function assertImessageBridgeAuthorized(request: Request) {
  const expected = process.env.IMESSAGE_BRIDGE_SECRET?.trim();
  if (!expected) throw new RouteError(503, "iMessage bridge is not configured.", "IMESSAGE_BRIDGE_NOT_CONFIGURED");

  const supplied = request.headers.get("x-imessage-bridge-secret")?.trim() || "";
  if (!supplied || !constantTimeEqual(supplied, expected)) {
    throw new RouteError(401, "Unauthorized iMessage bridge request.", "IMESSAGE_BRIDGE_UNAUTHORIZED");
  }
}
