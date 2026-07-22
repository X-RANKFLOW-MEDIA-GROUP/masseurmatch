import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import KeywordTrendsDashboard from "@/components/dashboards/KeywordTrendsDashboard";

export const metadata = {
  title: "Keyword Trends — Admin Dashboard",
  description: "Google Trends monitoring for massage therapy keywords.",
};

async function checkAdminAccess() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check if user is admin (you can customize this based on your user roles)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Allow if admin role exists, or if it's your account
  const isAdmin = profile?.role === "admin" || user.email?.endsWith("@masseurmatch.com");

  if (!isAdmin) {
    redirect("/pro/dashboard");
  }

  return { userId: user.id };
}

export default async function KeywordTrendsAdminPage() {
  await checkAdminAccess();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <BarChart3 className="h-5 w-5 text-accent" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">Google Trends Monitor</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time keyword trend analysis for massage therapy services
            </p>
          </div>
        </div>
      </div>

      {/* Full Dashboard */}
      <KeywordTrendsDashboard compact={false} />

      {/* Setup Instructions */}
      <div className="rounded-2xl border border-border bg-card p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4">Setup Instructions</h2>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground mb-2">1. Data Collection</p>
            <p>
              Data is collected daily at 2 AM via Make.com automation scenario.
              Python script fetches trends from Google Trends and stores in Supabase.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-2">2. Keyword List</p>
            <p>
              Currently tracking 50 massage therapy keywords. Keywords can be updated
              in the Make.com scenario or Python script.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-2">3. Alerts</p>
            <p>
              High-priority alerts are sent when keywords spike above 90 points or
              grow &gt;30% week-over-week. Alerts are visible in the "Recent Insights" section.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-2">4. Content Integration</p>
            <p>
              Use the insights to guide content strategy. When a keyword peaks,
              create blog posts or update existing content to capture traffic.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">Data Source</p>
          <p className="text-lg font-semibold mt-1">Google Trends API</p>
          <p className="text-xs text-muted-foreground mt-2">Via pytrends</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">Update Frequency</p>
          <p className="text-lg font-semibold mt-1">Daily @ 2 AM UTC</p>
          <p className="text-xs text-muted-foreground mt-2">Via Make.com</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">Storage</p>
          <p className="text-lg font-semibold mt-1">Supabase PostgreSQL</p>
          <p className="text-xs text-muted-foreground mt-2">6+ month retention</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">Alert Threshold</p>
          <p className="text-lg font-semibold mt-1">Score &gt; 90 or +30% WoW</p>
          <p className="text-xs text-muted-foreground mt-2">High priority only</p>
        </div>
      </div>
    </div>
  );
}
