import { describe, expect, it } from "vitest";

import {
  isPrivateNetworkAddress,
  parseSafePublicUrl,
} from "@/app/api/migrate/_lib/source-url";

describe("profile import source URL security", () => {
  it("accepts normal public HTTP and HTTPS URLs", () => {
    expect(parseSafePublicUrl("https://example.com/profile#reviews").toString()).toBe(
      "https://example.com/profile",
    );
    expect(parseSafePublicUrl("http://example.com/profile").protocol).toBe("http:");
  });

  it("rejects credentials and local hostnames", () => {
    expect(() => parseSafePublicUrl("https://user:pass@example.com/profile")).toThrow();
    expect(() => parseSafePublicUrl("http://localhost:5432/")).toThrow();
    expect(() => parseSafePublicUrl("http://service.internal/")).toThrow();
  });

  it("recognizes private and metadata-service IP ranges", () => {
    for (const address of ["127.0.0.1", "10.0.0.1", "169.254.169.254", "192.168.1.4", "::1", "fd00::1"]) {
      expect(isPrivateNetworkAddress(address), address).toBe(true);
    }
    expect(isPrivateNetworkAddress("8.8.8.8")).toBe(false);
    expect(isPrivateNetworkAddress("2606:4700:4700::1111")).toBe(false);
  });
});
