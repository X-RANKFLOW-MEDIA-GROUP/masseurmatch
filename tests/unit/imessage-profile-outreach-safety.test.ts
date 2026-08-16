import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const routePath = path.join(
  process.cwd(),
  "src/app/api/admin/messaging/profile-outreach/route.ts",
);
const source = fs.readFileSync(routePath, "utf8");

describe("Knotty iMessage profile outreach safety", () => {
  it("requires one explicit provider profile for queue actions", () => {
    expect(source).toContain('action: z.literal("queue")');
    expect(source).toContain("profileId: z.string().uuid()");
    expect(source).toContain("max(1).optional().default(1)");
  });

  it("refuses queue creation while the dedicated outbound gate is disarmed", () => {
    expect(source).toContain(
      '.select("receiving_number,global_pause,imessage_outbound_enabled")',
    );
    expect(source).toContain(
      'settingsResult.data.imessage_outbound_enabled !== true',
    );
    expect(source).toContain('throw new RouteError(409, "Outbound iMessage is disarmed.")');
  });
});
