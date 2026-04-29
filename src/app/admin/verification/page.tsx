"use client";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IdentityVerification {
  id: string;
  user_id: string;
  status: string;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
}

interface TextVerification {
  id: string;
  user_id: string;
  phone: string;
  status: string;
  attempt_count: number;
  verified_at: string | null;
  created_at: string;
}

export default function AdminVerificationPage() {
  const [identity, setIdentity] = useState<IdentityVerification[]>([]);
  const [text, setText] = useState<TextVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/verification");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setIdentity(json.identity ?? []);
      setText(json.text ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load verifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const statusColor = (status: string) => {
    if (status === "verified") return "default";
    if (status === "pending" || status === "processing") return "secondary";
    if (status === "failed" || status === "rejected") return "destructive";
    return "outline";
  };

  const statusIcon = (status: string) => {
    if (status === "verified") return <CheckCircle2 className="h-4 w-4" />;
    if (status === "pending" || status === "processing") return <Clock className="h-4 w-4" />;
    if (status === "failed" || status === "rejected") return <XCircle className="h-4 w-4" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Verification"
        description="Manage identity and text verifications."
      />

      <Tabs defaultValue="identity">
        <TabsList className="mb-4">
          <TabsTrigger value="identity">Identity ({identity.length})</TabsTrigger>
          <TabsTrigger value="text">Text ({text.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="identity">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-base">Identity Verifications</CardTitle>
              <Button size="sm" variant="outline" onClick={fetchVerifications}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">User ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Session</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {identity.map((v) => (
                      <tr key={v.id} className="bg-white hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{v.user_id.slice(0, 12)}…</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusColor(v.status)} className="gap-1">
                            {statusIcon(v.status)}
                            {v.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{v.stripe_session_id?.slice(0, 20) ?? "—"}…</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(v.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {identity.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                          No identity verifications yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-base">Text Verifications</CardTitle>
              <Button size="sm" variant="outline" onClick={fetchVerifications}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">User ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Attempts</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {text.map((v) => (
                      <tr key={v.id} className="bg-white hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{v.user_id.slice(0, 12)}…</td>
                        <td className="px-4 py-3 font-mono text-xs">{v.phone}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusColor(v.status)} className="gap-1">
                            {statusIcon(v.status)}
                            {v.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs">{v.attempt_count}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {v.verified_at ? new Date(v.verified_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                    {text.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                          No text verifications yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
