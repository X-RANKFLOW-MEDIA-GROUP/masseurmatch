import { createHmac } from "node:crypto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ─── Helpers that mirror the production implementations ──────────────────────

const DEV_SECRET = "dev-only-masseurmatch-session-secret";

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayloadNode(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

// Web Crypto implementation matching src/middleware.ts
const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function signPayloadWebCrypto(
  payload: string,
  secret: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  return toBase64Url(new Uint8Array(signature));
}

interface SessionPayload {
  userId: string;
  email: string;
  role: "admin" | "provider" | "client" | null;
  expiresAt: string;
}

function buildSignedCookie(session: SessionPayload, secret: string): string {
  const payload = encodeBase64Url(JSON.stringify(session));
  const sig = signPayloadNode(payload, secret);
  return `${payload}.${sig}`;
}

function futureIso(ms = 86_400_000): string {
  return new Date(Date.now() + ms).toISOString();
}

function pastIso(ms = 86_400_000): string {
  return new Date(Date.now() - ms).toISOString();
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Session signing — Node.js crypto (API routes)", () => {
  const secret = DEV_SECRET;
  const session: SessionPayload = {
    userId: "user-abc-123",
    email: "test@example.com",
    role: "provider",
    expiresAt: futureIso(),
  };

  it("produces a deterministic signature for the same input", () => {
    const payload = encodeBase64Url(JSON.stringify(session));
    const sig1 = signPayloadNode(payload, secret);
    const sig2 = signPayloadNode(payload, secret);
    expect(sig1).toBe(sig2);
  });

  it("produces a different signature for different payloads", () => {
    const payload1 = encodeBase64Url(JSON.stringify(session));
    const payload2 = encodeBase64Url(
      JSON.stringify({ ...session, userId: "user-xyz-999" }),
    );
    expect(signPayloadNode(payload1, secret)).not.toBe(
      signPayloadNode(payload2, secret),
    );
  });

  it("produces a different signature with a different secret", () => {
    const payload = encodeBase64Url(JSON.stringify(session));
    const sig1 = signPayloadNode(payload, secret);
    const sig2 = signPayloadNode(payload, "other-secret");
    expect(sig1).not.toBe(sig2);
  });

  it("builds a well-formed signed cookie value", () => {
    const cookie = buildSignedCookie(session, secret);
    const [payload, sig] = cookie.split(".");
    expect(payload).toBeTruthy();
    expect(sig).toBeTruthy();

    const decoded = JSON.parse(decodeBase64Url(payload!));
    expect(decoded.userId).toBe(session.userId);
    expect(decoded.email).toBe(session.email);
    expect(decoded.role).toBe(session.role);
  });
});

describe("Tamper detection", () => {
  const secret = DEV_SECRET;
  const session: SessionPayload = {
    userId: "user-abc-123",
    email: "test@example.com",
    role: "provider",
    expiresAt: futureIso(),
  };

  function verifySignature(cookieValue: string, secret: string): boolean {
    const [payload, signature] = cookieValue.split(".");
    if (!payload || !signature) return false;
    const expected = signPayloadNode(payload, secret);
    return signature === expected;
  }

  it("verifies a valid cookie", () => {
    const cookie = buildSignedCookie(session, secret);
    expect(verifySignature(cookie, secret)).toBe(true);
  });

  it("rejects a cookie with a modified payload", () => {
    const cookie = buildSignedCookie(session, secret);
    const [payload, sig] = cookie.split(".");

    const decoded = JSON.parse(decodeBase64Url(payload!));
    decoded.role = "admin";
    const tamperedPayload = encodeBase64Url(JSON.stringify(decoded));

    expect(verifySignature(`${tamperedPayload}.${sig}`, secret)).toBe(false);
  });

  it("rejects a cookie with a modified signature", () => {
    const cookie = buildSignedCookie(session, secret);
    const [payload] = cookie.split(".");
    expect(verifySignature(`${payload}.AAAA_tampered`, secret)).toBe(false);
  });

  it("rejects a cookie with no signature", () => {
    const payload = encodeBase64Url(JSON.stringify(session));
    expect(verifySignature(payload, secret)).toBe(false);
  });

  it("rejects a completely empty string", () => {
    expect(verifySignature("", secret)).toBe(false);
  });

  it("rejects a cookie signed with a different secret", () => {
    const cookie = buildSignedCookie(session, "attacker-secret");
    expect(verifySignature(cookie, secret)).toBe(false);
  });
});

