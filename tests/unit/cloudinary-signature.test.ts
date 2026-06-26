import { createHash } from "node:crypto";
import { describe, it, expect } from "vitest";

// Mirror the Cloudinary signature algorithm from
// supabase/functions/cloudinary-sign/index.ts

function signCloudinaryUploadNode(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const paramString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1")
    .update(paramString + apiSecret)
    .digest("hex");
}

// Web Crypto version (mirrors the edge function)
const encoder = new TextEncoder();

async function signCloudinaryUploadWebCrypto(
  params: Record<string, string | number>,
  apiSecret: string,
): Promise<string> {
  const paramString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  const toSign = paramString + apiSecret;
  const data = encoder.encode(toSign);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

describe("Cloudinary upload signature", () => {
  const apiSecret = "test-cloudinary-api-secret";

  it("produces a deterministic hex signature", () => {
    const params = { folder: "profiles/user-1", timestamp: 1700000000 };
    const sig1 = signCloudinaryUploadNode(params, apiSecret);
    const sig2 = signCloudinaryUploadNode(params, apiSecret);
    expect(sig1).toBe(sig2);
    expect(sig1).toMatch(/^[0-9a-f]{40}$/);
  });

  it("sorts parameters alphabetically", () => {
    const sig1 = signCloudinaryUploadNode(
      { z_param: "last", a_param: "first", timestamp: 1 },
      apiSecret,
    );
    const sig2 = signCloudinaryUploadNode(
      { timestamp: 1, a_param: "first", z_param: "last" },
      apiSecret,
    );
    expect(sig1).toBe(sig2);
  });

  it("changes signature when parameters change", () => {
    const base = { folder: "profiles/user-1", timestamp: 1700000000 };
    const modified = { folder: "profiles/user-2", timestamp: 1700000000 };
    expect(signCloudinaryUploadNode(base, apiSecret)).not.toBe(
      signCloudinaryUploadNode(modified, apiSecret),
    );
  });

  it("changes signature when secret changes", () => {
    const params = { folder: "profiles/user-1", timestamp: 1700000000 };
    expect(signCloudinaryUploadNode(params, apiSecret)).not.toBe(
      signCloudinaryUploadNode(params, "different-secret"),
    );
  });

  it("changes signature when timestamp changes", () => {
    const params1 = { folder: "profiles/user-1", timestamp: 1700000000 };
    const params2 = { folder: "profiles/user-1", timestamp: 1700000001 };
    expect(signCloudinaryUploadNode(params1, apiSecret)).not.toBe(
      signCloudinaryUploadNode(params2, apiSecret),
    );
  });
});

describe("Cloudinary: Node.js crypto ↔ Web Crypto parity", () => {
  const apiSecret = "test-cloudinary-api-secret";

  const testCases = [
    {
      label: "typical upload params",
      params: {
        folder: "masseurmatch/profiles/user-abc-123",
        timestamp: 1700000000,
      },
    },
    {
      label: "single parameter",
      params: { timestamp: 1234567890 },
    },
    {
      label: "many parameters",
      params: {
        eager: "w_400,h_400,c_crop",
        folder: "test",
        public_id: "my-image",
        tags: "profile,avatar",
        timestamp: 9999999999,
      },
    },
  ];

  for (const { label, params } of testCases) {
    it(`produces identical signatures for: ${label}`, async () => {
      const nodeResult = signCloudinaryUploadNode(params, apiSecret);
      const webResult = await signCloudinaryUploadWebCrypto(params, apiSecret);
      expect(nodeResult).toBe(webResult);
    });
  }
});
