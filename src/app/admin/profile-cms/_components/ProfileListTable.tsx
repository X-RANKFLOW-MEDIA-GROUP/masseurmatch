"use client";

import { Profile } from "@/lib/profile.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Edit,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

interface ProfileListTableProps {
  profiles: Profile[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: "all" | "pending" | "incomplete";
  onFilterChange: (type: "all" | "pending" | "incomplete") => void;
  sortField: "completeness" | "last_updated";
  onSortChange: (field: "completeness" | "last_updated") => void;
  onEditProfile: (id: string) => void;
  getCompletenessPercentage: (profile: Profile) => number;
  getStatus: (profile: Profile) => "approved" | "pending" | "rejected";
  diffMode?: boolean;
  selectedForDiff?: string[];
  onToggleDiffSelection?: (id: string) => void;
}

export function ProfileListTable({
  profiles,
  totalPages,
  currentPage,
  onPageChange,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  sortField,
  onSortChange,
  onEditProfile,
  getCompletenessPercentage,
  getStatus,
  diffMode = false,
  selectedForDiff = [],
  onToggleDiffSelection,
}: ProfileListTableProps) {
  const statusConfig = {
    approved: { icon: CheckCircle2, label: "Approved", color: "text-green-600" },
    pending: { icon: Clock, label: "Pending", color: "text-amber-600" },
    rejected: { icon: XCircle, label: "Rejected", color: "text-red-600" },
  };

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100";
    if (percentage >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getCompletenessBarColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or slug..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={onFilterChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter profiles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Profiles</SelectItem>
            <SelectItem value="pending">Pending Approval</SelectItem>
            <SelectItem value="incomplete">Incomplete (&lt;70%)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortField} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_updated">Last Updated</SelectItem>
            <SelectItem value="completeness">Completeness</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Results: {profiles.length > 0 ? `${(currentPage - 1) * 20 + 1}-${Math.min(currentPage * 20, (currentPage - 1) * 20 + profiles.length)}` : "0"} of {profiles.length}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/30">
            <tr>
              {diffMode && (
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    disabled
                    title="Select up to 2 profiles to compare"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">City</th>
              <th className="px-4 py-3 text-left font-semibold">Completeness</th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {profiles.length === 0 ? (
              <tr>
                <td
                  colSpan={diffMode ? 6 : 5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No profiles found
                </td>
              </tr>
            ) : (
              profiles.map((profile) => {
                const status = getStatus(profile);
                const completeness = getCompletenessPercentage(profile);
                const StatusIcon = statusConfig[status].icon;
                const isSelected = selectedForDiff.includes(profile.id);

                return (
                  <tr
                    key={profile.id}
                    className={`transition-colors hover:bg-secondary/20 ${
                      diffMode && isSelected ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    {diffMode && (
                      <td className="px-4 py-3 text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            onToggleDiffSelection?.(profile.id)
                          }
                          disabled={selectedForDiff.length >= 2 && !isSelected}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 font-medium">
                      <div>
                        {profile.display_name || profile.full_name || "Unnamed"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {profile.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {profile.city && profile.state
                        ? `${profile.city}, ${profile.state}`
                        : profile.city || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className={`h-full ${getCompletenessBarColor(
                                completeness
                              )} transition-all`}
                              style={{ width: `${completeness}%` }}
                            />
                          </div>
                        </div>
                        <div
                          className={`min-w-12 px-2 py-1 rounded text-xs font-semibold ${getCompletenessColor(
                            completeness
                          )}`}
                        >
                          {completeness}%
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <StatusIcon className={`h-4 w-4 ${statusConfig[status].color}`} />
                        <span className="text-xs font-medium">
                          {statusConfig[status].label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        onClick={() => onEditProfile(profile.id)}
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
