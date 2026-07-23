import { Suspense } from "react";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { ProfileCMSClient } from "./_components/ProfileCMSClient";
import type { Profile } from "@/lib/profile.types";

async function loadProfiles() {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("Failed to load profiles:", error);
    return [];
  }

  return (data || []) as Profile[];
}

export default async function ProfileCMSPage() {
  const profiles = await loadProfiles();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Profile Management"
        description="Manage, edit, and batch update therapist profiles"
      />

      <Suspense fallback={<div className="text-center py-10">Loading profiles...</div>}>
        <ProfileCMSClient initialProfiles={profiles} />
      </Suspense>
    </div>
  );
}
