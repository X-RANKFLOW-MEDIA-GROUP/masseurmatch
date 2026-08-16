"use client";

import { useCallback, useEffect, useState } from "react";

import { requestJson } from "@/app/_lib/request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

type BridgeStatus = "online" | "degraded" | "offline";
type ArmBlocker =
  | "global_pause"
  | "no_worker"
  | "worker_not_online"
  | "replay_history_enabled"
  | "pending_imessage_queue"
  | "no_valid_consent";

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

type OutboundSafety = {
  globalPause: boolean;
  outboundEnabled: boolean;
  pendingQueueCount: number;
  validConsentCount: number;
  worker: {
    workerId: string;
    status: BridgeStatus;
    replayHistory: boolean;
  } | null;
  readiness: {
    canArm: boolean;
    blockers: ArmBlocker[];
  };
};

type BridgeHealthResponse = {
  ok: boolean;
  migrationPending: boolean;
  workers: BridgeWorker[];
  safety: OutboundSafety | null;
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

function blockerLabel(blocker: ArmBlocker) {
  switch (blocker) {
    case "global_pause":
      return "Global messaging is paused";
    case "no_worker":
      return "No bridge worker is connected";
    case "worker_not_online":
      return "Bridge worker is not online";
    case "replay_history_enabled":
      return "History replay is enabled";
    case "pending_imessage_queue":
      return "Pending or claimed iMessage rows already exist";
    case "no_valid_consent":
      return "No provider has valid dedicated iMessage consent";
  }
}

export default function ImessageBridgeHealth() {
  const [data, setData] = useState<BridgeHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [controlLoading, setControlLoading] = useState(false);
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
  const safety = data?.safety || null;

  const setOutbound = useCallback(
    async (action: "arm" | "disarm") => {
      if (action === "arm") {
        if (!primary || !safety?.readiness.canArm) return;
        const confirmed = window.confirm(
          `Arm outbound iMessage for worker ${primary.worker_id}? Only do this immediately before the controlled smoke test.`,
        );
        if (!confirmed) return;
      }

      setControlLoading(true);
      try {
        setError("");
        await requestJson("/api/admin/messaging/imessage-outbound", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            workerId: primary?.worker_id,
          }),
        });
        await load(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update outbound iMessage safety gate");
      } finally {
        setControlLoading(false);
      }
    },
    [load, primary, safety],
  );

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">iMessage bridge health</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Live heartbeat and fail-closed outbound controls for the dedicated Knotty Mac bridge.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {primary ? (
            <Badge variant={badgeVariant(primary.status)}>{primary.status}</Badge>
          ) : (
            <Badge variant="outline">not connected</Badge>
          )}
          {safety ? (
            <Badge variant={safety.outboundEnabled ? "destructive" : "outline"}>
              outbound {safety.outboundEnabled ? "armed" : "disarmed"}
            </Badge>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {!error && data?.migrationPending ? (
          <p className="text-sm text-slate-500">
            iMessage bridge or outbound safety migration has not been applied in this environment.
          </p>
        ) : null}
        {!error && !data?.migrationPending && !primary ? (
          <p className="text-sm text-slate-500">
            No heartbeat received yet. Keep outbound iMessage disarmed until the dedicated Mac reports online.
          </p>
        ) : null}

        {safety ? (
          <div className="rounded-lg border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">Outbound safety gate</p>
                <p className="mt-1 text-xs text-slate-500">
                  Arming is blocked unless the bridge is online, replay is off, the iMessage queue is empty, global messaging is unpaused, and dedicated consent exists.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => void setOutbound("arm")}
                  disabled={controlLoading || safety.outboundEnabled || !safety.readiness.canArm}
                >
                  Arm outbound
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => void setOutbound("disarm")}
                  disabled={controlLoading || !safety.outboundEnabled}
                >
                  Disarm now
                </Button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Global pause</p>
                <p className="mt-1 font-medium text-slate-900">{safety.globalPause ? "ON" : "Off"}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">iMessage queue</p>
                <p className="mt-1 font-medium text-slate-900">{safety.pendingQueueCount} open</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Valid consents</p>
                <p className="mt-1 font-medium text-slate-900">{safety.validConsentCount}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Ready to arm</p>
                <p className="mt-1 font-medium text-slate-900">{safety.readiness.canArm ? "Yes" : "No"}</p>
              </div>
            </div>

            {!safety.outboundEnabled && safety.readiness.blockers.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-slate-600">
                {safety.readiness.blockers.map((blocker) => (
                  <li key={blocker}>{blockerLabel(blocker)}</li>
                ))}
              </ul>
            ) : null}
          </div>
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
