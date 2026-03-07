import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Camera, Flag, Shield, Mail, AlertTriangle } from "lucide-react";

interface Stats {
  totalProfiles: number;
  activeProfiles: number;
  pendingPhotos: number;
  pendingVerifications: number;
  openTickets: number;
  pendingFlags: number;
  suspendedUsers: number;
  bannedUsers: number;
}

const AdminOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const [profiles, photos, verifications, tickets, flags, suspensions] = await Promise.all([
        supabase.from("profiles").select("id, is_active, status", { count: "exact" }),
        supabase.from("profile_photos").select("id", { count: "exact" }).eq("moderation_status", "pending"),
        supabase.from("identity_verifications").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("support_tickets").select("id", { count: "exact" }).eq("status", "open"),
        supabase.from("content_flags").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("user_suspensions").select("id, type", { count: "exact" }).eq("is_active", true),
      ]);

      const profileData = profiles.data || [];
      const suspData = suspensions.data || [];

      setStats({
        totalProfiles: profiles.count || 0,
        activeProfiles: profileData.filter(p => p.is_active).length,
        pendingPhotos: photos.count || 0,
        pendingVerifications: verifications.count || 0,
        openTickets: tickets.count || 0,
        pendingFlags: flags.count || 0,
        suspendedUsers: suspData.filter(s => s.type === "suspended").length,
        bannedUsers: suspData.filter(s => s.type === "banned").length,
      });
    };
    fetch();
  }, []);

  const kpis = stats ? [
    { label: "Total Profiles", value: stats.totalProfiles, icon: Users, color: "text-foreground", link: "/admin/users" },
    { label: "Active", value: stats.activeProfiles, icon: Users, color: "text-success", link: "/admin/users" },
    { label: "Pending Photos", value: stats.pendingPhotos, icon: Camera, color: "text-warning", link: "/admin/moderation" },
    { label: "Pending Verifications", value: stats.pendingVerifications, icon: Shield, color: "text-warning", link: "/admin/moderation" },
    { label: "Open Tickets", value: stats.openTickets, icon: Mail, color: "text-primary", link: "/admin/mailbox" },
    { label: "Pending Flags", value: stats.pendingFlags, icon: Flag, color: "text-destructive", link: "/admin/flags" },
    { label: "Suspended", value: stats.suspendedUsers, icon: AlertTriangle, color: "text-warning", link: "/admin/users" },
    { label: "Banned", value: stats.bannedUsers, icon: AlertTriangle, color: "text-destructive", link: "/admin/users" },
  ] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Dashboard Overview</h1>
      {!stats ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Card
              key={kpi.label}
              className="bg-card border-border cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => navigate(kpi.link)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  {kpi.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
