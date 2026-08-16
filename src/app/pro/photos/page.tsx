"use client";

import Image from "next/image";
import { Camera, CheckCircle2, Clock, Loader2, Star, Trash2, UploadCloud, XCircle } from "lucide-react";
import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

type TabKey = "approved" | "pending" | "rejected";
type PhotoRecord = {
  id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
  moderation_status: string;
  moderation_reason: string | null;
  created_at: string | null;
};

type PhotosResponse = {
  ok?: boolean;
  error?: string;
  photos?: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    sortOrder: number;
    status: string;
    reason: string | null;
    createdAt: string | null;
  }>;
};

type UploadResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  photo?: {
    id: string;
    url: string;
    isPrimary: boolean;
    sortOrder: number;
    status: "approved" | "pending";
  };
};

export default function PhotoManagerPage() {
  const { toast } = useToast();
  const { profile, loading: profileLoading } = useProfile();
  const { maxPhotos, planLabel, isTrial, isLoading: limitsLoading } = usePlanLimits();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("approved");
  const [agreedToPhotoRules, setAgreedToPhotoRules] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState("");

  const fetchPhotos = useCallback(async () => {
    if (!profile?.id) {
      setPhotos([]);
      setPhotosLoading(false);
      return;
    }

    setPhotosLoading(true);
    try {
      const response = await fetch("/api/provider/photos", { credentials: "same-origin", cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as PhotosResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Could not load your photos.");
      }

      setPhotos((payload.photos ?? []).map((photo) => ({
        id: photo.id,
        url: photo.url,
        is_primary: photo.isPrimary,
        sort_order: photo.sortOrder,
        moderation_status: photo.status,
        moderation_reason: photo.reason,
        created_at: photo.createdAt,
      })));
    } catch (error) {
      toast({
        title: "Could not load your photos",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      setPhotos([]);
    } finally {
      setPhotosLoading(false);
    }
  }, [profile?.id, toast]);

  useEffect(() => {
    void fetchPhotos();
  }, [fetchPhotos]);

  const approvedPhotos = useMemo(() => photos.filter((photo) => photo.moderation_status === "approved"), [photos]);
  const pendingPhotos = useMemo(() => photos.filter((photo) => !photo.moderation_status || photo.moderation_status === "pending"), [photos]);
  const rejectedPhotos = useMemo(() => photos.filter((photo) => photo.moderation_status === "rejected"), [photos]);
  const photosByTab = { approved: approvedPhotos, pending: pendingPhotos, rejected: rejectedPhotos };

  function handleSelectFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    const remainingSlots = Math.max(0, maxPhotos - photos.length);

    if (remainingSlots <= 0) {
      toast({
        title: "Photo limit reached",
        description: isTrial
          ? `During your free trial you can upload up to ${maxPhotos} photos.`
          : `Your ${planLabel} plan allows up to ${maxPhotos} photos.`,
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    const valid = files.filter((file) => {
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type);
      const withinSize = file.size <= 10 * 1024 * 1024;
      return allowed && withinSize;
    });

    const accepted = valid.slice(0, remainingSlots);
    if (accepted.length !== files.length) {
      toast({
        title: "Some files were skipped",
        description: "Use JPEG, PNG, or WebP images under 10 MB and stay within your plan photo limit.",
      });
    }
    setSelectedFiles(accepted);
  }

  async function uploadOne(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/provider/photos/upload", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    });
    const payload = (await response.json().catch(() => ({}))) as UploadResponse;
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || payload.message || "Could not upload this photo.");
    }
    return payload.photo;
  }

  async function handleUpload() {
    if (!profile?.id) {
      toast({ title: "Profile unavailable", description: "Reload the page and try again.", variant: "destructive" });
      return;
    }
    if (!agreedToPhotoRules) {
      toast({ title: "Confirm photo rules", description: "Check the declaration before uploading.", variant: "destructive" });
      return;
    }
    if (selectedFiles.length === 0) {
      toast({ title: "Select a photo first", description: "Choose at least one image.", variant: "destructive" });
      return;
    }

    setUploading(true);
    let approved = 0;
    let pending = 0;
    try {
      for (const file of selectedFiles) {
        setUploadLabel(file.name);
        const result = await uploadOne(file);
        if (result?.status === "approved") approved += 1;
        else pending += 1;
      }

      await fetchPhotos();
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setActiveTab(pending > 0 ? "pending" : "approved");
      toast({
        title: "Photos uploaded",
        description: pending > 0
          ? `${approved} approved automatically. ${pending} awaiting review.`
          : `${approved} photo(s) approved automatically and published.`,
      });
    } catch (error) {
      toast({
        title: "Could not complete the upload",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      await fetchPhotos();
    } finally {
      setUploading(false);
      setUploadLabel("");
    }
  }

  async function deletePhoto(photoId: string) {
    const response = await fetch(`/api/provider/photos/${photoId}`, { method: "DELETE", credentials: "same-origin" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast({
        title: "Could not remove photo",
        description: typeof payload?.error === "string" ? payload.error : "Please try again.",
        variant: "destructive",
      });
      return;
    }
    await fetchPhotos();
    toast({ title: "Photo removed", description: "Your gallery has been updated." });
  }

  async function setPrimaryPhoto(photoId: string) {
    if (!profile?.id) return;
    const { error: resetError } = await supabase
      .from("profile_photos")
      .update({ is_primary: false })
      .eq("profile_id", profile.id);
    if (resetError) {
      toast({ title: "Could not update primary photo", description: resetError.message, variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("profile_photos").update({ is_primary: true }).eq("id", photoId);
    if (error) {
      toast({ title: "Could not update primary photo", description: error.message, variant: "destructive" });
      return;
    }
    await fetchPhotos();
    toast({ title: "Primary photo updated" });
  }

  if (profileLoading || limitsLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>;
  }

  const visiblePhotos = photosByTab[activeTab];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 pb-32 sm:p-6 md:p-10">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white"><Camera className="h-5 w-5" /></div>
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-950">Photos</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Upload directly to your profile. Each image is automatically reviewed. Approved images publish without sending your entire profile back to admin review.</p>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Add photos</h2>
            <p className="mt-1 text-sm text-slate-500">{planLabel}: {photos.length}/{maxPhotos} photos used.</p>
          </div>
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading || photos.length >= maxPhotos} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50">
            <UploadCloud className="h-4 w-4" /> Choose photos
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleSelectFiles} />

        {selectedFiles.length > 0 && (
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{selectedFiles.length} file(s) ready</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {selectedFiles.map((file) => <li key={`${file.name}-${file.size}`}>{file.name}</li>)}
            </ul>
          </div>
        )}

        <label className="mt-5 flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={agreedToPhotoRules} onChange={(event) => setAgreedToPhotoRules(event.target.checked)} className="mt-1" />
          <span>I confirm these photos are mine to publish and comply with the professional, nonsexual MasseurMatch photo policy.</span>
        </label>

        <button type="button" onClick={handleUpload} disabled={uploading || selectedFiles.length === 0 || !agreedToPhotoRules} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-slate-950 px-6 font-bold text-white disabled:opacity-50">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
          {uploading ? `Uploading ${uploadLabel || "photo"}` : "Upload and review"}
        </button>
      </section>

      <section>
        <div className="flex flex-wrap gap-2">
          {([
            ["approved", "Approved", approvedPhotos.length, CheckCircle2],
            ["pending", "Pending", pendingPhotos.length, Clock],
            ["rejected", "Rejected", rejectedPhotos.length, XCircle],
          ] as const).map(([key, label, count, Icon]) => (
            <button key={key} type="button" onClick={() => setActiveTab(key)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${activeTab === key ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"}`}>
              <Icon className="h-4 w-4" /> {label} ({count})
            </button>
          ))}
        </div>

        {photosLoading ? (
          <div className="flex min-h-48 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>
        ) : visiblePhotos.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No {activeTab} photos.</div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePhotos.map((photo) => (
              <article key={photo.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-slate-100">
                  {photo.url ? <Image src={photo.url} alt="Provider profile photo" fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-contain" /> : null}
                  {photo.is_primary ? <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-900 shadow"><Star className="h-3.5 w-3.5 fill-current" /> Primary</span> : null}
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{photo.moderation_status || "pending"}</div>
                  <div className="flex gap-2">
                    {!photo.is_primary && photo.moderation_status === "approved" ? (
                      <button type="button" onClick={() => setPrimaryPhoto(photo.id)} className="rounded-lg border border-slate-200 p-2 text-slate-700" aria-label="Set as primary"><Star className="h-4 w-4" /></button>
                    ) : null}
                    <button type="button" onClick={() => deletePhoto(photo.id)} className="rounded-lg border border-rose-200 p-2 text-rose-600" aria-label="Delete photo"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
