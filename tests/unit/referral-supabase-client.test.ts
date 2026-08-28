import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(() => ({ rpc: vi.fn() })) }));

vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));

import { createReferralSupabaseAdminClient } from "@/app/api/pro/referrals/supabase";

describe("referral Supabase client", () => {
  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    vi.clearAllMocks();
  });

  it("constructs a server-only client with explicit service-role authorization", () => {
    process.env.SUPABASE_URL = "https://test-project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

    createReferralSupabaseAdminClient();

    expect(mocks.createClient).toHaveBeenCalledWith(
      "https://test-project.supabase.co",
      "test-service-role-key",
      expect.objectContaining({
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            apikey: "test-service-role-key",
            Authorization: "Bearer test-service-role-key",
          },
        },
      }),
    );
  });
});
