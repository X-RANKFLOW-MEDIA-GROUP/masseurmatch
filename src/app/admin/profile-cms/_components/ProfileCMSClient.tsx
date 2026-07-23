"use client";

import { useState, useMemo } from "react";
import { Profile } from "@/lib/profile.types";
import { ProfileListTable } from "./ProfileListTable";
import { BatchEditModal } from "./BatchEditModal";
import { ProfileDiffTool } from "./ProfileDiffTool";
import { exportProfiles } from "../_lib/export";
import { Button } from "@/components/ui/button";
import { Download, GitCompare } from "lucide-react";

type FilterType = "all" | "pending" | "incomplete";
type SortField = "completeness" | "last_updated";

export function ProfileCMSClient({ initialProfiles }: { initialProfiles: Profile[] }) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortField, setSortField] = useState<SortField>("last_updated");
  const [currentPage, setCurrentPage] = useState(1);
  const [batchEditOpen, setBatchEditOpen] = useState(false);
  const [profileEditId, setProfileEditId] = useState<string | null>(null);
  const [diffMode, setDiffMode] = useState(false);
  const [selectedForDiff, setSelectedForDiff] = useState<string[]>([]);

  const pageSize = 20;

  // Calculate profile completeness
  const getCompletenessPercentage = (profile: Profile): number => {
    const totalFields = 59;
    let filledFields = 0;

    const fields: (keyof Profile)[] = [
      "display_name",
      "full_name",
      "email",
      "phone",
      "bio",
      "avatar_url",
      "city",
      "state",
      "zip_code",
      "years_experience",
      "specialties",
      "modalities",
      "languages",
      "certifications",
      "available_now",
      "incall",
      "outcall",
      "incall_price",
      "outcall_price",
      "is_verified_email",
      "is_verified_phone",
      "is_verified_photos",
      "is_verified_identity",
      "subscription_status",
      "subscription_tier",
      "is_active",
      "booking_url",
      "website",
      "payment_methods",
      "education_entries",
      "business_hours",
      "mobile_hours",
      "accessibility_features",
      "headline",
      "tagline",
      "business_trips",
      "seo_title",
      "seo_description",
      "seo_keywords",
      "social_media",
      "presentation_video_url",
      "start_year",
      "location_type",
      "service_radius_miles",
      "massage_techniques",
      "products_used",
      "products_sold",
      "massage_setup",
      "incall_amenities",
      "mobile_extras",
      "day_of_week_discount",
      "regular_discounts",
      "weekly_special",
      "booking_platform",
      "affiliations",
      "segments",
      "training",
      "areas_served",
    ];

    fields.forEach((field) => {
      const value = profile[field];
      if (value !== null && value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0)) {
        filledFields++;
      }
    });

    return Math.round((filledFields / totalFields) * 100);
  };

  // Get profile status
  const getStatus = (profile: Profile): "approved" | "pending" | "rejected" => {
    if (profile.profile_status === "approved" || profile.approved_at) return "approved";
    if (profile.profile_status === "rejected" || profile.rejected_at) return "rejected";
    return "pending";
  };

  // Filter and sort profiles
  const filteredProfiles = useMemo(() => {
    const filtered = profiles.filter((p) => {
      const displayName = p.display_name || p.full_name || "";
      const slug = p.slug || "";
      const matchesSearch =
        displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slug.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === "pending") {
        return getStatus(p) === "pending";
      }

      if (filterType === "incomplete") {
        return getCompletenessPercentage(p) < 70;
      }

      return true;
    });

    filtered.sort((a, b) => {
      if (sortField === "completeness") {
        return getCompletenessPercentage(b) - getCompletenessPercentage(a);
      }
      const aDate = new Date(a.updated_at).getTime();
      const bDate = new Date(b.updated_at).getTime();
      return bDate - aDate;
    });

    return filtered;
  }, [profiles, searchQuery, filterType, sortField]);

  const paginatedProfiles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProfiles.slice(start, start + pageSize);
  }, [filteredProfiles, currentPage]);

  const totalPages = Math.ceil(filteredProfiles.length / pageSize);

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === updatedProfile.id ? updatedProfile : p))
    );
    setProfileEditId(null);
  };

  const handleProfilesUpdate = (updatedProfiles: Profile[]) => {
    setProfiles((prev) => {
      const updatedIds = new Set(updatedProfiles.map((p) => p.id));
      return prev.map((p) => updatedIds.has(p.id) ? updatedProfiles.find(up => up.id === p.id)! : p);
    });
    setBatchEditOpen(false);
  };

  const toggleDiffSelection = (profileId: string) => {
    setSelectedForDiff((prev) => {
      if (prev.includes(profileId)) {
        return prev.filter((id) => id !== profileId);
      }
      if (prev.length >= 2) {
        return [prev[1], profileId];
      }
      return [...prev, profileId];
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setBatchEditOpen(true)}
          variant="default"
          className="gap-2"
        >
          Batch Edit
        </Button>

        <Button
          onClick={() => setDiffMode(!diffMode)}
          variant={diffMode ? "secondary" : "outline"}
          className="gap-2"
        >
          <GitCompare className="h-4 w-4" />
          {diffMode ? "Exit Diff Mode" : "Compare Profiles"}
        </Button>

        <Button
          onClick={() => exportProfiles(filteredProfiles, "json")}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export JSON
        </Button>

        <Button
          onClick={() => exportProfiles(filteredProfiles, "csv")}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Diff Mode */}
      {diffMode && selectedForDiff.length === 2 && (
        <ProfileDiffTool
          profileAId={selectedForDiff[0]}
          profileBId={selectedForDiff[1]}
          profiles={profiles}
        />
      )}

      {/* Profile List Table */}
      <ProfileListTable
        profiles={paginatedProfiles}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterChange={setFilterType}
        sortField={sortField}
        onSortChange={setSortField}
        onEditProfile={setProfileEditId}
        getCompletenessPercentage={getCompletenessPercentage}
        getStatus={getStatus}
        diffMode={diffMode}
        selectedForDiff={selectedForDiff}
        onToggleDiffSelection={toggleDiffSelection}
      />

      {/* Modals */}
      {batchEditOpen && (
        <BatchEditModal
          open={batchEditOpen}
          onOpenChange={setBatchEditOpen}
          profiles={filteredProfiles}
          onProfilesUpdate={handleProfilesUpdate}
        />
      )}

      {/* ProfileEditModal removed */}
    </div>
  );
}