describe("Session expiry", () => {
  function parseSession(
    cookieValue: string,
    secret: string,
  ): SessionPayload | null {
    const [payload, signature] = cookieValue.split(".");
    if (!payload || !signature) return null;
    if (signPayloadNode(payload, secret) !== signature) return null;

    try {
      const parsed = JSON.parse(decodeBase64Url(payload)) as SessionPayload;
      if (!parsed.userId || !parsed.email || !parsed.expiresAt) return null;
      const expiryMs = new Date(parsed.expiresAt).getTime();
      if (Number.isNaN(expiryMs) || expiryMs <= Date.now()) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  it("accepts a session that has not expired", () => {
    const session: SessionPayload = {
      userId: "u1",
      email: "a@b.com",
      role: "client",
      expiresAt: futureIso(),
    };
    const cookie = buildSignedCookie(session, DEV_SECRET);
    expect(parseSession(cookie, DEV_SECRET)).not.toBeNull();
    expect(parseSession(cookie, DEV_SECRET)!.userId).toBe("u1");
  });

  it("rejects a session that has expired", () => {
    const session: SessionPayload = {
      userId: "u1",
      email: "a@b.com",
      role: "client",
      expiresAt: pastIso(),
    };
    const cookie = buildSignedCookie(session, DEV_SECRET);
    expect(parseSession(cookie, DEV_SECRET)).toBeNull();
  });

  it("rejects a session with an invalid date", () => {
    const session = {
      userId: "u1",
      email: "a@b.com",
      role: "client" as const,
      expiresAt: "not-a-date",
    };
    const cookie = buildSignedCookie(session, DEV_SECRET);
    const parsed = parseSession(cookie, DEV_SECRET);
    expect(parsed).toBeNull();
  });

  it("rejects a session missing required fields", () => {
    const partial = { userId: "u1" };
    const payload = encodeBase64Url(JSON.stringify(partial));
    const sig = signPayloadNode(payload, DEV_SECRET);
    expect(parseSession(`${payload}.${sig}`, DEV_SECRET)).toBeNull();
  });
});

describe("Cross-implementation: Node.js crypto ↔ Web Crypto", () => {
  const testCases = [
    { label: "simple string", payload: "hello-world" },
    {
      label: "base64url session payload",
      payload: encodeBase64Url(
        JSON.stringify({
          userId: "user-123",
          email: "test@example.com",
          role: "admin",
          expiresAt: "2099-01-01T00:00:00.000Z",
        }),
      ),
    },
    { label: "empty string", payload: "" },
    {
      label: "unicode content",
      payload: encodeBase64Url("日本語テスト 🎉"),
    },
    {
      label: "long payload",
      payload: encodeBase64Url("x".repeat(10_000)),
    },
  ];

  for (const { label, payload } of testCases) {
    it(`produces identical signatures for: ${label}`, async () => {
      const nodeResult = signPayloadNode(payload, DEV_SECRET);
      const webResult = await signPayloadWebCrypto(payload, DEV_SECRET);
      expect(nodeResult).toBe(webResult);
    });
  }

  it("both implementations reject a tampered payload", async () => {
    const payload = encodeBase64Url(
      JSON.stringify({ userId: "u1", role: "client" }),
    );
    const nodeSig = signPayloadNode(payload, DEV_SECRET);
    const webSig = await signPayloadWebCrypto(payload, DEV_SECRET);

    const tampered = encodeBase64Url(
      JSON.stringify({ userId: "u1", role: "admin" }),
    );
    const tamperedNodeSig = signPayloadNode(tampered, DEV_SECRET);
    const tamperedWebSig = await signPayloadWebCrypto(tampered, DEV_SECRET);

    expect(tamperedNodeSig).not.toBe(nodeSig);
    expect(tamperedWebSig).not.toBe(webSig);
    expect(tamperedNodeSig).toBe(tamperedWebSig);
  });
});

describe("Secret fallback chain", () => {
  const envKeys = [
    "MM_SESSION_SECRET",
    "SESSION_SECRET",
    "MM_JWT_SECRET",
    "JWT_SECRET",
  ];

  beforeEach(() => {
    for (const key of envKeys) {
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of envKeys) {
      delete process.env[key];
    }
    vi.unstubAllEnvs();
  });

  it("uses MM_SESSION_SECRET when set", async () => {
    const { envOptional } = await import("@/app/api/_lib/env");
    process.env.MM_SESSION_SECRET = "secret-mm-session";
    expect(envOptional(envKeys)).toBe("secret-mm-session");
  });

  it("falls back to SESSION_SECRET", async () => {
    const { envOptional } = await import("@/app/api/_lib/env");
    process.env.SESSION_SECRET = "secret-session";
    expect(envOptional(envKeys)).toBe("secret-session");
  });

  it("falls back to MM_JWT_SECRET", async () => {
    const { envOptional } = await import("@/app/api/_lib/env");
    process.env.MM_JWT_SECRET = "secret-jwt";
    expect(envOptional(envKeys)).toBe("secret-jwt");
  });

  it("falls back to JWT_SECRET", async () => {
    const { envOptional } = await import("@/app/api/_lib/env");
    process.env.JWT_SECRET = "secret-jwt-last";
    expect(envOptional(envKeys)).toBe("secret-jwt-last");
  });

  it("respects priority order — first match wins", async () => {
    const { envOptional } = await import("@/app/api/_lib/env");
    process.env.MM_SESSION_SECRET = "first";
    process.env.SESSION_SECRET = "second";
    process.env.JWT_SECRET = "last";
    expect(envOptional(envKeys)).toBe("first");
  });

  it("returns undefined when no secret is set", async () => {
    const { envOptional } = await import("@/app/api/_lib/env");
    expect(envOptional(envKeys)).toBeUndefined();
  });

  it("dev fallback is only available in dev/test NODE_ENV", () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = "production";
      expect(() => {
        // Simulate the sessionSecret() logic from session.ts
        const secret = undefined; // no env var set
        if (secret) return;
        if (
          process.env.NODE_ENV === "development" ||
          process.env.NODE_ENV === "test"
        ) {
          return;
        }
        throw new Error("MM_SESSION_SECRET is required");
      }).toThrow("MM_SESSION_SECRET is required");
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it("dev fallback IS available in test NODE_ENV", () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = "test";
      let result: string | undefined;
      const secret = undefined;
      if (secret) {
        result = secret;
      } else if (
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV === "test"
      ) {
        result = DEV_SECRET;
      }
      expect(result).toBe(DEV_SECRET);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe("Constant-time comparison (middleware)", () => {
  function constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let index = 0; index < a.length; index += 1) {
      mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
    }
    return mismatch === 0;
  }

  it("returns true for identical strings", () => {
    expect(constantTimeEqual("abc", "abc")).toBe(true);
  });

  it("returns false for different strings of same length", () => {
    expect(constantTimeEqual("abc", "abd")).toBe(false);
  });

  it("returns false for strings of different length", () => {
    expect(constantTimeEqual("abc", "abcd")).toBe(false);
  });

  it("returns true for empty strings", () => {
    expect(constantTimeEqual("", "")).toBe(true);
  });

  it("handles base64url signatures correctly", () => {
    const sig = signPayloadNode("test", DEV_SECRET);
    expect(constantTimeEqual(sig, sig)).toBe(true);
    const other = signPayloadNode("other", DEV_SECRET);
    expect(constantTimeEqual(sig, other)).toBe(false);
  });
});
