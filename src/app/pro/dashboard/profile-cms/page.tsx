"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Download,
  Download as PdfIcon,
  Eye,
  Settings,
  FileText,
  Clock,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Edit2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { requestJson, ApiError } from "@/app/_lib/request";
import { PROFILE_FIELDS_CONFIG, FieldSection, getFieldsBySection } from "@/lib/profile-fields-config";

type AuditLog = {
  id: string;
  profile_id: string;
  edited_by: string | null;
  field_name: string;
  old_value: unknown;
  new_value: unknown;
  reason: string | null;
  created_at: string;
};

type ProfileData = {
  id: string;
  [key: string]: unknown;
};

const SECTION_LABELS: Record<FieldSection, string> = {
  [FieldSection.BASIC]: "Basic Info",
  [FieldSection.SERVICES]: "Services",
  [FieldSection.PRICING]: "Pricing",
  [FieldSection.MARKETING]: "Marketing",
  [FieldSection.ADVANCED]: "Advanced",
};

const SECTION_ORDER = [
  FieldSection.BASIC,
  FieldSection.SERVICES,
  FieldSection.PRICING,
  FieldSection.MARKETING,
  FieldSection.ADVANCED,
];

// Calculate completeness percentage and breakdown by section
function calculateCompleteness(profile: ProfileData) {
  const sections: Record<
    FieldSection,
    { completed: number; total: number; percentage: number }
  > = {
    [FieldSection.BASIC]: { completed: 0, total: 0, percentage: 0 },
    [FieldSection.SERVICES]: { completed: 0, total: 0, percentage: 0 },
    [FieldSection.PRICING]: { completed: 0, total: 0, percentage: 0 },
    [FieldSection.MARKETING]: { completed: 0, total: 0, percentage: 0 },
    [FieldSection.ADVANCED]: { completed: 0, total: 0, percentage: 0 },
  };

  let totalCompleted = 0;
  let totalFields = 0;

  PROFILE_FIELDS_CONFIG.forEach((field) => {
    if (!field.editable) return;

    const section = field.section;
    sections[section].total += 1;
    totalFields += 1;

    const value = profile[field.key];
    const isCompleted =
      value !== null &&
      value !== undefined &&
      (Array.isArray(value) ? value.length > 0 : Boolean(value));

    if (isCompleted) {
      sections[section].completed += 1;
      totalCompleted += 1;
    }
  });

  // Calculate percentages for each section
  Object.keys(sections).forEach((sectionKey) => {
    const section = sections[sectionKey as FieldSection];
    section.percentage =
      section.total > 0
        ? Math.round((section.completed / section.total) * 100)
        : 0;
  });

  const totalPercentage =
    totalFields > 0 ? Math.round((totalCompleted / totalFields) * 100) : 0;

  return {
    totalPercentage,
    sections,
    completedFields: totalCompleted,
    totalFields,
    incompleteCount: totalFields - totalCompleted,
  };
}

// Get completion color based on percentage
function getCompletionColor(percentage: number) {
  if (percentage < 40) return "#DC2626"; // Red
  if (percentage < 70) return "#EAB308"; // Yellow
  return "#16A34A"; // Green
}

// Format timestamp to relative time
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

// Truncate JSON value for display
function truncateValue(value: unknown, maxLength: number = 100): string {
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  return str.length > maxLength ? str.substring(0, maxLength) + "…" : str;
}

// Progress bar component
function CompletenessProgressBar({
  percentage,
  incompleteCount,
}: {
  percentage: number;
  incompleteCount: number;
}) {
  const color = getCompletionColor(percentage);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#111111]">
          Profile Completeness
        </h2>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color }}>
            {percentage}%
          </div>
          <p className="text-xs text-[#6F6F6F]">
            {incompleteCount > 0
              ? `${incompleteCount} section${incompleteCount === 1 ? "" : "s"} need${incompleteCount === 1 ? "s" : ""} attention`
              : "Fully complete"}
          </p>
        </div>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#E8E8E8]">
        <div
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            transition: "width 0.6s ease-out",
          }}
          className="h-full rounded-full"
        />
      </div>

      <div className="text-xs text-[#8E8E8E]">
        {percentage < 100
          ? `${Math.round((100 - percentage) * (PROFILE_FIELDS_CONFIG.filter(f => f.editable).length) / 100)} fields remaining`
          : "All fields complete!"}
      </div>
    </div>
  );
}

