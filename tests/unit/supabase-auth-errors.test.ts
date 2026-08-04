import { describe, expect, it } from "vitest";
import { isExpectedInvalidSessionError } from "@/lib/supabase/auth-errors";

describe("isExpectedInvalidSessionError", () => {
  it.each([
    "refresh_token_not_found",
    "refresh_token_already_used",
    "session_not_found",
  ])("recognizes Supabase auth code %s", (code) => {
    expect(isExpectedInvalidSessionError({ code })).toBe(true);
  });

  it.each([
    "Invalid Refresh Token: Refresh Token Not Found",
    "Refresh token already used",
    "Auth session missing!",
  ])("recognizes expected auth message %s", (message) => {
    expect(isExpectedInvalidSessionError({ message })).toBe(true);
  });

  it("does not hide unrelated authentication or server errors", () => {
    expect(isExpectedInvalidSessionError({ code: "unexpected_failure" })).toBe(false);
    expect(isExpectedInvalidSessionError(new Error("Database unavailable"))).toBe(false);
    expect(isExpectedInvalidSessionError(null)).toBe(false);
  });
});
