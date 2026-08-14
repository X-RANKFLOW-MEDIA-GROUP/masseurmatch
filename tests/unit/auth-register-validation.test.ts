import { describe, expect, it } from "vitest";

import { authRegisterSchema } from "@/app/_lib/validation";

describe("registration phone contract", () => {
  const validRegistration = {
    fullName: "Alex Smith",
    email: "alex@example.com",
    password: "correct-horse-battery-staple",
    phone: "+1 (512) 555-0142",
  };

  it("requires and accepts a valid phone number", () => {
    expect(authRegisterSchema.safeParse(validRegistration).success).toBe(true);
  });

  it("rejects a missing or invalid phone number", () => {
    expect(
      authRegisterSchema.safeParse({ ...validRegistration, phone: "555-12" }).success,
    ).toBe(false);

    const { phone: _phone, ...withoutPhone } = validRegistration;
    expect(authRegisterSchema.safeParse(withoutPhone).success).toBe(false);
  });
});
