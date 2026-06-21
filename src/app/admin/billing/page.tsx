"use client";

import { useEffect, useState, useRef } from "react";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, DollarSign, TrendingUp, Users, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StripeData {
  configured: boolean;
  subscriptions: Array<{
    id: string;
    status: string;
    planKey: string;
    customerId: string;
    customerEmail: string | null;
    userId: string | null;
    amount: number;
    currency: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    trialEnd: string | null;
    canceledAt: string | null;
    created: string;
  }>;
  payments: Array<{
    id: string;
    status: string;
    amount: number;
    amountReceived: number;
    currency: string;
    description: string | null;
    created: string;
  }>;
  stats: {
    totalRevenue: number;
    activeSubscriptions: number;
    totalCustomers: number;
    mrr: number;
    availableBalance?: number;
    pendingBalance?: number;
  };
}

function statusColor(status: string) {
  switch (status) {
    case "active":
    case "succeeded":
      return "default" as const;
    case "trialing":
      return "secondary" as const;
    case "canceled":
    case "failed":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export default function AdminBillingPage() {
  const [data, setData] = useState<StripeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadSlow, setLoadSlow] = useState(false);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setLoadSlow(false);
    slowTimerRef.current = setTimeout(() => setLoadSlow(true), 5000);
    try {
      const res = await fetch("/api/admin/stripe");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load billing data.");
    } finally {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setLoading(false);
      setLoadSlow(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {loadSlow ? "Taking longer than expected..." : "Loading Stripe data..."}
          </span>
        </div>
        {loadSlow && (
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry
          </Button>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Billing" description="Revenue, subscriptions, and payment overview." />
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <p className="text-sm text-muted-foreground">
            Could not load billing data: {error}
          </p>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const configured = data?.configured ?? false;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Billing"
        description={configured ? "Live data from Stripe." : "Stripe is not configured. Showing empty placeholders."}
        actions={
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={DollarSign} label="Total Revenue" value={`$${(stats?.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color="text-emerald-600" />
            <StatCard icon={TrendingUp} label="MRR" value={`$${(stats?.mrr ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color="text-blue-600" />
            <StatCard icon={CreditCard} label="Active Subscriptions" value={String(stats?.activeSubscriptions ?? 0)} />
            <StatCard icon={Users} label="Customers" value={String(stats?.totalCustomers ?? 0)} />
          </div>

          {(stats?.availableBalance !== undefined || stats?.pendingBalance !== undefined) && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Available Balance</p>
                <p className="font-display mt-2 text-2xl font-bold text-emerald-600">
                  ${(stats?.availableBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Balance</p>
                <p className="font-display mt-2 text-2xl font-bold text-amber-600">
                  ${(stats?.pendingBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Subscriptions ── */}
        <TabsContent value="subscriptions">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-base">Subscription Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(data?.subscriptions ?? []).map((sub) => (
                      <tr key={sub.id} className="bg-white hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{sub.id.slice(0, 20)}…</td>
                        <td className="px-4 py-3">{sub.customerEmail || "—"}</td>
                        <td className="px-4 py-3 font-medium capitalize">{sub.planKey}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusColor(sub.status)}>{sub.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">${sub.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(sub.created).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {(data?.subscriptions ?? []).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                          No subscriptions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Payments ── */}
        <TabsContent value="payments">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-base">Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(data?.payments ?? []).map((p) => (
                      <tr key={p.id} className="bg-white hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{p.id.slice(0, 20)}…</td>
                        <td className="px-4 py-3">{p.description || "—"}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusColor(p.status)}>{p.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">${p.amountReceived.toFixed(2)}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(p.created).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {(data?.payments ?? []).length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                          No payments yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className={`font-display mt-2 text-3xl font-bold ${color ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}
