"use client";

import { useEffect, useState } from "react";
import { PageSection, Surface } from "@/app/_components/primitives";
import { Button } from "@/components/ui/button";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  updated_at: string;
};

export default function ProTicketsPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<Ticket["priority"]>("normal");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    const res = await fetch("/api/pro/tickets");
    const json = await res.json();
    setTickets(json.tickets ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void loadTickets();
  }, []);

  const createTicket = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSaving(true);
    const res = await fetch("/api/pro/tickets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subject, message, priority }),
    });

    if (res.ok) {
      setSubject("");
      setMessage("");
      setPriority("normal");
      await loadTickets();
    }

    setSaving(false);
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <PageSection
        title="Support tickets"
        description="Create tickets and track replies from the admin support team."
      />

      <Surface>
        <div className="grid gap-3">
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Ticket subject"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          />
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Describe your issue"
            className="min-h-28 rounded-md border border-input bg-background p-3 text-sm"
          />
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as Ticket["priority"])}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <Button onClick={() => void createTicket()} disabled={saving}>
              {saving ? "Submitting..." : "Submit ticket"}
            </Button>
          </div>
        </div>
      </Surface>

      <Surface>
        <h2 className="font-display text-lg">My tickets</h2>
        {loading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading tickets...</p>
        ) : (
          <div className="mt-4 space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{ticket.subject}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {ticket.status} · {ticket.priority}
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{ticket.message}</p>
              </div>
            ))}
            {tickets.length === 0 ? <p className="text-sm text-muted-foreground">No tickets yet.</p> : null}
          </div>
        )}
      </Surface>
    </div>
  );
}
