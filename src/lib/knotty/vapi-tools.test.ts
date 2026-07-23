import { afterEach, describe, expect, it } from "vitest";

import { RouteError } from "@/app/api/_lib/http";
import { assertVapiAuthorization, extractVapiToolCalls } from "@/lib/knotty/vapi-tools";

const originalSecret = process.env.VAPI_WEBHOOK_SECRET;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.VAPI_WEBHOOK_SECRET;
  } else {
    process.env.VAPI_WEBHOOK_SECRET = originalSecret;
  }
});

describe("extractVapiToolCalls", () => {
  it("parses Vapi function arguments supplied as JSON text", () => {
    const calls = extractVapiToolCalls({
      message: {
        toolCallList: [
          {
            id: "call_123",
            function: {
              name: "update_provider_bio",
              arguments: JSON.stringify({ bio: "Updated provider bio", confirmed: true }),
            },
          },
        ],
      },
    });

    expect(calls).toEqual([
      {
        id: "call_123",
        name: "update_provider_bio",
        arguments: { bio: "Updated provider bio", confirmed: true },
      },
    ]);
  });

  it("accepts top-level toolCalls with object arguments", () => {
    const calls = extractVapiToolCalls({
      toolCalls: [
        {
          toolCallId: "call_456",
          name: "get_provider_profile",
          arguments: {},
        },
      ],
    });

    expect(calls[0]).toMatchObject({
      id: "call_456",
      name: "get_provider_profile",
      arguments: {},
    });
  });

  it("rejects requests without valid tool calls", () => {
    expect(() => extractVapiToolCalls({ message: {} })).toThrow(RouteError);
  });
});

describe("assertVapiAuthorization", () => {
  it("accepts the configured bearer secret", () => {
    process.env.VAPI_WEBHOOK_SECRET = "test-secret-value";
    const request = new Request("https://masseurmatch.com/api/vapi/knotty/tools", {
      headers: { authorization: "Bearer test-secret-value" },
    });

    expect(() => assertVapiAuthorization(request)).not.toThrow();
  });

  it("rejects an invalid secret", () => {
    process.env.VAPI_WEBHOOK_SECRET = "expected-secret";
    const request = new Request("https://masseurmatch.com/api/vapi/knotty/tools", {
      headers: { authorization: "Bearer wrong-secret" },
    });

    expect(() => assertVapiAuthorization(request)).toThrow(RouteError);
  });

  it("fails closed when the server secret is missing", () => {
    delete process.env.VAPI_WEBHOOK_SECRET;
    const request = new Request("https://masseurmatch.com/api/vapi/knotty/tools");

    expect(() => assertVapiAuthorization(request)).toThrow(RouteError);
  });
});
