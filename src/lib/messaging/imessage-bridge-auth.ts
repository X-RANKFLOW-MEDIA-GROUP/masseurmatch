import { timingSafeEqual } from "node:crypto";

function constantTimeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function assertImessageBridgeAuthorized(request: Request) {
  const expected = process.env.IMESSAGE_BRIDGE_SECRET?.trim();
  if (!expected) throw new Error("IMESSAGE_BRIDGE_SECRET is not configured.");

  const supplied = request.headers.get("x-imessage-bridge-secret")?.trim() || "";
  if (!supplied || !constantTimeEqual(supplied, expected)) {
    const error = new Error("Unauthorized iMessage bridge request.") as Error & { status?: number };
    error.status = 401;
    throw error;
  }
}
