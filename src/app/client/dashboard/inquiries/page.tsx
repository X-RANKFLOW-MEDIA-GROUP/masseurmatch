"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { MessageSquare, Clock, CheckCircle2, Archive, Search, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ClientDashboardLayout } from "../_components/ClientDashboardLayout";

type Inquiry = {
  id: string;
  profile_id: string | null;
  message: string | null;
  status: string | null;
  created_at: string;
  therapist?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    state: string | null;
  } | null;
};

export default function ClientInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    async function fetchInquiries() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          setInquiries([]);
          return;
        }

        const { data, error } = await supabase
          .from("contact_inquiries")
          .select(`
            id,
            profile_id,
            message,
            status,
            created_at,
            therapist:profiles!profile_id (
              id,
              display_name,
              avatar_url,
              state
            )
          `)
          .eq("client_email", user.email)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setInquiries(data as unknown as Inquiry[]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchInquiries();
  }, [supabase]);

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch = inquiry.therapist?.display_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase()) ?? false;
    const matchesTab = activeTab === "all" || inquiry.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const statusConfig = {
    new: { label: "Sent", icon: MessageSquare, color: "bg-blue-100 text-blue-700" },
    viewed: { label: "Viewed", icon: Clock, color: "bg-amber-100 text-amber-700" },
    responded: { label: "Responded", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
    archived: { label: "Archived", icon: Archive, color: "bg-slate-100 text-slate-600" },
  };

  const counts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === "new").length,
    viewed: inquiries.filter((i) => i.status === "viewed").length,
    responded: inquiries.filter((i) => i.status === "responded").length,
  };

  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">My Inquiries</h1>
          <p className="mt-1 text-slate-500">Track all your messages to therapists</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="new">Sent ({counts.new})</TabsTrigger>
              <TabsTrigger value="viewed">Viewed ({counts.viewed})</TabsTrigger>
              <TabsTrigger value="responded">Responded ({counts.responded})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search therapists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : filteredInquiries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-slate-300" />
              <h3 className="mt-4 font-medium text-slate-900">No inquiries found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchQuery ? "Try a different search term" : "Start by contacting a therapist"}
              </p>
              <Button asChild className="mt-4">
                <Link href="/explore">Find Therapists</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredInquiries.map((inquiry) => {
              const config = statusConfig[(inquiry.status ?? 'new') as keyof typeof statusConfig] ?? statusConfig.new;
              const StatusIcon = config.icon;

              return (
                <Card key={inquiry.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
                      {inquiry.therapist?.avatar_url ? (
                        <img
                          src={inquiry.therapist.avatar_url}
                          alt={inquiry.therapist.display_name ?? undefined}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-slate-900">
                            {inquiry.therapist?.display_name ?? "Unknown Therapist"}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {inquiry.therapist?.state}
                          </p>
                        </div>
                        <Badge className={config.color}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {config.label}
                        </Badge>
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                        {inquiry.message}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                        </span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/therapists/${inquiry.therapist?.id ?? inquiry.profile_id ?? ''}`}>
                            View Profile <ExternalLink className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ClientDashboardLayout>
  );
}
