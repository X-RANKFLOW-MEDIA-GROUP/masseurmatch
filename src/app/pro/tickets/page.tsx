"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Ticket = {
  id: string;
  title: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  last_reply?: string;
};

export default function TherapistTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");
  const [search, setSearch] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const getStatusColor = (status: Ticket["status"]) => {
    const colors = {
      open: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Ticket["priority"]) => {
    const colors = {
      low: "text-gray-500",
      medium: "text-yellow-500",
      high: "text-orange-500",
      urgent: "text-red-600",
    };
    return colors[priority];
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filter !== "all" && ticket.status !== filter) return false;
    if (search && !ticket.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCount = tickets.filter((t) => t.status === "open").length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Support Tickets</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your support requests and messages</p>
        </div>
        <Button onClick={() => setShowNewTicket(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {openCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">You have {openCount} open ticket(s)</p>
            <p className="text-sm text-amber-700">Our support team will respond soon</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === "open" ? "default" : "outline"}
            onClick={() => setFilter("open")}
            size="sm"
          >
            Open
          </Button>
          <Button
            variant={filter === "resolved" ? "default" : "outline"}
            onClick={() => setFilter("resolved")}
            size="sm"
          >
            Resolved
          </Button>
        </div>
        <Input
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">
            {search ? "No tickets match your search" : "You haven't created any tickets yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <button
              key={ticket.id}
              className="w-full flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:shadow-md text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <MessageSquare className="h-5 w-5 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900">{ticket.title}</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {new Date(ticket.created_at).toLocaleDateString()} •{" "}
                  {ticket.last_reply ? `Last reply: ${new Date(ticket.last_reply).toLocaleDateString()}` : "Awaiting response"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
