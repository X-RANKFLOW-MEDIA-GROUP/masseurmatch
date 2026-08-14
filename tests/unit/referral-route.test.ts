import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireRequestSession: vi.fn(),
  createReferralSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/app/api/_lib/session", () => ({
  requireRequestSession: mocks.requireRequestSession,
}));

vi.mock("@/app/api/pro/referrals/supabase", () => ({
  createReferralSupabaseAdminClient: mocks.createReferralSupabaseAdminClient,
}));

import { GET } from "@/app/api/pro/referrals/route";

describe("GET /api/pro/referrals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireRequestSession.mockResolvedValue({ userId: "user-1", role: "provider" });
  });

  it("returns the normal dashboard response through the service-role client", async () => {
    const rpc = vi.fn(async (name: string) => {
      if (name === "expire_referral_bonus_for_user") {
        return { data: false, error: null };
      }

      return {
        data: {
          summary: { code: "REFABCDEF1234", referralCount: 2 },
          referrals: [{ id: "referral-1", payment_status: "paid" }],
        },
        error: null,
      };
    });
    mocks.createReferralSupabaseAdminClient.mockReturnValue({ rpc });

    const response = await GET(new Request("http://localhost/api/pro/referrals"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.createReferralSupabaseAdminClient).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenNthCalledWith(1, "expire_referral_bonus_for_user", {
      p_user_id: "user-1",
    });
    expect(rpc).toHaveBeenNthCalledWith(2, "get_referral_dashboard", {
      p_user_id: "user-1",
    });
    expect(body.unavailable).toBe(false);
    expect(body.summary.referralLink).toBe(
      "https://masseurmatch.com/signup?ref=REFABCDEF1234",
    );
    expect(body.referrals).toEqual([
      { id: "referral-1", payment_status: "paid" },
    ]);
  });

  it("returns the resilient unavailable response when the dashboard RPC fails", async () => {
    const rpc = vi.fn(async (name: string) =>
      name === "expire_referral_bonus_for_user"
        ? { data: false, error: null }
        : {
            data: null,
            error: { code: "42501", message: "Only service_role can call this function" },
          },
    );
    mocks.createReferralSupabaseAdminClient.mockReturnValue({ rpc });

    const response = await GET(new Request("http://localhost/api/pro/referrals"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.unavailable).toBe(true);
    expect(body.referrals).toEqual([]);
    expect(body.summary.referralCount).toBe(0);
  });
});
