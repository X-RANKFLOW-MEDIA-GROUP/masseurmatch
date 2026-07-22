"use client";

import { requestJson } from "@/app/_lib/request";
import { supabase } from "@/integrations/supabase/client";

type ProfileResponse = {
  ok: boolean;
  profile: {
    id: string;
    user_id: string;
  } | null;
};

type CloudinarySignature = {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  folder: string;
  signature: string;
};

export function withCloudinaryBackgroundRemoval(url: string) {
  if (!url.includes("/image/upload/") || url.includes("/image/upload/e_background_removal/")) return url;
  return url.replace("/image/upload/", "/image/upload/e_background_removal/");
}

export function withoutCloudinaryBackgroundRemoval(url: string) {
  return url.replace("/image/upload/e_background_removal/", "/image/upload/");
}

async function uploadToCloudinary(file: File) {
  const { data, error } = await supabase.functions.invoke<CloudinarySignature>("cloudinary-sign");
  if (error || !data) throw new Error(error?.message || "Could not prepare the photo upload.");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", data.api_key);
  formData.append("timestamp", String(data.timestamp));
  formData.append("signature", data.signature);
  formData.append("folder", data.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${data.cloud_name}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const payload = await response.json().catch(() => null) as { secure_url?: string; error?: { message?: string } } | null;
  if (!response.ok || !payload?.secure_url) {
    throw new Error(payload?.error?.message || "Cloudinary rejected the photo upload.");
  }
  return payload.secure_url;
}

export async function uploadSignupProfilePhotos({
  primary,
  gallery,
  removePrimaryBackground,
}: {
  primary: File | null;
  gallery: File[];
  removePrimaryBackground: boolean;
}) {
  if (!primary && gallery.length === 0) return { uploaded: 0 };

  const profileResponse = await requestJson<ProfileResponse>("/api/pro/profile");
  if (!profileResponse.profile) throw new Error("Your profile was saved, but its photo gallery is not ready yet.");

  const { id: profileId, user_id: userId } = profileResponse.profile;
  const files = [primary, ...gallery].filter((file): file is File => Boolean(file));
  let uploaded = 0;

  for (const [index, file] of files.entries()) {
    const originalUrl = await uploadToCloudinary(file);
    const isPrimary = Boolean(primary) && index === 0;
    // The transformed URL keeps the original Cloudinary asset intact. Removing
    // e_background_removal from the URL restores the original at any time.
    const displayUrl = isPrimary && removePrimaryBackground
      ? withCloudinaryBackgroundRemoval(originalUrl)
      : originalUrl;

    const { data: photo, error: insertError } = await supabase
      .from("profile_photos")
      .insert({
        profile_id: profileId,
        user_id: userId,
        storage_path: displayUrl,
        is_primary: isPrimary,
        sort_order: index,
        moderation_status: "pending",
        moderation_reason: "queued_for_ai_review",
      })
      .select("id")
      .single();

    if (insertError || !photo) {
      throw new Error(insertError?.message || "Could not save the uploaded photo.");
    }

    await supabase.functions.invoke("moderate-photo", {
      body: { photo_id: photo.id, image_url: displayUrl },
    }).catch(() => null);

    uploaded += 1;
  }

  return { uploaded };
}
