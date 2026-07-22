"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  MessageSquare,
  Flag,
} from "lucide-react";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { requestJson } from "@/app/_lib/request";

type Complaint = {
  id: string;
  reporter_id: string;
  reported_profile_id: string;
  category: string;
  description: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
  resolved_at: string | null;
  admin_notes: string | null;
  profiles: {
    id: string;
    full_name: string;
    display_name: string | null;
  };
};

type ComplaintFilter = "pending" | "resolved" | "dismissed" | "all";

// Full static class strings — Tailwind's JIT cannot generate classes built by
// string interpolation (`bg-${x}-50`), so those badges rendered unstyled.
const categoryBadgeClass: Record<string, string> = {
  inappropriate_photos: "bg-brand-secondary/[0.06] text-brand-secondary",
  fake_profile: "bg-red-50 text-red-700",
  harassment: "bg-[#F5F5F5] text-[#111111]",
  scam: "bg-[#F7F7F7] text-[#6F6F6F]",
  other: "bg-slate-50 text-slate-700",
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ComplaintFilter>("pending");

  useEffect(() => {
    requestJson<{ ok: boolean; complaints: Complaint[] }>(
      `/api/admin/complaints?status=${filter}`
    )
      .then((data) => {
        setComplaints(data.complaints || []);
      })
      .catch(() => { /* UI shows empty list */ })
      .finally(() => setLoading(false));
  }, [filter]);

  const filters: { value: ComplaintFilter; label: string }[] = [
    { value: "pending", label: "Pending Review" },
    { value: "resolved", label: "Resolved" },
    { value: "dismissed", label: "Dismissed" },
    { value: "all", label: "All" },
  ];

  function getDaysAgo(date: string): string {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Client Complaints"
        description="Review and investigate complaints about therapist profiles. Take appropriate action including suspensions if needed."
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-border pb-4">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`whitespace-nowrap px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === f.value
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Complaint Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No complaints for this filter.</p>
          </div>
        ) : (
          complaints.map((complaint) => {
            const categoryClass = categoryBadgeClass[complaint.category] || categoryBadgeClass.other;

            return (
              <div
                key={complaint.id}
                className="block border border-border bg-white p-5 rounded-lg transition-all hover:shadow-md hover:border-primary/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${categoryClass}`}>
                        <Flag className="h-3 w-3" />
                        {complaint.category.replace(/_/g, " ")}
                      </div>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                        complaint.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : complaint.status === "resolved"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-50 text-slate-700"
                      }`}>
                        {complaint.status === "pending" && <AlertTriangle className="h-3 w-3" />}
                        {complaint.status === "resolved" && <CheckCircle2 className="h-3 w-3" />}
                        {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {complaint.profiles.display_name || complaint.profiles.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Reported on {new Date(complaint.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-foreground line-clamp-2">
                      {complaint.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-xs text-muted-foreground text-right">
                      {getDaysAgo(complaint.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
