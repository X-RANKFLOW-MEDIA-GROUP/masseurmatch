import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  REFERRAL_COOKIE_MAX_AGE_SECONDS,
  REFERRAL_MAX_REWARD_MONTHS,
  REFERRAL_REWARD_TIER,
  clearReferralCookieHeader,
  normalizeReferralCode,
} from "../../src/lib/referrals";

const root = process.cwd();

function source(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("referral rules", () => {
  it("normalizes only valid referral codes", () => {
    expect(normalizeReferralCode(" refabcdef1234 ")).toBe("REFABCDEF1234");
    expect(normalizeReferralCode("REF123")).toBeNull();
    expect(normalizeReferralCode("REFABCDE!123")).toBeNull();
    expect(normalizeReferralCode(null)).toBeNull();
  });

  it("keeps the attribution cookie bounded and removable", () => {
    expect(REFERRAL_COOKIE_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 30);
    expect(clearReferralCookieHeader(false)).toContain("Max-Age=0");
    expect(clearReferralCookieHeader(false)).toContain("HttpOnly");
    expect(clearReferralCookieHeader(false)).toContain("SameSite=Lax");
  });

  it("uses fixed Standard economics with a six month cap", () => {
    expect(REFERRAL_REWARD_TIER).toBe("standard");
    expect(REFERRAL_MAX_REWARD_MONTHS).toBe(6);

    const migration = source("supabase/migrations/20260808181500_standardize_referral_rewards.sql");
    expect(migration).toContain("referral_bonus_tier = 'standard'");
    expect(migration).toContain("premium_months_earned + v_reward_months");
    expect(migration).toContain("v_months_earned < 6");
    expect(migration).toContain("stripe_invoice_id = p_stripe_invoice_id");
  });

  it("holds rewards for 14 days and blocks reused payment fingerprints", () => {
    const migration = source("supabase/migrations/20260808193000_referral_antifraud.sql");
    expect(migration).toContain("now() + interval '14 days'");
    expect(migration).toContain("payment_fingerprint_reused");
    expect(migration).toContain("v_score >= 70 then 'rejected'");
    expect(migration).toContain("v_score >= 30 then 'review'");
    expect(migration).toContain("finalize-qualified-referrals-hourly");
  });

  it("revokes referral rewards after full refunds or disputes", () => {
    const webhook = source("src/app/api/webhooks/stripe/route.ts");
    const migration = source("supabase/migrations/20260808193000_referral_antifraud.sql");
    expect(webhook).toContain("case 'charge.refunded'");
    expect(webhook).toContain("case 'charge.dispute.created'");
    expect(webhook).toContain("qualify_paid_referral");
    expect(webhook).toContain("payment_method_details?.card?.fingerprint");
    expect(migration).toContain("revoke_referral_reward");
    expect(migration).toContain("premium_months_earned = greatest(0, premium_months_earned - 1)");
  });

  it("keeps the referral page discoverable from the Pro navigation", () => {
    const navigation = source("src/app/pro/ProLayoutClient.tsx");
    expect(navigation).toContain('href: "/pro/referrals"');
    expect(navigation).toContain('name: "Referral Rewards"');
  });

  it("repairs partial Demand Radar schemas before creating indexes", () => {
    const migration = source("supabase/migrations/20260806230000_demand_radar_pipeline.sql");
    const repair = migration.indexOf("ALTER TABLE public.demand_collection_runs");
    const index = migration.indexOf("demand_collection_runs_started_at_idx");

    expect(repair).toBeGreaterThan(-1);
    expect(index).toBeGreaterThan(repair);
    expect(migration).toContain("ADD COLUMN IF NOT EXISTS started_at timestamptz");
  });
});
