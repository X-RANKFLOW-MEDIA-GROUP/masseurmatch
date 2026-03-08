import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileCompleteness } from "@/hooks/useProfileCompleteness";
import { 
  Camera, MapPin, DollarSign, User, ShieldCheck, CheckCircle2, 
  ArrowRight, Clock, Tag, Plane, Search, Megaphone, AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DashboardOverview = () => {
  const { profile, loading } = useProfile();
  const [photoCount, setPhotoCount] = useState(0);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("profile_photos")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id)
      .then(({ count }) => setPhotoCount(count || 0));
  }, [profile]);

  if (loading) return (
    <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
      <div className="h-10 bg-muted rounded w-2/3" />
      <div className="h-48 bg-muted rounded-xl" />
      <div className="h-32 bg-muted rounded-xl" />
    </div>
  );

  const completeness = getProfileCompleteness(profile, photoCount);
  const nextStep = completeness.steps.find((s) => !s.done);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          👋 Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}!
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {completeness.score === 100
            ? "Your profile is fully set up. You're all set! 🎉"
            : "Let's get your profile ready. Follow the steps below."}
        </p>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-4 flex items-center gap-3 border ${
        profile?.is_active
          ? "border-success/30 bg-success/5"
          : "border-warning/30 bg-warning/5"
      }`}>
        <div className={`w-3 h-3 rounded-full shrink-0 ${profile?.is_active ? "bg-success" : "bg-warning animate-pulse"}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {profile?.is_active ? "Your profile is live!" : "Your profile is not visible yet"}
          </p>
          <p className="text-xs text-muted-foreground">
            {profile?.is_active
              ? "Clients can find you in the directory."
              : completeness.isPublishReady
              ? "Your profile is pending admin approval."
              : `Complete ${completeness.missingRequired.length} required step${completeness.missingRequired.length > 1 ? "s" : ""} to go live.`}
          </p>
        </div>
        {!profile?.is_active && nextStep && (
          <Button asChild size="sm" variant="default">
            <Link to={nextStep.link}>
              Get Started
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        )}
      </div>

      {/* Quality Gate Warning */}
      {!completeness.isPublishReady && completeness.missingRequired.length > 0 && (
        <div className="rounded-xl p-4 flex items-start gap-3 border border-destructive/30 bg-destructive/5">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Required before publication</p>
            <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
              {completeness.missingRequired.map((s) => (
                <li key={s.key}>
                  • <Link to={s.link} className="text-primary hover:underline">{s.label}</Link>
                  {" "}<span className="text-muted-foreground/70">— {s.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Setup Progress */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Profile Completeness</h2>
          <Badge variant="outline" className="text-xs">
            {completeness.score}%
          </Badge>
        </div>
        <Progress value={completeness.score} className="h-2.5 mb-5" />

        <div className="space-y-2">
          {completeness.steps.map((step, i) => (
            <Link
              key={step.key}
              to={step.link}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all group ${
                step.done
                  ? "opacity-60"
                  : nextStep?.key === step.key
                  ? "bg-primary/5 border border-primary/20"
                  : "hover:bg-secondary/50"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                step.done
                  ? "bg-success/10 text-success"
                  : nextStep?.key === step.key
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}>
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${step.done ? "line-through text-muted-foreground" : ""}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">{step.description}</p>
              </div>
              {!step.done && (
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions - only show when profile is mostly set up */}
      {completeness.score >= 40 && (
        <div>
          <h2 className="font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { icon: Clock, title: "Available Now", desc: "Boost visibility", link: "/dashboard/availability" },
              { icon: Tag, title: "Weekly Special", desc: "Create a promo", link: "/dashboard/specials" },
              { icon: Plane, title: "Travel", desc: "Plan a trip", link: "/dashboard/travel" },
              { icon: Search, title: "SEO", desc: "Optimize search", link: "/dashboard/seo" },
              { icon: Megaphone, title: "Promote", desc: "Get featured", link: "/dashboard/promotion" },
              { icon: ShieldCheck, title: "Verify ID", desc: "Build trust", link: "/dashboard/verification" },
            ].map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-foreground/20 hover:bg-secondary/30 transition-all group"
              >
                <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{action.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
