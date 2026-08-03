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

  const lowestScoring = profiles
    .map((p) => ({
      name: p.name,
      slug: p.slug,
      score: calculateProfileSeoCompleteness(p).score,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Profiles"
          value={totalProfiles}
          subtext={`${verifiedProfiles} verified`}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <MetricCard
          title="Indexable"
          value={indexableProfiles}
          percentage={(indexableProfiles / totalProfiles) * 100}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard
          title="Excellent"
          value={excellentProfiles}
          percentage={(excellentProfiles / totalProfiles) * 100}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <MetricCard
          title="Avg SEO Score"
          value={avgScore}
          maxValue={100}
          icon={<AlertCircle className="w-5 h-5" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profiles Needing Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lowestScoring.length > 0 ? (
              lowestScoring.map((profile) => (
                <div key={profile.slug} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{profile.name}</p>
                    <p className="text-sm text-gray-500">Score: {profile.score}/100</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      profile.score < 50
                        ? "bg-red-100 text-red-800 border-red-300"
                        : "bg-yellow-100 text-yellow-800 border-yellow-300"
                    }`}
                  >
                    {profile.score < 50 ? "Critical" : "Warning"}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">All profiles are in good shape!</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { label: "Excellent (85-100)", min: 85, color: "bg-green-500" },
              { label: "Good (70-84)", min: 70, color: "bg-blue-500" },
              { label: "Basic (50-69)", min: 50, color: "bg-yellow-500" },
              { label: "Poor (<50)", min: 0, color: "bg-red-500" },
            ].map(({ label, min, color }) => {
              const count = scores.filter((s) => (min === 0 ? s < 50 : s >= min && s < min + 15)).length;
              const percentage = totalProfiles > 0 ? (count / totalProfiles) * 100 : 0;
              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="text-gray-600">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
                  </div>
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

function MetricCard({
  title,
  value,
  subtext,
  percentage,
  maxValue,
  icon,
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{title}</p>
            <div className="text-gray-400">{icon}</div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{value}</span>
            {maxValue && <span className="text-gray-400 text-sm">/ {maxValue}</span>}
          </div>
          {percentage !== undefined && (
            <p className="text-xs text-green-600 font-medium">{Math.round(percentage)}%</p>
          )}
          {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
