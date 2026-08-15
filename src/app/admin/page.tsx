import Link from "next/link";
import { getCities } from "@/app/_lib/directory";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
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
  BadgeCheck,
  LifeBuoy,
} from "lucide-react";

const REVIEW_STATUSES = ["under_review", "pending", "pending_review", "pending_approval"];

async function getAdminStats() {
  const supabase = createSupabaseAdminClient();
  const db = supabase as any;
  const [
    profilesResult,
    reviewResult,
    moderationResult,
    identityResult,
    supportResult,
    recentResult,
    cities,
  ] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "provider"),
    db.from("profiles").select("id", { count: "exact", head: true }).in("profile_status", REVIEW_STATUSES),
    db.from("moderation_queue").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("identity_verifications").select("id", { count: "exact", head: true }).in("status", ["pending", "requires_input"]),
    db.from("support_tickets").select("id", { count: "exact", head: true }).in("status", ["open", "pending", "in_progress"]),
    db
      .from("profiles")
      .select("id,display_name,full_name,city,specialties,profile_status,visibility_status,updated_at")
      .eq("role", "provider")
      .order("updated_at", { ascending: false })
      .limit(8),
    Promise.resolve(getCities()),
  ]);

  return {
    therapists: profilesResult.count ?? 0,
    cities: cities.length,
    needsReview: reviewResult.count ?? 0,
    moderationPending: moderationResult.count ?? 0,
    identityAttention: identityResult.count ?? 0,
    supportOpen: supportResult.count ?? 0,
    recentTherapists: recentResult.data ?? [],
  };
}

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const cards = [
    {
      label: "Total Therapists",
      value: String(stats.therapists),
      description: "Provider profiles in Supabase",
      icon: HeartHandshake,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/admin/people",
    },
    {
      label: "Needs Review",
      value: String(stats.needsReview),
      description: "Under review or pending",
      icon: ShieldAlert,
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      href: "/admin/people",
    },
    {
      label: "Photo Moderation",
      value: String(stats.moderationPending),
      description: "Pending moderation items",
      icon: ShieldAlert,
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      href: "/admin/moderation",
    },
    {
      label: "Identity Attention",
      value: String(stats.identityAttention),
      description: "Pending or requires input",
      icon: BadgeCheck,
      color: "text-indigo-700",
      bgColor: "bg-indigo-50",
      href: "/admin/people",
    },
    {
      label: "Support Open",
      value: String(stats.supportOpen),
      description: "Open or in progress tickets",
      icon: LifeBuoy,
      color: "text-violet-700",
      bgColor: "bg-violet-50",
    },
    {
      label: "Cities Covered",
      value: String(stats.cities),
      description: "Directory city definitions",
      icon: MapPin,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/admin/cities",
    },
  ];

  const quickLinks = [
    { href: "/admin/people", label: "People CRM", description: `${stats.needsReview} profile${stats.needsReview === 1 ? "" : "s"} currently need review.`, icon: HeartHandshake },
    { href: "/admin/moderation", label: "Moderation", description: `${stats.moderationPending} moderation item${stats.moderationPending === 1 ? "" : "s"} pending.`, icon: ShieldAlert },
    { href: "/admin/users", label: "Users", description: "Manage provider and admin roles.", icon: Users },
    { href: "/admin/cities", label: "Cities", description: "Edit local landing page copy and city coverage.", icon: MapPin },
    { href: "/admin/keywords", label: "Keywords", description: "Manage specialty and SEO keyword surfaces.", icon: Tag },
    { href: "/admin/blog", label: "Blog", description: "Publish and maintain editorial content.", icon: Newspaper },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Dashboard" description="Admin overview grounded in the current production database." />

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
          return card.href ? (
            <Link key={card.label} href={card.href} className={`${cls} block`}>
              {inner}
            </Link>
          ) : (
            <div key={card.label} className={cls}>{inner}</div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-base">Recent Therapist Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentTherapists.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-none last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{t.display_name || t.full_name || "Unknown"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.city || "No city"} · {t.specialties?.[0] || "General"} · {t.visibility_status || "unknown visibility"}
                    </p>
                  </div>
                  <Badge variant={t.profile_status === "approved" ? "default" : "secondary"}>
                    {t.profile_status || "draft"}
                  </Badge>
                </div>
              ))}
              {stats.recentTherapists.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">No therapist activity yet.</p>
              )}
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
                <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary/50">
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
