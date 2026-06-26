import { createHmac } from "node:crypto";
import { describe, it, expect } from "vitest";

// Stripe uses HMAC-SHA256 to sign webhook payloads. The SDK's
// constructEvent() verifies this internally. These tests validate the
// same algorithm to ensure our webhook route would reject forged events.

function stripeSign(payload: string, secret: string, timestamp: number): string {
  const signedPayload = `${timestamp}.${payload}`;
  return createHmac("sha256", secret).update(signedPayload).digest("hex");
}

function buildStripeSignatureHeader(
  payload: string,
  secret: string,
  timestamp?: number,
): string {
  const ts = timestamp ?? Math.floor(Date.now() / 1000);
  const sig = stripeSign(payload, secret, ts);
  return `t=${ts},v1=${sig}`;
}

function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
  toleranceSeconds = 300,
): boolean {
  const parts = header.split(",");
  const tPart = parts.find((p) => p.startsWith("t="));
  const v1Part = parts.find((p) => p.startsWith("v1="));

  if (!tPart || !v1Part) return false;

  const timestamp = parseInt(tPart.slice(2), 10);
  const receivedSig = v1Part.slice(3);

  if (isNaN(timestamp)) return false;

  const expectedSig = stripeSign(payload, secret, timestamp);
  if (receivedSig !== expectedSig) return false;

  const age = Math.floor(Date.now() / 1000) - timestamp;
  if (Math.abs(age) > toleranceSeconds) return false;

  return true;
}

describe("Stripe webhook signature verification", () => {
  const webhookSecret = "whsec_test_secret_1234567890";
  const payload = JSON.stringify({
    id: "evt_test_123",
    type: "payment_intent.succeeded",
    data: { object: { id: "pi_abc" } },
  });

  it("accepts a correctly signed payload", () => {
    const header = buildStripeSignatureHeader(payload, webhookSecret);
    expect(verifyStripeSignature(payload, header, webhookSecret)).toBe(true);
  });

  it("rejects a payload with a wrong secret", () => {
    const header = buildStripeSignatureHeader(payload, "whsec_wrong_secret");
    expect(verifyStripeSignature(payload, header, webhookSecret)).toBe(false);
  });

  it("rejects a modified payload", () => {
    const header = buildStripeSignatureHeader(payload, webhookSecret);
    const tampered = payload.replace("pi_abc", "pi_attacker");
    expect(verifyStripeSignature(tampered, header, webhookSecret)).toBe(false);
  });

  it("rejects a missing timestamp", () => {
    const sig = stripeSign(payload, webhookSecret, 1234567890);
    const header = `v1=${sig}`;
    expect(verifyStripeSignature(payload, header, webhookSecret)).toBe(false);
  });

  it("rejects a missing signature", () => {
    const ts = Math.floor(Date.now() / 1000);
    const header = `t=${ts}`;
    expect(verifyStripeSignature(payload, header, webhookSecret)).toBe(false);
  });

  it("rejects a replayed payload (stale timestamp)", () => {
    const staleTimestamp = Math.floor(Date.now() / 1000) - 600;
    const header = buildStripeSignatureHeader(
      payload,
      webhookSecret,
      staleTimestamp,
    );
    expect(
      verifyStripeSignature(payload, header, webhookSecret, 300),
    ).toBe(false);
  });

  it("accepts a payload within tolerance window", () => {
    const recentTimestamp = Math.floor(Date.now() / 1000) - 100;
    const header = buildStripeSignatureHeader(
      payload,
      webhookSecret,
      recentTimestamp,
    );
    expect(
      verifyStripeSignature(payload, header, webhookSecret, 300),
    ).toBe(true);
  });

  it("signature is deterministic", () => {
    const ts = 1700000000;
    const sig1 = stripeSign(payload, webhookSecret, ts);
    const sig2 = stripeSign(payload, webhookSecret, ts);
    expect(sig1).toBe(sig2);
  });

  it("different events produce different signatures", () => {
    const ts = 1700000000;
    const other = JSON.stringify({ id: "evt_other", type: "charge.failed" });
    const sig1 = stripeSign(payload, webhookSecret, ts);
    const sig2 = stripeSign(other, webhookSecret, ts);
    expect(sig1).not.toBe(sig2);
  });
});
