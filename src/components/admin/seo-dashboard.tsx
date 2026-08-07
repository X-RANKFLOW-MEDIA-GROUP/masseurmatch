"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import type { ProfileViewModel } from "@/components/profile/profile-utils";
import { calculateProfileSeoCompleteness, getProfileIndexEligibility } from "@/lib/profile-seo-completeness";

interface SeoDashboardProps {
  profiles: ProfileViewModel[];
}

export function SeoDashboard({ profiles }: SeoDashboardProps) {
  const totalProfiles = profiles.length;
  const verifiedProfiles = profiles.filter((p) => p.isVerified).length;
  const indexableProfiles = profiles.filter((p) => getProfileIndexEligibility(p).eligible).length;
  const excellentProfiles = profiles.filter((p) => calculateProfileSeoCompleteness(p).level === "excellent").length;

  const scores = profiles.map((p) => calculateProfileSeoCompleteness(p).score);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
  const percentageOfTotal = (value: number) => totalProfiles > 0 ? (value / totalProfiles) * 100 : 0;

  const lowestScoring = profiles
    .map((p) => ({ name: p.name, slug: p.slug, score: calculateProfileSeoCompleteness(p).score }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Metrics below include public directory profiles only. People CRM includes all profile and account records.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Public Profiles" value={totalProfiles} subtext={`${verifiedProfiles} verified`} icon={<CheckCircle className="h-5 w-5" />} />
        <MetricCard title="Indexable" value={indexableProfiles} percentage={percentageOfTotal(indexableProfiles)} icon={<TrendingUp className="h-5 w-5" />} />
        <MetricCard title="Excellent" value={excellentProfiles} percentage={percentageOfTotal(excellentProfiles)} icon={<CheckCircle className="h-5 w-5" />} />
        <MetricCard title="Avg SEO Score" value={avgScore} maxValue={100} icon={<AlertCircle className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Profiles Needing Improvement</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lowestScoring.length > 0 ? lowestScoring.map((profile) => (
              <div key={profile.slug} className="flex items-center justify-between rounded-lg bg-red-50 p-3">
                <div><p className="font-medium text-gray-900">{profile.name}</p><p className="text-sm text-gray-500">Score: {profile.score}/100</p></div>
                <Badge variant="outline" className={profile.score < 50 ? "border-red-300 bg-red-100 text-red-800" : "border-yellow-300 bg-yellow-100 text-yellow-800"}>
                  {profile.score < 50 ? "Critical" : "Warning"}
                </Badge>
              </div>
            )) : <p className="py-4 text-center text-gray-500">All profiles are in good shape!</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Score Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { label: "Excellent (85-100)", test: (score: number) => score >= 85, color: "bg-green-500" },
              { label: "Good (70-84)", test: (score: number) => score >= 70 && score < 85, color: "bg-blue-500" },
              { label: "Basic (50-69)", test: (score: number) => score >= 50 && score < 70, color: "bg-yellow-500" },
              { label: "Poor (<50)", test: (score: number) => score < 50, color: "bg-red-500" },
            ].map(({ label, test, color }) => {
              const count = scores.filter(test).length;
              const percentage = percentageOfTotal(count);
              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-sm"><span className="font-medium">{label}</span><span className="text-gray-600">{count} ({Math.round(percentage)}%)</span></div>
                  <div className="h-2 w-full rounded-full bg-gray-200"><div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }} /></div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  subtext?: string;
  percentage?: number;
  maxValue?: number;
  icon: React.ReactNode;
}

function MetricCard({ title, value, subtext, percentage, maxValue, icon }: MetricCardProps) {
  return (
    <Card><CardContent className="pt-6"><div className="space-y-2">
      <div className="flex items-center justify-between"><p className="text-sm text-gray-600">{title}</p><div className="text-gray-400">{icon}</div></div>
      <div className="flex items-baseline gap-1"><span className="text-3xl font-bold">{value}</span>{maxValue && <span className="text-sm text-gray-400">/ {maxValue}</span>}</div>
      {percentage !== undefined && <p className="text-xs font-medium text-green-600">{Math.round(percentage)}%</p>}
      {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
    </div></CardContent></Card>
  );
}
