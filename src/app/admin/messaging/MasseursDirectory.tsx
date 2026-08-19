"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Users } from "lucide-react";

import { requestJson } from "@/app/_lib/request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Masseur = {
  profileId: string;
  userId: string | null;
  name: string;
  slug: string | null;
  role: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  active: boolean;
  suspended: boolean;
  banned: boolean;
  profileComplete: boolean;
  missing: string[];
  missingCount: number;
  nextField: string | null;
  photoCount: number;
  imessageAssistantEnabled: boolean;
  imessageConsent: boolean;
  imessageOptedOut: boolean;
  messagingContactId: string | null;
  messagingLifecycle: string | null;
  knottyEnabled: boolean;
  messagingOptedOut: boolean;
};

type Response = {
  ok: boolean;
  masseurs: Masseur[];
  counts: {
    total: number;
    active: number;
    complete: number;
    incomplete: number;
    imessageConsented: number;
    messagingContacts: number;
  };
};

function statusFor(masseur: Masseur) {
  if (masseur.banned) return "Banned";
  if (masseur.suspended) return "Suspended";
  if (!masseur.active) return "Inactive";
  return "Active";
}

export default function MasseursDirectory() {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setError("");
      const next = await requestJson<Response>("/api/admin/messaging/masseurs");
      setData(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load masseurs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data?.masseurs || [];
    return (data?.masseurs || []).filter((masseur) =>
      [masseur.name, masseur.city, masseur.state, masseur.phone, masseur.slug, masseur.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [data?.masseurs, query]);

  return (
    <Card>
      <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" /> All Masseurs
          </CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Every non-demo masseur profile, including providers who have not entered the messaging contact system yet.
          </p>
        </div>
        <div className="flex w-full gap-2 lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search masseur, city, phone..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
          {[
            ["Total", data?.counts.total ?? 0],
            ["Active", data?.counts.active ?? 0],
            ["Complete", data?.counts.complete ?? 0],
            ["Incomplete", data?.counts.incomplete ?? 0],
            ["iMessage consent", data?.counts.imessageConsented ?? 0],
            ["Messaging contacts", data?.counts.messagingContacts ?? 0],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 text-xl font-bold text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Masseur</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Profile</th>
                <th className="px-4 py-3">Knotty iMessage</th>
                <th className="px-4 py-3">Messaging</th>
                <th className="px-4 py-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((masseur) => (
                <tr key={masseur.profileId} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-950">{masseur.name}</p>
                    <p className="mt-1 font-mono text-[11px] text-slate-400">{masseur.profileId}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {[masseur.city, masseur.state].filter(Boolean).join(", ") || "No location"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline">{masseur.role || "unknown"}</Badge>
                      <Badge variant={statusFor(masseur) === "Active" ? "outline" : "destructive"}>{statusFor(masseur)}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {masseur.profileComplete ? (
                      <Badge variant="outline">Complete</Badge>
                    ) : (
                      <div>
                        <Badge variant="secondary">{masseur.missingCount} missing</Badge>
                        <p className="mt-2 max-w-[260px] text-xs text-slate-500">
                          {masseur.missing.join(", ") || "Unknown"}
                        </p>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={masseur.imessageConsent ? "outline" : "secondary"}>
                        {masseur.imessageConsent ? "Consented" : "No consent"}
                      </Badge>
                      {masseur.imessageOptedOut ? <Badge variant="destructive">Opted out</Badge> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {masseur.messagingContactId ? (
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline">{masseur.messagingLifecycle || "contact"}</Badge>
                        {masseur.knottyEnabled ? <Badge variant="outline">Knotty on</Badge> : null}
                        {masseur.messagingOptedOut ? <Badge variant="destructive">Opted out</Badge> : null}
                      </div>
                    ) : (
                      <Badge variant="secondary">Not loaded to messaging</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{masseur.phone || "No phone"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No masseurs found.</p> : null}
        {loading && !data ? <p className="py-6 text-center text-sm text-slate-500">Loading all masseurs...</p> : null}
      </CardContent>
    </Card>
  );
}
