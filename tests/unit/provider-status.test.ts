import { describe, expect, it } from "vitest";
import { formatProviderStatus, PROVIDER_STATUS_OPTIONS, PROVIDER_STATUS_VALUES } from "@/lib/provider-status";

describe("provider status contract", () => {
  it("exposes only values accepted by profiles.current_status", () => {
    expect(PROVIDER_STATUS_VALUES).toEqual([
      "available",
      "active",
      "mobile",
      "traveling",
      "hidden",
      "inactive",
    ]);
    expect(PROVIDER_STATUS_OPTIONS.map((option) => option.value)).toEqual(PROVIDER_STATUS_VALUES);
  });

  it("formats database values for the public profile", () => {
    expect(formatProviderStatus("active")).toBe("Accepting appointments");
    expect(formatProviderStatus("hidden")).toBe("Away");
    expect(formatProviderStatus("available")).toBe("Available");
  });
});
