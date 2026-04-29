"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuditEntry {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: any;
  created_at: string;
}

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  admin_note: string | null;
  created_at: string;
}

export default function AdminSupportPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/logs");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setLogs(json.logs ?? []);
      const ticketsRes = await fetch("/api/admin/tickets");
      const ticketsJson = await ticketsRes.json();
      setTickets(ticketsJson.tickets ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load support data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const suspensions = logs.filter((l) => l.action.includes("suspend") || l.action.includes("ban"));
  const profileEdits = logs.filter((l) => l.target_type === "profile" || l.action.includes("approve") || l.action.includes("reject"));
  const photoActions = logs.filter((l) => l.target_type === "profile_photo" || l.action.includes("photo"));
  const allSupport = [...suspensions, ...profileEdits, ...photoActions];
  const uniqueSupport = Array.from(new Map(allSupport.map((l) => [l.id, l])).values());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading support data…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Support" description="Manage support tickets and profile edit requests." />
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Could not load support data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Support"
        description={`${uniqueSupport.length} support-related actions · ${tickets.length} tickets · ${photoActions.length} photo actions`}
        actions={
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Support ({uniqueSupport.length})</TabsTrigger>
          <TabsTrigger value="suspensions">Suspensions ({suspensions.length})</TabsTrigger>
          <TabsTrigger value="profiles">Profile Edits ({profileEdits.length})</TabsTrigger>
          <TabsTrigger value="photos">Photo Actions ({photoActions.length})</TabsTrigger>
          <TabsTrigger value="tickets">Tickets ({tickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <SupportTable entries={uniqueSupport.length > 0 ? uniqueSupport : logs.slice(0, 50)} />
        </TabsContent>
        <TabsContent value="suspensions">
          <SupportTable entries={suspensions} />
        </TabsContent>
        <TabsContent value="profiles">
          <SupportTable entries={profileEdits} />
        </TabsContent>
        <TabsContent value="photos">
          <SupportTable entries={photoActions} />
        </TabsContent>
        <TabsContent value="tickets">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-base">Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{ticket.subject}</p>
                      <Badge variant="secondary">{ticket.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{ticket.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Priority: {ticket.priority}</p>
                  </div>
                ))}
                {tickets.length === 0 ? <p className="text-sm text-muted-foreground">No tickets found.</p> : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SupportTable({ entries }: { entries: AuditEntry[] }) {
  return (
    <Card className="border-border bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="font-display text-base">Support Requests &amp; Profile Edits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((entry) => (
                <tr key={entry.id} className="bg-white hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        entry.action.includes("approve") || entry.action.includes("verify")
                          ? "default"
                          : entry.action.includes("reject") || entry.action.includes("suspend") || entry.action.includes("ban")
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {entry.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{entry.target_type}</td>
                  <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]">{entry.target_id || "—"}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">
                    {entry.details ? JSON.stringify(entry.details).slice(0, 80) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No support-related actions found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
