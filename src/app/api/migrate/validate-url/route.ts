import { z } from "zod";

import { assertRateLimit } from "@/app/_lib/security";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { requireRequestSession } from "@/app/api/_lib/session";
import { assertSafePublicUrl } from "@/app/api/migrate/_lib/source-url";

const platforms = ["rubmaps", "4corners", "nuru", "custom"] as const;
const schema = z.object({
  url: z.string().trim().url().max(2048),
  platform: z.enum(platforms),
});

function matchesHost(hostname: string, allowedHost: string) {
  return hostname === allowedHost || hostname.endsWith(`.${allowedHost}`);
}

function assertPlatformUrl(platform: (typeof platforms)[number], url: URL) {
  const hostname = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();
  const valid =
    platform === "custom" ||
    (platform === "rubmaps" && matchesHost(hostname, "rubmaps.com") && path.includes("/provider")) ||
    (platform === "4corners" && matchesHost(hostname, "4corners.xxx") && path.length > 1) ||
    (platform === "nuru" && matchesHost(hostname, "nurumap.com") && path.includes("/provider"));

  if (!valid) {
    throw new RouteError(400, `Invalid ${platform} URL format. Please check and try again.`);
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "profile-migration-validate-url", { limit: 20, windowMs: 60_000 });
    await requireRequestSession(request);

    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw new RouteError(400, parsed.error.issues[0]?.message || "Enter a valid profile URL.");
    }

    const url = await assertSafePublicUrl(parsed.data.url);
    assertPlatformUrl(parsed.data.platform, url);

    return json({ ok: true, valid: true, url: url.toString() });
  } catch (error) {
    return errorResponse(error);
  }
}
