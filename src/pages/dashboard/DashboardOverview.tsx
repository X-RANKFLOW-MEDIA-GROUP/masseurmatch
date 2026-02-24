import { useProfile } from "@/hooks/useProfile";
import { Eye, MessageSquare, TrendingUp, MousePointerClick, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const DashboardOverview = () => {
  const { profile, loading } = useProfile();

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3" /><div className="h-40 bg-muted rounded" /></div>;

  const completeness = calculateCompleteness(profile);

  const stats = [
    { icon: Eye, label: "Profile Views", value: "—", desc: "total" },
    { icon: MousePointerClick, label: "Contact Clicks", value: "—", desc: "total" },
    { icon: TrendingUp, label: "Search Appearances", value: "—", desc: "this week" },
    { icon: MessageSquare, label: "Peak Activity", value: "—", desc: "best time" },
  ];

  const checklist = [
    { label: "Profile completed", done: !!profile?.bio && !!profile?.display_name },
    { label: "Identity verified", done: !!profile?.is_verified_identity },
    { label: "Photos approved", done: !!profile?.is_verified_photos },
    { label: "Location configured", done: !!profile?.city },
    { label: "Pricing set", done: !!profile?.incall_price || !!profile?.outcall_price },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Masseur Dashboard</p>
        <h1 className="text-3xl font-bold">
          Welcome, {profile?.display_name || profile?.full_name || "Professional"}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          {profile?.is_active ? (
            <Badge variant="outline" className="text-xs border-success/40 text-success">Profile Active</Badge>
          ) : (
            <Badge variant="outline" className="text-xs border-warning/40 text-warning">Profile Inactive</Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {profile?.is_active
              ? "Your profile is visible in the directory."
              : "Complete the requirements to activate your profile."}
          </span>
        </div>
      </div>

      {/* Profile Completeness */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Profile Completeness</h3>
          <span className="text-sm font-bold">{completeness}%</span>
        </div>
        <Progress value={completeness} className="h-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              )}
              <span className={item.done ? "text-muted-foreground" : "text-foreground"}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-background p-5">
            <stat.icon className="w-4 h-4 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-lg overflow-hidden">
        {[
          { title: "Edit Profile", desc: "Update bio, specialties and certifications", link: "/dashboard/profile" },
          { title: "Manage Photos", desc: "Add and organize your professional photos", link: "/dashboard/photos" },
          { title: "Subscription", desc: "View your plan and upgrade", link: "/dashboard/subscription" },
        ].map((action) => (
          <Link key={action.title} to={action.link} className="block bg-background p-6 hover:bg-card transition-colors group glow-hover">
            <h3 className="font-semibold mb-1 text-sm">{action.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{action.desc}</p>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors inline-flex items-center gap-1 uppercase tracking-widest">
              Open <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

function calculateCompleteness(profile: any) {
  if (!profile) return 0;
  const fields = [
    !!profile.display_name,
    !!profile.bio,
    !!profile.city,
    !!profile.phone,
    !!profile.specialties?.length,
    !!profile.incall_price || !!profile.outcall_price,
    !!profile.is_verified_identity,
    !!profile.is_verified_photos,
    !!profile.languages?.length,
    !!profile.certifications?.length,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export default DashboardOverview;