"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  HeartHandshake,
  MapPin,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  Newspaper,
  Tag,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

type RecentTherapist = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  city: string | null;
  specialties: string[] | null;
  status: string | null;
};

type AdminStats = {
  therapists: number;
  mrr: number;
  cities: number;
  pendingReviews: number;
  recentTherapists: RecentTherapist[];
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load stats");
        return res.json();
      })
      .then((data) => setStats(data))
      .catch((err) => setError(err.message));
  }, []);

  const quickLinks = [
    { href: "/admin/therapists", label: "Therapists", description: "Approve, suspend, verify, and feature provider profiles.", icon: HeartHandshake },
    { href: "/admin/users", label: "Users", description: "Manage provider and admin roles.", icon: Users },
    { href: "/admin/moderation", label: "Moderation", description: "Review queued listing drafts flagged by Sightengine.", icon: ShieldAlert },
    { href: "/admin/reviews", label: "Reviews", description: "Review imported reviews and moderation status.", icon: ShieldCheck },
    { href: "/admin/cities", label: "Cities", description: "Edit local landing page copy and city coverage.", icon: MapPin },
    { href: "/admin/keywords", label: "Keywords", description: "Manage specialty and SEO keyword surfaces.", icon: Tag },
    { href: "/admin/blog", label: "Blog", description: "Publish and maintain editorial content.", icon: Newspaper },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Dashboard" description="Admin overview — monitor platform health at a glance." />
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Dashboard could not be loaded: {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Dashboard" description="Admin overview — monitor platform health at a glance." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

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
      label: "Monthly Revenue",
      value: `$${stats.mrr.toLocaleString()}`,
      description: "Estimated MRR",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
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
      label: "Pending Reviews",
      value: String(stats.pendingReviews),
      description: "Awaiting moderation",
      icon: ShieldCheck,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Dashboard" description="Admin overview — monitor platform health at a glance." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="font-display mt-3 text-3xl font-bold text-foreground">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-base">Recent Therapist Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentTherapists.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-none last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.display_name || t.full_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.city || "No city"} • {t.specialties?.[0] || "General"}
                    </p>
                  </div>
                  <Badge variant={t.status === "active" ? "default" : "secondary"}>
                    {t.status || "pending"}
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
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <link.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{link.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{link.description}</p>
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
