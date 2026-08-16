"use client";

import { useCallback, useEffect, useState } from "react";

import { requestJson } from "@/app/_lib/request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

type BridgeStatus = "online" | "degraded" | "offline";

type BridgeWorker = {
  worker_id: string;
  bridge_version: string;
  started_at: string;
  last_seen_at: string;
  last_cycle_at: string | null;
  last_inbound_at: string | null;
  last_outbound_at: string | null;
  last_error_code: string | null;
  last_error_at: string | null;
  replay_history: boolean;
  poll_ms: number;
  status: BridgeStatus;
};

type BridgeHealthResponse = {
  ok: boolean;
  migrationPending: boolean;
  workers: BridgeWorker[];
};

function when(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function badgeVariant(status: BridgeStatus) {
  return status === "online" ? "outline" : "destructive";
}

export default function ImessageBridgeHealth() {
  const [data, setData] = useState<BridgeHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setError("");
      const response = await requestJson<BridgeHealthResponse>("/api/admin/messaging/bridge-health");
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bridge health unavailable");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(true), 15_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const primary = data?.workers[0] || null;

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">iMessage bridge health</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Live heartbeat from the dedicated Mac that transports Knotty iMessages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {primary ? (
            <Badge variant={badgeVariant(primary.status)}>{primary.status}</Badge>
          ) : (
            <Badge variant="outline">not connected</Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {!error && data?.migrationPending ? (
          <p className="text-sm text-slate-500">Bridge health migration has not been applied in this environment.</p>
        ) : null}
        {!error && !data?.migrationPending && !primary ? (
          <p className="text-sm text-slate-500">
            No heartbeat received yet. Keep messaging paused until the dedicated Mac reports online.
          </p>
        ) : null}
        {primary ? (
          <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Worker</p>
              <p className="mt-1 break-all font-medium text-slate-900">{primary.worker_id}</p>
              <p className="mt-1 text-xs text-slate-500">{primary.bridge_version}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Heartbeat</p>
              <p className="mt-1 font-medium text-slate-900">{when(primary.last_seen_at)}</p>
              <p className="mt-1 text-xs text-slate-500">Cycle {when(primary.last_cycle_at)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Traffic</p>
              <p className="mt-1 text-slate-700">Inbound {when(primary.last_inbound_at)}</p>
              <p className="mt-1 text-slate-700">Outbound {when(primary.last_outbound_at)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Safety</p>
              <p className="mt-1 text-slate-700">Replay history: {primary.replay_history ? "ON" : "Off"}</p>
              <p className="mt-1 text-slate-700">Poll: {primary.poll_ms} ms</p>
              {primary.last_error_code ? (
                <p className="mt-1 break-all text-xs text-red-600">
                  Last error {primary.last_error_code} · {when(primary.last_error_at)}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">No bridge error reported.</p>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
