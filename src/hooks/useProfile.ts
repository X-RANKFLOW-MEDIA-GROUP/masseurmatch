import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    setProfile(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Tables<"profiles">>) => {
    if (!user || !profile) return { error: new Error("No profile") };

    // Determine if this is a content edit that should trigger re-approval
    const contentFields = ["display_name", "bio", "phone", "specialties", "certifications", "languages", "presentation_video_url", "social_media", "incall_price", "outcall_price", "city", "state"];
    const isContentEdit = Object.keys(updates).some(k => contentFields.includes(k));

    // If it's a content edit and not already explicitly setting status, set pending
    if (isContentEdit && !("status" in updates)) {
      updates.status = "pending_approval";
      updates.is_active = false;
      updates.is_verified_profile = false;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id);
    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
    }
    return { error };
  };

  return { profile, loading, updateProfile, refetch: fetchProfile };
};
