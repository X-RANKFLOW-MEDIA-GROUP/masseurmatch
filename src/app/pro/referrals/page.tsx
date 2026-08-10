"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Gift, Loader2, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReferralSummary {
  code: string;
  referralLink: string | null;
  referralCount: number;
  premiumMonthsEarned: number;
  pendingReferrals: number;
  paidReferrals: number;
  maxPremiumMonths: number;
  remainingPremiumMonths: number;
  bonusExpiresAt: string | null;
  bonusTier: string | null;
}

interface ReferralRow {
  id: string;
  payment_status: "pending" | "completed" | "rejected";
  reward_months: number;
  paid_at: string | null;
  created_at: string;
}

interface ReferralResponse {
  ok: boolean;
  summary: ReferralSummary;
  referrals: ReferralRow[];
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/pro/referrals", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load your referral program.");
      setData((await response.json()) as ReferralResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load referrals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function copyLink() {
    const link = data?.summary.referralLink;
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function shareLink() {
    const link = data?.summary.referralLink;
    if (!link) return;

    if (navigator.share) {
      await navigator.share({
        title: "Join MasseurMatch",
        text: "Create your MasseurMatch profile and start with a 14-day premium trial.",
        url: link,
      });
      return;
    }

    await copyLink();
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B1E2D]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-destructive">{error ?? "Unable to load referrals."}</p>
            <Button className="mt-5" onClick={() => void load()}>Try again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary, referrals } = data;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-8 lg:px-10">
      <header>
        <Badge variant="secondary">Referral rewards</Badge>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">
          Earn Standard months
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Earn one month of Standard for every new provider who joins with your link and completes their first paid subscription invoice. Rewards are capped at six lifetime months and begin after any active paid entitlement.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <Users className="h-5 w-5 text-[#8B1E2D]" />
            <p className="mt-4 text-2xl font-bold">{summary.referralCount}</p>
            <p className="text-sm text-muted-foreground">Paid referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Gift className="h-5 w-5 text-[#8B1E2D]" />
            <p className="mt-4 text-2xl font-bold">{summary.premiumMonthsEarned}</p>
            <p className="text-sm text-muted-foreground">Standard months earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Share2 className="h-5 w-5 text-[#8B1E2D]" />
            <p className="mt-4 text-2xl font-bold">{summary.pendingReferrals}</p>
            <p className="text-sm text-muted-foreground">Pending signups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Gift className="h-5 w-5 text-[#8B1E2D]" />
            <p className="mt-4 text-2xl font-bold">{summary.remainingPremiumMonths}</p>
            <p className="text-sm text-muted-foreground">Months still available</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Your referral link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="break-all font-mono text-sm text-foreground">{summary.referralLink}</p>
            <p className="mt-2 text-xs text-muted-foreground">Code: {summary.code}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void copyLink()}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button variant="outline" onClick={() => void shareLink()}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
          {summary.bonusExpiresAt ? (
            <p className="text-sm text-muted-foreground">
              Referral entitlement: {summary.bonusTier ?? "standard"} through {formatDate(summary.bonusExpiresAt)}.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
              <p className="font-medium text-foreground">No referrals yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Share your unique link to begin earning Standard time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3 font-medium">Signup date</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Payment date</th>
                    <th className="px-3 py-3 text-right font-medium">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-border/60 last:border-0">
                      <td className="px-3 py-4">{formatDate(referral.created_at)}</td>
                      <td className="px-3 py-4">
                        <Badge variant={referral.payment_status === "completed" ? "default" : "secondary"}>
                          {referral.payment_status === "completed" ? "Paid" : referral.payment_status === "pending" ? "Pending" : "Rejected"}
                        </Badge>
                      </td>
                      <td className="px-3 py-4">{formatDate(referral.paid_at)}</td>
                      <td className="px-3 py-4 text-right font-semibold">
                        {referral.reward_months ? `+${referral.reward_months} Standard month${referral.reward_months === 1 ? "" : "s"}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
