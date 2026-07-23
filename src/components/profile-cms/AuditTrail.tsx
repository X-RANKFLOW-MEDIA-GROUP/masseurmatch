"use client";

import React, { useMemo, useState } from "react";
import {
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditTrailProps, EditHistory } from "@/types/profile-fields";

const statusConfig = {
  approved: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    label: "Approved",
  },
  pending: {
    icon: AlertCircle,
    color: "text-warning",
    bg: "bg-warning/10",
    label: "Pending",
  },
  rejected: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Rejected",
  },
};

export const AuditTrail = React.forwardRef<HTMLDivElement, AuditTrailProps>(
  (
    {
      history,
      recentOnly = false,
      recentLimit = 10,
      onFilterByUser,
      className,
    },
    ref
  ) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    const displayedHistory = useMemo(() => {
      let filtered = history;

      if (selectedUser) {
        filtered = filtered.filter((h) => h.editedBy === selectedUser);
      }

      if (recentOnly) {
        filtered = filtered.slice(0, recentLimit);
      }

      return filtered.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }, [history, selectedUser, recentOnly, recentLimit]);

    const uniqueUsers = useMemo(() => {
      return [...new Set(history.map((h) => h.editedBy))];
    }, [history]);

    const formatDate = (isoString: string) => {
      try {
        const date = new Date(isoString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        return isoString;
      }
    };

    const formatTime = (isoString: string) => {
      try {
        const date = new Date(isoString);
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return "";
      }
    };

    const formatValue = (value: unknown) => {
      if (value === null || value === undefined) {
        return "null";
      }
      if (typeof value === "object") {
        return JSON.stringify(value);
      }
      return String(value);
    };

    if (displayedHistory.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            "text-center py-8 px-4 rounded-xl border border-border/90 bg-white/92",
            className
          )}
        >
          <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No edits yet</p>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("space-y-4", className)}>
        {/* Header with filter */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/90 bg-white/92">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Edit History
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {displayedHistory.length} change
              {displayedHistory.length !== 1 ? "s" : ""}
            </p>
          </div>

          {uniqueUsers.length > 1 && (
            <select
              value={selectedUser || ""}
              onChange={(e) => {
                const userId = e.target.value || null;
                setSelectedUser(userId);
                onFilterByUser?.(userId!);
              }}
              className="text-xs px-2 py-1 rounded border border-border/90 bg-background text-foreground"
            >
              <option value="">All users</option>
              {uniqueUsers.map((userId) => (
                <option key={userId} value={userId}>
                  {userId}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          {displayedHistory.map((entry, idx) => {
            const isExpanded = expandedId === entry.id;
            const statusInfo = statusConfig[entry.status || "approved"];
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={entry.id}
                className="rounded-lg border border-border/90 overflow-hidden bg-white/92 hover:bg-white/96 transition-colors motion-premium"
              >
                {/* Header */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : entry.id)
                  }
                  className="w-full text-left p-4 flex items-start gap-3 hover:bg-white/50 transition-colors"
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-1">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        idx === 0
                          ? "bg-accent"
                          : "bg-muted-foreground/30"
                      )}
                    />
                    {idx < displayedHistory.length - 1 && (
                      <div
                        className="w-0.5 h-8 bg-muted-foreground/10"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-foreground bg-accent/10 px-2 py-1 rounded">
                        {entry.fieldId}
                      </span>
                      <StatusIcon
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          statusInfo.color
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          statusInfo.color
                        )}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="font-medium">
                        {entry.editorEmail || entry.editedBy}
                      </span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDate(entry.timestamp)} at{" "}
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Toggle indicator */}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 mt-1",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                {/* Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-border/50 space-y-3 bg-white/50">
                    {entry.changeReason && (
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1">
                          Reason
                        </p>
                        <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                          {entry.changeReason}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1">
                          Previous Value
                        </p>
                        <pre className="text-xs bg-muted/50 p-2 rounded border border-border/50 font-mono text-foreground overflow-auto max-h-24">
                          {formatValue(entry.previousValue)}
                        </pre>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1">
                          New Value
                        </p>
                        <pre className="text-xs bg-success/10 p-2 rounded border border-success/20 font-mono text-success overflow-auto max-h-24">
                          {formatValue(entry.newValue)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

AuditTrail.displayName = "AuditTrail";
