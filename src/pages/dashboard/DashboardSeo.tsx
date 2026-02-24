import { useProfile } from "@/hooks/useProfile";
import { Search, TrendingUp, BarChart3, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DashboardSeo = () => {
  const { profile, loading } = useProfile();

  if (loading) return <div className="animate-pulse h-40 bg-muted rounded" />;

  const suggestions = [
    { text: "Add a bio with at least 100 characters", done: (profile?.bio?.length || 0) >= 100 },
    { text: "Set at least 3 specialties", done: (profile?.specialties?.length || 0) >= 3 },
    { text: "Add your certifications", done: (profile?.certifications?.length || 0) > 0 },
    { text: "Fill in city and state", done: !!profile?.city && !!profile?.state },
    { text: "Add an approved profile photo", done: !!profile?.is_verified_photos },
    { text: "Add a presentation video", done: !!profile?.presentation_video_url },
  ];

  const score = Math.round((suggestions.filter((s) => s.done).length / suggestions.length) * 100);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assisted SEO</h1>
        <p className="text-sm text-muted-foreground">Optimize your profile to rank better in searches</p>
      </div>

      {/* SEO Score */}
      <div className="glass-card p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold">{score}</span>
        </div>
        <div>
          <h2 className="font-semibold">SEO Score</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {score >= 80 ? "Excellent! Your profile is well optimized." : score >= 50 ? "Good, but there's room for improvement." : "Needs attention. Complete the items below."}
          </p>
        </div>
      </div>

      {/* Suggestions */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Lightbulb className="w-4 h-4" /> Improvement Suggestions
        </h2>
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div key={s.text} className="flex items-center gap-3 text-sm">
              <div className={`w-2 h-2 rounded-full shrink-0 ${s.done ? "bg-success" : "bg-warning"}`} />
              <span className={s.done ? "text-muted-foreground line-through" : "text-foreground"}>{s.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats placeholder */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Search Metrics
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Average Position</p>
            <p className="text-2xl font-bold mt-1">—</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Competitiveness</p>
            <p className="text-2xl font-bold mt-1">—</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Search data will be available after your profile has been active for 7 days.</p>
      </section>
    </div>
  );
};

export default DashboardSeo;