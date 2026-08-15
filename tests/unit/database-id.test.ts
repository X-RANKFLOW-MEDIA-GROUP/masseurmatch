import { describe, expect, it } from "vitest";

import { isDatabaseUuid } from "@/lib/database-id";

describe("isDatabaseUuid", () => {
  it("accepts canonical database UUIDs", () => {
    expect(isDatabaseUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isDatabaseUuid("A3BB189E-8BF9-3888-9912-ACE4E6543002")).toBe(true);
  });

  it("rejects synthetic fallback profile IDs", () => {
    expect(isDatabaseUuid("fallback-bruno-santos")).toBe(false);
    expect(isDatabaseUuid("fallback-kevin-os")).toBe(false);
    expect(isDatabaseUuid("fallback-ethan-cole")).toBe(false);
  });

  it("rejects malformed identifiers instead of sending them to uuid columns", () => {
    expect(isDatabaseUuid("")).toBe(false);
    expect(isDatabaseUuid("550e8400-e29b-41d4-a716")).toBe(false);
    expect(isDatabaseUuid("not-a-uuid")).toBe(false);
  });
});
