"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Users, ShieldCheck, Eye, MousePointer, Phone, TrendingUp } from "lucide-react";

interface ReportsData {
  profiles: { total: number; active: number; verified: number };
  identityVerifications: { pending: number; completed: number };
  topTherapists: Array<{
    therapistId: string;
    impressions: number;
    profileClicks: number;
    contactClicks: number;
    ctr: number;
    contactRate: number;
    weightedScore: number;
  }>;
  events: Record<string, number>;
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/reports");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message ?? "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading reports…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Reports" description="Analytics and performance reports." />
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Could not load reports: {error}
        </div>
      </div>
    );
  }

  const totalEvents = Object.values(data?.events ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reports & Analytics"
        description="Platform performance, user analytics, and Knotty learning insights."
        actions={
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      {/* Profile Stats */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Users} label="Total Profiles" value={data?.profiles.total ?? 0} />
        <StatCard icon={Users} label="Active Profiles" value={data?.profiles.active ?? 0} color="text-emerald-600" />
        <StatCard icon={ShieldCheck} label="ID Verified" value={data?.profiles.verified ?? 0} color="text-blue-600" />
        <StatCard icon={ShieldCheck} label="Pending ID" value={data?.identityVerifications.pending ?? 0} color="text-amber-600" />
        <StatCard icon={ShieldCheck} label="Completed ID" value={data?.identityVerifications.completed ?? 0} color="text-emerald-600" />
        <StatCard icon={Eye} label="Total Events" value={totalEvents} color="text-purple-600" />
      </div>

      {/* Event Breakdown */}
      <Card className="border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-base">Event Breakdown (Knotty Learning Engine)</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(data?.events ?? {}).length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No ranking events recorded yet. Events will appear as users interact with the platform.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {Object.entries(data?.events ?? {})
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => (
                  <div key={name} className="rounded-xl border border-border p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                      {name.replace(/_/g, " ")}
                    </p>
                    <p className="font-display mt-1 text-2xl font-bold text-foreground">{count.toLocaleString()}</p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performing Therapists */}
      <Card className="border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-base">Top Performing Therapists (by Weighted Score)</CardTitle>
        </CardHeader>
        <CardContent>
          {(data?.topTherapists ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No learning score data yet. The Knotty engine aggregates data over time.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Therapist ID</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Impressions</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profile Clicks</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Clicks</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">CTR</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(data?.topTherapists ?? []).map((t, i) => (
                    <tr key={t.therapistId} className="bg-white hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{i + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs">{t.therapistId.slice(0, 12)}…</td>
                      <td className="px-4 py-3 text-right">{t.impressions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{t.profileClicks.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{t.contactClicks.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono">{(t.ctr * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right font-mono">{(t.contactRate * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="default">{t.weightedScore.toFixed(2)}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className={`font-display mt-1.5 text-2xl font-bold ${color ?? "text-foreground"}`}>{value.toLocaleString()}</p>
    </div>
  );
}
