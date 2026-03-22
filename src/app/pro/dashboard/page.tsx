"use client";

import { ProviderGrowthQuickPicks } from "@/app/_components/provider-growth-marketplace";
import { ProTools } from "@/app/_components/pro-tools";
import { DashboardFAQ } from "@/components/dashboard/DashboardFAQ";
import { PhotoGuidelines } from "@/components/dashboard/PhotoGuidelines";
import { useProfile } from "@/hooks/useProfile";
import { getProfileCompleteness } from "@/hooks/useProfileCompleteness";

export default function ProDashboardPage() {
  const { profile } = useProfile();
  const completeness = getProfileCompleteness(profile, 0);

  const cards = [
    { label: "Completeness", value: `${completeness.score}%` },
    { label: "Status", value: profile?.status || "Draft" },
    { label: "Views", value: String((profile as any)?.profile_views || 0) },
    { label: "Reviews", value: String((profile as any)?.review_count || 0) },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="space-y-8">
        <ProTools
          stats={cards}
          isPublishReady={completeness.isPublishReady}
          missing={completeness.missingRequired.map((item) => ({
            key: item.key,
            label: item.label,
            link: item.link,
          }))}
        />

        <ProviderGrowthQuickPicks />

        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)]">
          <div className="space-y-6">
            <PhotoGuidelines />
          </div>

          <DashboardFAQ />
        </div>
      </div>
    </div>
  );
}
