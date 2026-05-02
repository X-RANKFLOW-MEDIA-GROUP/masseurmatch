"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface AuditEntry {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: any;
  created_at: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
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
    } catch (err: any) {
      setError(err.message ?? "Failed to load logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading audit logs…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="System Logs" description="Audit trail and system event entries." />
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Could not load logs: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="System Logs"
        description={`${logs.length} audit entries`}
        actions={
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <Card className="border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-base">Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="bg-white hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <Badge variant={actionVariant(log.action)}>{log.action}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{log.target_type}</td>
                    <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]">{log.target_id || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]">{log.admin_user_id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">
                      {log.details ? JSON.stringify(log.details).slice(0, 80) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      No audit log entries yet. Actions taken in the admin panel will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function actionVariant(action: string) {
  if (action.includes("approve") || action.includes("activate") || action.includes("verify")) return "default" as const;
  if (action.includes("reject") || action.includes("suspend") || action.includes("ban") || action.includes("delete")) return "destructive" as const;
  return "secondary" as const;
}
