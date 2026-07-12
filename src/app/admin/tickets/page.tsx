"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
} from "lucide-react";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TicketStatus = "open" | "in_progress" | "waiting_on_user" | "resolved" | "closed";

type Ticket = {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  priority: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  requester_name: string | null;
  requester_email: string | null;
};

type TicketMessage = {
  id: string;
  author_role: "provider" | "admin" | "system";
  author_name: string | null;
  body: string;
  created_at: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  billing: "Billing",
  payouts: "Payouts",
  technical: "Technical",
  profile: "Profile",
  verification: "Verification",
  account: "Account",
  trust_safety: "Trust & Safety",
  other: "Other",
};

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "waiting_on_user", label: "Waiting on user" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  waiting_on_user: "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-slate-100 text-slate-700",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "text-slate-500",
  medium: "text-amber-600",
  high: "text-orange-600",
  urgent: "text-red-600",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminTicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      }
    >
      <AdminTicketsInner />
    </Suspense>
  );
}

function AdminTicketsInner() {
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | TicketStatus>("active");
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tickets", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load tickets (${res.status}).`);
      const json = await res.json();
      setTickets(json.tickets ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    const deepLink = searchParams.get("ticket");
    if (deepLink) setActiveId(deepLink);
  }, [searchParams]);

  const activeCount = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress" || t.status === "waiting_on_user",
  ).length;

  const filtered = tickets.filter((t) => {
    if (filter === "active") {
      if (!["open", "in_progress", "waiting_on_user"].includes(t.status)) return false;
    } else if (filter !== "all" && t.status !== filter) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const hay = `${t.subject} ${t.requester_name ?? ""} ${t.requester_email ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (activeId) {
    return (
      <AdminTicketThread
        ticketId={activeId}
        onBack={() => {
          setActiveId(null);
          void fetchTickets();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Support Tickets"
        description={`${activeCount} active · ${tickets.length} total`}
        actions={
          <Button variant="outline" size="sm" onClick={() => void fetchTickets()}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["active", "all", "open", "in_progress", "waiting_on_user", "resolved", "closed"] as const).map(
            (key) => (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                onClick={() => setFilter(key)}
                size="sm"
              >
                {key === "all"
                  ? "All"
                  : key === "active"
                    ? "Active"
                    : STATUS_OPTIONS.find((s) => s.value === key)?.label ?? key}
              </Button>
            ),
          )}
        </div>
        <Input
          placeholder="Search tickets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No tickets found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setActiveId(ticket.id)}
              className="flex w-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <MessageSquare className="h-5 w-5 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-slate-900">{ticket.subject}</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {ticket.requester_name || ticket.requester_email || "Unknown"} ·{" "}
                  {CATEGORY_LABELS[ticket.category] ?? ticket.category} · Updated{" "}
                  {formatDate(ticket.last_message_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`text-xs font-semibold uppercase ${PRIORITY_STYLES[ticket.priority] ?? ""}`}
                >
                  {ticket.priority}
                </span>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${STATUS_STYLES[ticket.status]}`}
                >
                  {STATUS_OPTIONS.find((s) => s.value === ticket.status)?.label ?? ticket.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminTicketThread({ ticketId, onBack }: { ticketId: string; onBack: () => void }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchThread = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load ticket (${res.status}).`);
      const json = await res.json();
      setTicket(json.ticket);
      setMessages(json.messages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ticket.");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    void fetchThread();
  }, [fetchThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const updateMeta = async (patch: { status?: TicketStatus; priority?: string }) => {
    setSavingMeta(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Update failed.");
      setTicket((prev) => (prev ? { ...prev, ...patch } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSavingMeta(false);
    }
  };

  const sendReply = async () => {
    if (reply.trim().length < 1) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Could not send reply.");
      setReply("");
      await fetchThread();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reply.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tickets
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : error && !ticket ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : ticket ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-bold text-slate-900">{ticket.subject}</h1>
              <p className="mt-1 text-xs text-slate-500">
                {ticket.requester_name || "Unknown"}
                {ticket.requester_email ? ` · ${ticket.requester_email}` : ""} · Opened{" "}
                {formatDate(ticket.created_at)}
              </p>
            </div>

            <div className="space-y-4">
              {messages.map((m) => {
                const fromAdmin = m.author_role === "admin";
                return (
                  <div key={m.id} className={`flex ${fromAdmin ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        fromAdmin
                          ? "bg-[#8B1E2D] text-white"
                          : m.author_role === "system"
                            ? "border border-slate-200 bg-slate-50 text-slate-600"
                            : "border border-slate-200 bg-white text-slate-900"
                      }`}
                    >
                      <p className="mb-1 text-[11px] font-medium opacity-70">
                        {fromAdmin ? m.author_name || "Support Team" : m.author_name || "Provider"} ·{" "}
                        {formatDate(m.created_at)}
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Reply to the provider…"
                rows={4}
                maxLength={8000}
              />
              {error && ticket && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end">
                <Button
                  onClick={() => void sendReply()}
                  disabled={sending || reply.trim().length < 1}
                  className="gap-2"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send reply
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </label>
                <Select
                  value={ticket.status}
                  onValueChange={(v) => void updateMeta({ status: v as TicketStatus })}
                  disabled={savingMeta}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Priority
                </label>
                <Select
                  value={ticket.priority}
                  onValueChange={(v) => void updateMeta({ priority: v })}
                  disabled={savingMeta}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Details</p>
              <p className="text-slate-600">
                <span className="text-slate-400">Category:</span>{" "}
                {CATEGORY_LABELS[ticket.category] ?? ticket.category}
              </p>
              <p className="text-slate-600">
                <span className="text-slate-400">Provider:</span> {ticket.requester_name || "—"}
              </p>
              <p className="break-all text-slate-600">
                <span className="text-slate-400">Email:</span> {ticket.requester_email || "—"}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
