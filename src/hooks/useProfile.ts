import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (fetchError) throw fetchError;
      setProfile(data);
    } catch (err: any) {
      console.error("[useProfile] Error fetching profile:", err?.message);
      setError(err?.message || "Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Tables<"profiles">>) => {
    if (!user || !profile) return { error: new Error("No profile") };

    try {
      const textFields = ["display_name", "bio"] as const;
      const contentFields = ["display_name", "bio", "phone", "specialties", "certifications", "languages", "presentation_video_url", "social_media", "incall_price", "outcall_price", "city", "state", "zip_code", "pricing_sessions"];
      const isContentEdit = Object.keys(updates).some(k => contentFields.includes(k));

      // Auto-moderate text fields via SightEngine
      const textsToModerate: { field: string; value: string }[] = [];
      for (const field of textFields) {
        if (field in updates && updates[field]) {
          textsToModerate.push({ field, value: String(updates[field]) });
        }
      }
      // Also moderate specialties/certifications as joined text
      if (updates.specialties && Array.isArray(updates.specialties) && updates.specialties.length > 0) {
        textsToModerate.push({ field: "specialties", value: updates.specialties.join(", ") });
      }

      for (const { field, value } of textsToModerate) {
        const { data: modResult, error: modError } = await supabase.functions.invoke("moderate-text", {
          body: { profile_id: profile.id, text: value, field_name: field },
        });
        if (modError) {
          console.error("[useProfile] Moderation call failed:", modError.message);
          // Allow save if moderation service is down (fail-open for UX)
        } else if (modResult && !modResult.approved) {
          return {
            error: new Error(`Content rejected in "${field}": ${modResult.reason}`),
            moderation: modResult,
          };
        }
      }

      if (isContentEdit && !("status" in updates)) {
        updates.status = "pending_approval";
        updates.is_active = false;
        updates.is_verified_profile = false;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id);
      if (updateError) throw updateError;
      setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
      return { error: null };
    } catch (err: any) {
      console.error("[useProfile] Error updating profile:", err?.message);
      return { error: err };
    }
  };

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
};
