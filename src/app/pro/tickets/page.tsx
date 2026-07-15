"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";
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
  subject: string;
  category: string;
  priority: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
};

type TicketMessage = {
  id: string;
  author_role: "provider" | "admin" | "system";
  author_name: string | null;
  body: string;
  created_at: string;
};

const CATEGORIES: { value: string; label: string }[] = [
  { value: "billing", label: "Billing" },
  { value: "payouts", label: "Payouts" },
  { value: "technical", label: "Technical issue" },
  { value: "profile", label: "Profile & listing" },
  { value: "verification", label: "Verification" },
  { value: "account", label: "Account" },
  { value: "trust_safety", label: "Trust & Safety" },
  { value: "other", label: "Other" },
];

const PRIORITIES = [
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

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting_on_user: "Awaiting your reply",
  resolved: "Resolved",
  closed: "Closed",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TherapistTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "new" | "thread">("list");
  const [activeId, setActiveId] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/support/tickets", { cache: "no-store" });
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

  const openCount = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress" || t.status === "waiting_on_user",
  ).length;

  if (view === "new") {
    return (
      <NewTicketForm
        onCancel={() => setView("list")}
        onCreated={(id) => {
          void fetchTickets();
          setActiveId(id);
          setView("thread");
        }}
      />
    );
  }

  if (view === "thread" && activeId) {
    return (
      <TicketThread
        ticketId={activeId}
        onBack={() => {
          setView("list");
          void fetchTickets();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Support Tickets</h1>
          <p className="mt-1 text-sm text-slate-600">
            Get help from the MasseurMatch team. We usually reply within one business day.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void fetchTickets()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setView("new")} className="gap-2">
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      {openCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <ShieldCheck className="h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            You have <strong>{openCount}</strong> active ticket{openCount === 1 ? "" : "s"}. We&apos;ll
            email you when support replies.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">No tickets yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Open a ticket and our team will get back to you by email.
          </p>
          <Button onClick={() => setView("new")} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => {
                setActiveId(ticket.id);
                setView("thread");
              }}
              className="flex w-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <MessageSquare className="h-5 w-5 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-slate-900">{ticket.subject}</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {CATEGORIES.find((c) => c.value === ticket.category)?.label ?? ticket.category} ·
                  Updated {formatDate(ticket.updated_at)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${STATUS_STYLES[ticket.status]}`}
              >
                {STATUS_LABELS[ticket.status]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NewTicketForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (id: string) => void;
}) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("other");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (subject.trim().length < 3) {
      setError("Please enter a subject.");
      return;
    }
    if (message.trim().length < 1) {
      setError("Please describe your issue.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, priority, message }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Could not create ticket.");
      }
      onCreated(json.ticket.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tickets
      </button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">New Support Ticket</h1>
        <p className="mt-1 text-sm text-slate-600">
          Tell us what&apos;s going on and we&apos;ll get back to you by email.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Subject</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your issue"
            maxLength={160}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue in detail…"
            rows={7}
            maxLength={8000}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={submitting} className="gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit ticket
          </Button>
        </div>
      </div>
    </div>
  );
}

function TicketThread({ ticketId, onBack }: { ticketId: string; onBack: () => void }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchThread = useCallback(async () => {
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, { cache: "no-store" });
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

  const sendReply = async () => {
    if (reply.trim().length < 1) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
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

  const isClosed = ticket?.status === "closed";

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-12">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tickets
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : error && !ticket ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : ticket ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{ticket.subject}</h1>
              <p className="mt-1 text-xs text-slate-500">
                {CATEGORIES.find((c) => c.value === ticket.category)?.label ?? ticket.category} ·
                Opened {formatDate(ticket.created_at)}
              </p>
            </div>
            <span
              className={`rounded px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[ticket.status]}`}
            >
              {STATUS_LABELS[ticket.status]}
            </span>
          </div>

          <div className="space-y-4">
            {messages.map((m) => {
              const mine = m.author_role === "provider";
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      mine
                        ? "bg-[#8B1E2D] text-white"
                        : m.author_role === "system"
                          ? "border border-slate-200 bg-slate-50 text-slate-600"
                          : "border border-slate-200 bg-white text-slate-900"
                    }`}
                  >
                    <p className="mb-1 text-[11px] font-medium opacity-70">
                      {mine ? "You" : m.author_name || "Support Team"} · {formatDate(m.created_at)}
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {isClosed ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
              This ticket is closed. Reply to reopen it.
            </div>
          ) : null}

          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply…"
              rows={3}
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
        </>
      ) : null}
    </div>
  );
}
