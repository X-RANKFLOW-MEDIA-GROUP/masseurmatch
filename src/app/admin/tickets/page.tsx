"use client";

import { useEffect, useState } from "react";
import { MessageSquare, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
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
  user_name: string;
  user_type: "therapist" | "client";
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "in_progress">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // TODO: Fetch tickets from API
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Support Tickets"
        description="Manage customer support tickets and issues"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All Tickets
          </Button>
          <Button
            variant={filter === "open" ? "default" : "outline"}
            onClick={() => setFilter("open")}
            size="sm"
          >
            Open
          </Button>
          <Button
            variant={filter === "in_progress" ? "default" : "outline"}
            onClick={() => setFilter("in_progress")}
            size="sm"
          >
            In Progress
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
          <p className="mt-2 text-sm text-slate-500">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <MessageSquare className="h-5 w-5 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900">{ticket.title}</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {ticket.user_name} • {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className={`text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
