"use client";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CheckCircle2, Clock, XCircle, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IdentityVerification {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  status: string;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
}

interface TextVerification {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  phone: string;
  status: string;
  attempt_count: number;
  verified_at: string | null;
  created_at: string;
}

function StripePhoto({ verificationId, name }: { verificationId: string; name: string | null }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <UserRound className="h-5 w-5" />
      </div>
    );
  }
  return (
    <img
      src={`/api/admin/verification/${verificationId}/photo`}
      alt={name ? `${name} Stripe verification selfie` : "Stripe verification selfie"}
      className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function UserIdentity({ name, email, userId }: { name: string | null; email: string | null; userId: string }) {
  return (
    <div className="min-w-0">
      <div className="truncate font-medium text-foreground">{name || "Unnamed user"}</div>
      <div className="truncate text-xs text-muted-foreground">{email || "No email available"}</div>
      <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground/80" title={userId}>{userId}</div>
    </div>
  );
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
      const res = await fetch("/api/admin/verification", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setIdentity(data.identity ?? []);
      setText(data.text ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load verifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchVerifications();
  }, []);

  const statusColor = (status: string) => {
    if (status === "verified") return "default" as const;
    if (status === "pending" || status === "processing") return "secondary" as const;
    if (status === "failed" || status === "rejected") return "destructive" as const;
    return "outline" as const;
  };

  const statusIcon = (status: string) => {
    if (status === "verified") return <CheckCircle2 className="h-4 w-4" />;
    if (status === "pending" || status === "processing") return <Clock className="h-4 w-4" />;
    if (status === "failed" || status === "rejected") return <XCircle className="h-4 w-4" />;
    return null;
  };

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Verification" description="Review identity and text verification records with user details and Stripe Identity selfie evidence." />

      <Tabs defaultValue="identity">
        <TabsList className="mb-4">
          <TabsTrigger value="identity">Identity ({identity.length})</TabsTrigger>
          <TabsTrigger value="text">Text ({text.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="identity">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-base">Identity Verifications</CardTitle>
              <Button size="sm" variant="outline" onClick={() => void fetchVerifications()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
            </CardHeader>
            <CardContent>
              {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-secondary/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Stripe Session</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Created</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {identity.map((v) => (
                      <tr key={v.id} className="bg-white transition-colors hover:bg-secondary/20">
                        <td className="px-4 py-3">
                          <div className="flex min-w-[280px] items-center gap-3">
                            <StripePhoto verificationId={v.id} name={v.user_name} />
                            <UserIdentity name={v.user_name} email={v.user_email} userId={v.user_id} />
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge variant={statusColor(v.status)} className="gap-1">{statusIcon(v.status)}{v.status}</Badge></td>
                        <td className="px-4 py-3 font-mono text-xs" title={v.stripe_session_id || undefined}>{v.stripe_session_id || "—"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {identity.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No identity verifications yet.</td></tr>}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Stripe selfie images are requested only for authenticated admins and are served through short lived Stripe file links. Images are not copied into MasseurMatch storage.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-base">Text Verifications</CardTitle>
              <Button size="sm" variant="outline" onClick={() => void fetchVerifications()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-secondary/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Attempts</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Verified</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {text.map((v) => (
                      <tr key={v.id} className="bg-white transition-colors hover:bg-secondary/20">
                        <td className="px-4 py-3"><UserIdentity name={v.user_name} email={v.user_email} userId={v.user_id} /></td>
                        <td className="px-4 py-3 font-mono text-xs">{v.phone}</td>
                        <td className="px-4 py-3"><Badge variant={statusColor(v.status)} className="gap-1">{statusIcon(v.status)}{v.status}</Badge></td>
                        <td className="px-4 py-3 text-xs">{v.attempt_count}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{v.verified_at ? new Date(v.verified_at).toLocaleString() : "—"}</td>
                      </tr>
                    ))}
                    {text.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No text verifications yet.</td></tr>}
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
