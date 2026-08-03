import Link from "next/link";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { AdminGettingStarted } from "@/app/admin/_components/AdminGettingStarted";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  HeartHandshake,
  MapPin,
  ShieldAlert,
  Newspaper,
  Tag,
  ArrowUpRight,
  CalendarCheck,
  MessageSquare,
  DollarSign,
  Grid3X3,
  Workflow,
} from "lucide-react";

async function getAdminStats() {
  const supabase = createSupabaseAdminClient();

  const [therapistsResult, cities, bookingCountResult, smsAlertCountResult] = await Promise.all([
    getPublicTherapists({ page: 1, pageSize: 50 }),
    Promise.resolve(getCities()),
    supabase
      .from("booking_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_approval"),
    supabase
      .from("sms_follow_up_alerts")
      .select("id", { count: "exact", head: true })
      .is("resolved_at", null),
  ]);

  return {
    therapists: therapistsResult.total,
    cities: cities.length,
    recentTherapists: therapistsResult.items.slice(0, 5),
    pendingBookings: bookingCountResult.count ?? 0,
    smsAlerts: smsAlertCountResult.count ?? 0,
  };
}

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const cards = [
    {
      label: "Total Therapists",
      value: String(stats.therapists),
      description: "Active profiles",
      icon: HeartHandshake,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Cities Covered",
      value: String(stats.cities),
      description: "Active locations",
      icon: MapPin,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Booking Approvals",
      value: String(stats.pendingBookings),
      description: "Need your sign-off",
      icon: CalendarCheck,
      color: "text-red-600",
      bgColor: "bg-red-50",
      href: "/admin/bookings",
    },
    {
      label: "SMS Alerts",
      value: String(stats.smsAlerts),
      description: "Unanswered 90+ min",
      icon: MessageSquare,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      href: "/admin/sms",
    },
    {
      label: "Moderation",
      value: "—",
      description: "Review queued listings",
      icon: ShieldAlert,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      href: "/admin/moderation",
    },
    {
      label: "Revenue",
      value: "—",
      description: "Open billing operations",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      href: "/admin/billing",
    },
  ];

  const quickLinks = [
    { href: "/admin/tools", label: "All Admin Tools", description: "See every admin page and background capability in one map.", icon: Grid3X3 },
    { href: "/admin/bookings", label: "Booking Approvals", description: `${stats.pendingBookings} inquiry${stats.pendingBookings !== 1 ? "ies" : "y"} waiting for your sign-off.`, icon: CalendarCheck },
    { href: "/admin/sms", label: "SMS Auto-Reply", description: `${stats.smsAlerts} alert${stats.smsAlerts !== 1 ? "s" : ""} — conversations with no reply in 90+ min.`, icon: MessageSquare },
    { href: "/admin/therapists", label: "Therapists", description: "Approve, suspend, verify, and feature provider profiles.", icon: HeartHandshake },
    { href: "/admin/users", label: "Users", description: "Manage provider and admin roles.", icon: Users },
    { href: "/admin/migrations", label: "Imports", description: "Review profile migrations and imported reviews.", icon: Workflow },
    { href: "/admin/moderation", label: "Moderation", description: "Review queued listing drafts and flagged content.", icon: ShieldAlert },
    { href: "/admin/cities", label: "Cities", description: "Edit local landing-page copy and city coverage.", icon: MapPin },
    { href: "/admin/keywords", label: "Keywords", description: "Manage specialty and SEO keyword surfaces.", icon: Tag },
    { href: "/admin/blog", label: "Blog", description: "Publish and maintain editorial content.", icon: Newspaper },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Dashboard" description="Choose a workflow, review urgent work, or open the complete admin tools map." />

      <AdminGettingStarted />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => {
          const inner = (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="font-display mt-3 text-3xl font-bold text-foreground">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
            </>
          );
          const cls = "rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md";
          return "href" in card && card.href ? (
            <Link key={card.label} href={card.href} className={`${cls} block`}>
              {inner}
            </Link>
          ) : (
            <div key={card.label} className={cls}>
              {inner}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-white shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-base">Recent Therapist Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentTherapists.map((therapist) => (
                <div key={therapist.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-none last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{therapist.display_name || therapist.full_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {therapist.city || "No city"} • {therapist.specialties?.[0] || "General"}
                    </p>
                  </div>
                  <Badge variant={therapist.status === "active" ? "default" : "secondary"}>
                    {therapist.status || "pending"}
                  </Badge>
                </div>
              ))}
              {stats.recentTherapists.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No therapist activity yet.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <link.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{link.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{link.description}</p>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