// Section status card component
function SectionStatusCard({
  section,
  label,
  completed,
  total,
  percentage,
}: {
  section: FieldSection;
  label: string;
  completed: number;
  total: number;
  percentage: number;
}) {
  const needsAttention = percentage < 70 && percentage > 0;

  return (
    <Link
      href={`/pro/profile/cms?section=${section}`}
      className="group relative overflow-hidden rounded-lg border border-[#D9D9D9] bg-white p-5 transition-all hover:border-[#8B1E2D] hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-[#111111] text-sm">{label}</h3>
          <p className="mt-1 text-xs text-[#6F6F6F]">
            {completed} of {total} fields
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-[#D9D9D9] transition-colors group-hover:text-[#8B1E2D]" />
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8E8E8]">
          <div
            style={{
              width: `${percentage}%`,
              backgroundColor: percentage === 100 ? "#16A34A" : "#8B1E2D",
              transition: "width 0.6s ease-out",
            }}
            className="h-full"
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-mono text-[#6F6F6F]">
          {percentage}%
        </span>
        {needsAttention && (
          <span className="flex items-center gap-1 text-xs text-[#DC2626]">
            <AlertCircle className="h-3 w-3" />
            Needs attention
          </span>
        )}
      </div>
    </Link>
  );
}

// Recent changes timeline
function RecentChangesTimeline({ changes }: { changes: AuditLog[] }) {
  if (changes.length === 0) {
    return (
      <div className="rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] p-6 text-center">
        <Clock className="mx-auto h-8 w-8 text-[#D9D9D9]" />
        <p className="mt-2 text-sm text-[#6F6F6F]">No changes yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {changes.map((change, idx) => (
        <div
          key={change.id}
          className="flex gap-3 border-l-2 border-[#E8E8E8] pl-4 py-2"
        >
          <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#8B1E2D] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#111111]">
              {change.field_name
                .replace(/_/g, " ")
                .split(" ")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
            </p>
            <p className="text-xs text-[#6F6F6F]">
              {formatTimeAgo(change.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Full audit trail table with pagination
function AuditTrailTable({ logs }: { logs: AuditLog[] }) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const paginatedLogs = logs.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#D9D9D9] bg-[#F7F7F7]">
              <th className="px-4 py-3 text-left font-semibold text-[#111111]">
                Field
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[#111111]">
                Change
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[#111111]">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-[#E8E8E8] hover:bg-[#FAFAFA]"
              >
                <td className="px-4 py-3 text-[#111111] font-medium">
                  {log.field_name
                    .replace(/_/g, " ")
                    .split(" ")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </td>
                <td className="px-4 py-3 text-[#6F6F6F] text-xs">
                  <code className="block break-all">
                    {truncateValue(log.old_value)} →{" "}
                    {truncateValue(log.new_value)}
                  </code>
                </td>
                <td className="px-4 py-3 text-[#6F6F6F] whitespace-nowrap">
                  <div className="text-xs">
                    {new Date(log.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-[#8E8E8E]">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#E8E8E8] pt-4">
          <div className="text-xs text-[#6F6F6F]">
            Page {page + 1} of {totalPages} ({logs.length} total changes)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded px-3 py-1.5 text-xs font-medium border border-[#D9D9D9] text-[#111111] hover:bg-[#F7F7F7] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="rounded px-3 py-1.5 text-xs font-medium border border-[#D9D9D9] text-[#111111] hover:bg-[#F7F7F7] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Settings section
function SettingsSection() {
  const [reminders, setReminders] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await requestJson("/api/pro/profile/cms/settings", {
        method: "POST",
        body: JSON.stringify({
          show_section_reminders: reminders,
          email_weekly_digest: emailDigest,
        }),
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  }, [reminders, emailDigest]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-[#111111] text-sm">Preferences</h3>

      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 rounded border border-[#E8E8E8] hover:bg-[#FAFAFA] cursor-pointer">
          <input
            type="checkbox"
            checked={reminders}
            onChange={(e) => setReminders(e.target.checked)}
            className="w-4 h-4 rounded border-[#D9D9D9] accent-[#8B1E2D]"
          />
          <span className="text-sm text-[#111111]">
            Show me section reminders
          </span>
        </label>

        <label className="flex items-center gap-3 p-3 rounded border border-[#E8E8E8] hover:bg-[#FAFAFA] cursor-pointer">
          <input
            type="checkbox"
            checked={emailDigest}
            onChange={(e) => setEmailDigest(e.target.checked)}
            className="w-4 h-4 rounded border-[#D9D9D9] accent-[#8B1E2D]"
          />
          <span className="text-sm text-[#111111]">
            Email weekly digest of changes
          </span>
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-4 py-2 rounded font-medium text-sm text-white bg-[#8B1E2D] hover:bg-[#6E1521] disabled:opacity-60 transition-colors"
      >
        {saving ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
}

// Main page component
export default function ProfileCMSDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile and audit logs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await requestJson<{ ok: boolean; profile: ProfileData }>(
          "/api/pro/profile"
        );

        if (!profileRes.profile) {
          throw new Error("No profile found");
        }

        setProfile(profileRes.profile);

        // Fetch audit logs
        const auditRes = await requestJson<{ ok: boolean; logs: AuditLog[] }>(
          "/api/pro/profile/audit-logs"
        );

        setAuditLogs(auditRes.logs || []);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.push("/login");
        } else {
          setError(
            err instanceof Error ? err.message : "Failed to load profile"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const completeness = useMemo(() => {
    return profile ? calculateCompleteness(profile) : null;
  }, [profile]);

  const recentChanges = useMemo(() => {
    return auditLogs.slice(0, 10);
  }, [auditLogs]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6 md:p-10">
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-[#E8E8E8]" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-lg bg-[#E8E8E8]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile || !completeness) {
    return (
      <div className="mx-auto max-w-7xl p-6 md:p-10">
        <div className="rounded-lg border border-[#DC2626] bg-[#FEE2E2] p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-[#DC2626] flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-[#111111]">Error loading profile</h3>
              <p className="mt-1 text-sm text-[#6F6F6F]">
                {error || "Please try again later"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Header */}
      <div className="border-b border-[#E8E8E8] bg-[#FAFAFA]">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#111111]">
                Profile CMS
              </h1>
              <p className="mt-1 text-sm text-[#6F6F6F]">
                Manage and track all changes to your professional profile
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/pro/profile/cms"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D9D9D9] bg-white text-[#111111] text-sm font-medium hover:bg-[#F7F7F7] transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Link>
              <button
                onClick={() => window.open("/public/" + (profile.slug || ""), "_blank")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D9D9D9] bg-white text-[#111111] text-sm font-medium hover:bg-[#F7F7F7] transition-colors"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D9D9D9] bg-white text-[#111111] text-sm font-medium hover:bg-[#F7F7F7] transition-colors">
                <PdfIcon className="h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Completeness Progress Bar */}
            <div className="rounded-lg border border-[#D9D9D9] bg-white p-6">
              <CompletenessProgressBar
                percentage={completeness.totalPercentage}
                incompleteCount={completeness.incompleteCount}
              />
            </div>

            {/* Section Status Cards Grid */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-[#111111]">
                Section Status
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {SECTION_ORDER.map((section) => {
                  const sectionData = completeness.sections[section];
                  return (
                    <SectionStatusCard
                      key={section}
                      section={section}
                      label={SECTION_LABELS[section]}
                      completed={sectionData.completed}
                      total={sectionData.total}
                      percentage={sectionData.percentage}
                    />
                  );
                })}
              </div>
            </div>

            {/* Recent Changes Timeline */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-[#111111]">
                Recent Changes
              </h2>
              <div className="rounded-lg border border-[#D9D9D9] bg-white p-6">
                <RecentChangesTimeline changes={recentChanges} />
              </div>
            </div>

            {/* Full Audit Trail */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-[#111111]">
                Full Audit Trail
              </h2>
              <div className="rounded-lg border border-[#D9D9D9] bg-white p-6">
                <AuditTrailTable logs={auditLogs} />
              </div>
            </div>
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-6">
            {/* Settings Card */}
            <div className="rounded-lg border border-[#D9D9D9] bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-[#8B1E2D]" />
                <h3 className="font-semibold text-[#111111]">Settings</h3>
              </div>
              <SettingsSection />
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <h3 className="font-semibold text-[#111111] text-sm">
                Profile Stats
              </h3>

              <div className="rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] p-4">
                <div className="text-xs text-[#6F6F6F] uppercase tracking-wider">
                  Fields Completed
                </div>
                <div className="mt-1 text-2xl font-bold text-[#111111]">
                  {completeness.completedFields}/{completeness.totalFields}
                </div>
              </div>

              <div className="rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] p-4">
                <div className="text-xs text-[#6F6F6F] uppercase tracking-wider">
                  Total Changes
                </div>
                <div className="mt-1 text-2xl font-bold text-[#111111]">
                  {auditLogs.length}
                </div>
              </div>

              <div className="rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] p-4">
                <div className="text-xs text-[#6F6F6F] uppercase tracking-wider">
                  Last Updated
                </div>
                <div className="mt-1 text-sm font-medium text-[#111111]">
                  {auditLogs.length > 0
                    ? formatTimeAgo(auditLogs[0].created_at)
                    : "Never"}
                </div>
              </div>
            </div>

            {/* Help Info */}
            <div className="rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] p-4">
              <h4 className="font-semibold text-[#111111] text-sm">💡 Tips</h4>
              <ul className="mt-3 space-y-2 text-xs text-[#6F6F6F]">
                <li>• Focus on incomplete sections first</li>
                <li>• High-quality photos boost visibility</li>
                <li>• Complete pricing info builds trust</li>
                <li>• All changes are automatically logged</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
