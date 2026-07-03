import { redirect } from "next/navigation";
import { Lock, TrendingUp, MapPin, Clock, BarChart3, AlertCircle, Zap } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { LockedPreview } from "./_components/LockedPreview";
import { DemandSpikes } from "./_components/DemandSpikes";
import { SearchTrends } from "./_components/SearchTrends";
import { PopularZipCodes } from "./_components/PopularZipCodes";
import { PeakTimes } from "./_components/PeakTimes";
import { BoostRecommendations } from "./_components/BoostRecommendations";
import { ProfileImprovements } from "./_components/ProfileImprovements";
import { CityDemandScore } from "./_components/CityDemandScore";
import { HotelOpportunities } from "./_components/HotelOpportunities";
import KeywordTrendsDashboard from "@/components/dashboards/KeywordTrendsDashboard";

export const metadata = {
  title: "Market Intelligence — MasseurMatch Pro",
  description: "Demand trends, search insights, and recommendations to grow your practice.",
};

async function getUserSubscription() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, id")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    tier: (profile?.subscription_tier as string) || "free",
  };
}

export default async function MarketIntelligencePage() {
  const { userId, tier } = await getUserSubscription();
  const isPaid = tier !== "free";

  // Free users see locked preview
  if (!isPaid) {
    return <LockedPreview />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <BarChart3 className="h-5 w-5 text-accent" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-semibold">Market Intelligence</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          Real-time demand trends, search patterns, and actionable recommendations to grow your practice.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DemandSpikes />
        <SearchTrends />
        <PopularZipCodes />
        <PeakTimes />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CityDemandScore />
        <HotelOpportunities />
      </div>

      {/* Google Trends Keyword Monitor */}
      <div className="border-t border-border pt-8">
        <KeywordTrendsDashboard compact={false} />
      </div>

      {/* Recommendations */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BoostRecommendations />
        <ProfileImprovements />
      </div>
    </div>
  );
}
