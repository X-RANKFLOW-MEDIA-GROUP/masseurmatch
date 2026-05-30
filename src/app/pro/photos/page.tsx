"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot,
  Camera,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldAlert,
  Star,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { type ChangeEvent, type ComponentType, useEffect, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

type TabKey = "approved" | "pending" | "rejected";
type UploadState = "idle" | "scanning" | "uploaded";

type PhotoRecord = Tables<"profile_photos"> & {
  id: string;
  storage_path?: string | null;
  url?: string | null;
  moderation_status?: string | null;
  moderation_reason?: string | null;
  is_primary?: boolean | null;
  sort_order?: number | null;
  position?: number | null;
};

function getPhotoUrl(photo: PhotoRecord) {
  return photo.storage_path || photo.url || "";
}

function getUploadError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Could not complete the upload right now.";
}

function getProfileDisplayName(profile: Tables<"profiles"> | null) {
  if (!profile) {
    return null;
  }

  return profile.display_name || profile.full_name || null;
}

export default function PhotoManagerPage() {
  const { toast } = useToast();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { maxPhotos, planLabel, isLoading: limitsLoading } = usePlanLimits();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("approved");
  const [agreedToPhotoRules, setAgreedToPhotoRules] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [scanLabel, setScanLabel] = useState("file");

  const fetchPhotos = async () => {
    if (!profile?.id) {
      setPhotos([]);
      setPhotosLoading(false);
      return;
    }

    setPhotosLoading(true);
    const { data, error } = await supabase
      .from("profile_photos")
      .select("*")
      .eq("profile_id", profile.id)
      .order("sort_order", { ascending: true });

    if (error) {
      toast({
        title: "Could not load your photos",
        description: error.message,
        variant: "destructive",
      });
      setPhotos([]);
    } else {
      setPhotos((data ?? []) as PhotoRecord[]);
    }

    setPhotosLoading(false);
  };

  useEffect(() => {
    const loadPhotos = async () => {
      if (!profile?.id) {
        setPhotos([]);
        setPhotosLoading(false);
        return;
      }

      setPhotosLoading(true);
      const { data, error } = await supabase
        .from("profile_photos")
        .select("*")
        .eq("profile_id", profile.id)
        .order("sort_order", { ascending: true });

      if (error) {
        toast({
          title: "Could not load your photos",
          description: error.message,
          variant: "destructive",
        });
        setPhotos([]);
      } else {
        setPhotos((data ?? []) as PhotoRecord[]);
      }

      setPhotosLoading(false);
    };

    void loadPhotos();
  }, [profile?.id, toast]);

  const approvedPhotos = photos.filter((photo) => photo.moderation_status === "approved");
  const rejectedPhotos = photos.filter((photo) => photo.moderation_status === "rejected");
  const pendingPhotos = photos.filter(
    (photo) => !photo.moderation_status || photo.moderation_status === "pending",
  );

  const photosByTab: Record<TabKey, PhotoRecord[]> = {
    approved: approvedPhotos,
    pending: pendingPhotos,
    rejected: rejectedPhotos,
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const { data: signData, error: signError } = await supabase.functions.invoke("cloudinary-sign");

    if (signError || !signData) {
      throw new Error(signError?.message || "Could not prepare the upload.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signData.api_key);
    formData.append("timestamp", String(signData.timestamp));
    formData.append("signature", signData.signature);
    formData.append("folder", signData.folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      throw new Error(payload?.error?.message || "Upload service rejected the file.");
    }

    const payload = (await response.json()) as { secure_url?: string };

    if (!payload.secure_url) {
      throw new Error("The image was uploaded but we did not receive the final URL.");
    }

    return payload.secure_url;
  };

  const handleSelectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      setSelectedFiles([]);
      return;
    }

    const remainingSlots = Math.max(0, maxPhotos - photos.length);

    if (remainingSlots <= 0) {
      toast({
        title: "Photo limit reached",
        description: `Seu plano ${planLabel} permite ate ${maxPhotos} fotos.`,
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    const acceptedFiles = files.slice(0, remainingSlots);
    if (acceptedFiles.length < files.length) {
      toast({
        title: "Plan photo limit applied",
        description: `Only ${acceptedFiles.length} file(s) were selected now.`,
      });
    }

    setSelectedFiles(acceptedFiles);
  };

  const handleUpload = async () => {
    if (!profile?.id) {
      toast({
        title: "Profile unavailable",
        description: "Reload the page before uploading images.",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToPhotoRules) {
      toast({
        title: "Confirm photo rules",
        description: "Check the declaration box before uploading your photos.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "Select a photo first",
        description: "Choose at least one file to add to the review queue.",
        variant: "destructive",
      });
      return;
    }

    setUploadState("scanning");
    let moderationUnavailable = false;
    let approvedCount = 0;
    let flaggedCount = 0;

    try {
      for (const [index, file] of selectedFiles.entries()) {
        setScanLabel(file.name);

        const imageUrl = await uploadToCloudinary(file);
        const nextPosition = photos.length + index;

        const { data: photoRecord, error: insertError } = await supabase
          .from("profile_photos")
          .insert({
            profile_id: profile.id,
            storage_path: imageUrl,
            is_primary: photos.length === 0 && index === 0,
            sort_order: nextPosition,
          })
          .select()
          .single();

        if (insertError || !photoRecord) {
          throw new Error(insertError?.message || "Could not register the photo.");
        }

        const insertedPhoto = photoRecord as { id: string };

        const { error: queueInsertError } = await supabase.from("moderation_queue").insert({
          profile_id: profile.id,
          user_id: profile.user_id,
          target_id: insertedPhoto.id,
          item_type: "photo",
          source: "pro_photos",
          field_name: null,
          status: "pending",
          priority: "normal",
          moderation_provider: "sightengine",
          moderation_reason: "queued_for_ai_review",
          snapshot: {
            photoId: insertedPhoto.id,
            imageUrl,
            isPrimary: photos.length === 0 && index === 0,
            sortOrder: nextPosition,
            displayName: getProfileDisplayName(profile),
            originalFileName: file.name,
          },
          ai_response: null,
        });

        if (queueInsertError) {
          console.error("[pro/photos] could not queue photo moderation item:", queueInsertError.message);
        }

        const { data: moderationData, error: moderationError } = await supabase.functions.invoke(
          "moderate-photo",
          {
            body: {
              photo_id: insertedPhoto.id,
              image_url: imageUrl,
            },
          },
        );

        if (moderationError) {
          moderationUnavailable = true;
          await supabase
            .from("profile_photos")
            .update({
              moderation_status: "pending",
              moderation_reason: "manual_review_required",
            })
            .eq("id", insertedPhoto.id);
        } else if (moderationData?.approved === false) {
          flaggedCount += 1;
        } else {
          approvedCount += 1;
        }
      }

      await updateProfile({
        status: "pending_approval",
        is_active: false,
        is_verified_photos: false,
      });

      await fetchPhotos();
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setUploadState("uploaded");
      toast({
        title: moderationUnavailable
          ? "Part of the batch went to manual review"
          : flaggedCount > 0
            ? "Sightengine flagged some photos for curation"
            : "Sightengine approved your photos",
        description: moderationUnavailable
          ? "At least one file is pending human curation."
          : flaggedCount > 0
            ? `${approvedCount} approved and ${flaggedCount} sent for manual review.`
            : `${approvedCount} photo(s) approved and ready for the gallery.`,
      });

      if (moderationUnavailable || flaggedCount > 0) {
        setActiveTab("pending");
      } else {
        setActiveTab("approved");
      }

      window.setTimeout(() => {
        setUploadState("idle");
      }, 3200);
    } catch (error) {
      setUploadState("idle");
      toast({
        title: "Could not complete the upload",
        description: getUploadError(error),
        variant: "destructive",
      });
    }
  };

  const deletePhoto = async (photoId: string) => {
    const { error } = await supabase.from("profile_photos").delete().eq("id", photoId);

    if (error) {
      toast({
        title: "Could not remove photo",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    await updateProfile({
      status: "pending_approval",
      is_active: false,
      is_verified_photos: false,
    });
    await fetchPhotos();
    toast({
      title: "Photo removed",
      description: "Gallery updated.",
    });
  };

  const setPrimaryPhoto = async (photoId: string) => {
    if (!profile?.id) {
      return;
    }

    const { error: resetError } = await supabase
      .from("profile_photos")
      .update({ is_primary: false })
      .eq("profile_id", profile.id);

    if (resetError) {
      toast({
        title: "Could not update primary photo",
        description: resetError.message,
        variant: "destructive",
      });
      return;
    }

    const { error: primaryError } = await supabase
      .from("profile_photos")
      .update({ is_primary: true })
      .eq("id", photoId);

    if (primaryError) {
      toast({
        title: "Could not update primary photo",
        description: primaryError.message,
        variant: "destructive",
      });
      return;
    }

    await fetchPhotos();
    toast({
      title: "Primary photo updated",
      description: "Your gallery now shows the new order.",
    });
  };

  if (profileLoading || limitsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 pb-32 md:p-10">
      <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
          <Bot className="h-5 w-5 text-slate-700" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-medium text-slate-900">Photo Manager</h1>
          <p className="font-sans text-sm leading-relaxed text-slate-600">
            Sightengine reviews each image before publication. Files with nudity,
            watermarks, contact information, logos, or low-confidence signals may be
            rejected automatically or sent for manual review.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-medium text-slate-900">Nova foto</h2>
            <p className="mt-2 font-sans text-sm text-slate-500">
              Plano atual: <span className="font-semibold text-slate-900">{planLabel}</span>. Voce
              pode manter ate <span className="font-semibold text-slate-900">{maxPhotos}</span> fotos.
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center transition-colors hover:border-slate-500 hover:bg-slate-100"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <UploadCloud className="h-5 w-5 text-slate-900" />
              </div>
              <div>
                <p className="font-sans text-sm font-semibold text-slate-900">
                  Click to choose images
                </p>
                <p className="mt-1 font-sans text-xs text-slate-500">
                  JPG, PNG or WEBP. Avoid heavy filters and photos with text.
                </p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleSelectFiles}
              className="hidden"
            />

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={agreedToPhotoRules}
                  onChange={(event) => setAgreedToPhotoRules(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="leading-relaxed">
                  Confirmo que estas imagens nao contem nudez explicita, logos, dados de contato,
                  marcas d agua ou elementos enganosos. Tambem concordo com as regras de imagem do{" "}
                  <Link href="/legal" className="font-semibold text-slate-900 underline underline-offset-4">
                    Legal Center
                  </Link>
                  .
                </span>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-sans text-sm font-semibold text-slate-900">
                  {selectedFiles.length} file(s) ready for review
                </p>
                <ul className="mt-3 space-y-2 font-sans text-sm text-slate-600">
                  {selectedFiles.map((file) => (
                    <li key={`${file.name}-${file.lastModified}`} className="truncate">
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={!agreedToPhotoRules || uploadState === "scanning" || selectedFiles.length === 0}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-sans text-sm font-semibold transition-all ${
                uploadState === "uploaded"
                  ? "bg-amber-500 text-white"
                  : agreedToPhotoRules && selectedFiles.length > 0
                    ? "bg-slate-950 text-white hover:bg-slate-800"
                    : "cursor-not-allowed bg-slate-200 text-slate-400"
              }`}
            >
              {uploadState === "idle" && (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Submit for Review
                </>
              )}

              {uploadState === "scanning" && (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  >
                    <ShieldAlert className="h-4 w-4 text-sky-300" />
                  </motion.div>
                  Sightengine lendo {scanLabel}
                </>
              )}

              {uploadState === "uploaded" && (
                <>
                  <Clock className="h-4 w-4" />
                  Analise concluida
                </>
              )}
            </button>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-medium text-slate-900">Padrao visual</h2>
            <ul className="mt-4 space-y-4 font-sans text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                Use fotos nitidas, recentes e coerentes com seu atendimento real.
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                Inclua pelo menos uma foto de rosto e imagens do espaco de atendimento.
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                Evite qualquer overlay, QR code, telefone, logo ou marca d agua.
              </li>
            </ul>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-1 pb-4">
            <div>
              <h2 className="font-display text-xl font-medium text-slate-900">Curation queue</h2>
              <p className="mt-1 font-sans text-sm text-slate-500">
                Real-time tracking of your gallery.
              </p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-sans text-xs text-slate-600">
              {photos.length} published or under review out of {maxPhotos}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <TabButton
              active={activeTab === "approved"}
              onClick={() => setActiveTab("approved")}
              icon={CheckCircle2}
              label="Approved"
              count={approvedPhotos.length}
              color="emerald"
            />
            <TabButton
              active={activeTab === "pending"}
              onClick={() => setActiveTab("pending")}
              icon={Clock}
              label="Under Review"
              count={pendingPhotos.length}
              color="amber"
            />
            <TabButton
              active={activeTab === "rejected"}
              onClick={() => setActiveTab("rejected")}
              icon={XCircle}
              label="Rejected"
              count={rejectedPhotos.length}
              color="rose"
            />
          </div>

          <div className="mt-6">
            {activeTab === "pending" && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-sans text-sm leading-relaxed text-amber-900">
                  Pending photos are awaiting human review. If AI cannot complete the scan,
                  the file remains held until the team curates it.
                </p>
              </div>
            )}

            {photosLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
              </div>
            ) : photosByTab[activeTab].length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
                <Camera className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-4 font-sans text-sm text-slate-500">
                  Nenhuma foto nesta categoria ainda.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {photosByTab[activeTab].map((photo) => (
                  <article
                    key={photo.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className="relative aspect-[4/5] bg-slate-100">
                      {getPhotoUrl(photo) ? (
                        <img
                          src={getPhotoUrl(photo)}
                          alt="Profile photo"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <Camera className="h-8 w-8" />
                        </div>
                      )}

                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold ${
                            photo.moderation_status === "approved"
                              ? "bg-emerald-50 text-emerald-700"
                              : photo.moderation_status === "rejected"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {photo.moderation_status === "approved"
                            ? "Approved"
                            : photo.moderation_status === "rejected"
                              ? "Rejected"
                              : "Pending"}
                        </span>

                        {photo.is_primary && (
                          <span className="rounded-full bg-slate-950 px-2.5 py-1 font-sans text-[11px] font-semibold text-white">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 p-4">
                      <div>
                        <p className="font-sans text-sm font-semibold text-slate-900">
                          {photo.is_primary ? "Primary photo" : "Gallery photo"}
                        </p>
                        <p className="mt-1 font-sans text-xs leading-relaxed text-slate-500">
                          {photo.moderation_reason
                            ? photo.moderation_reason.split("_").join(" ")
                            : "Sem observacoes da moderacao ate o momento."}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!photo.is_primary && activeTab === "approved" && (
                          <button
                            type="button"
                            onClick={() => setPrimaryPhoto(photo.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 font-sans text-xs font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
                          >
                            <Star className="h-3.5 w-3.5" />
                            Tornar principal
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => deletePhoto(photo.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 font-sans text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remover
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const TAB_STYLES: Record<string, { active: string; idle: string }> = {
  emerald: {
    active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    idle: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
  },
  amber: {
    active: "border-amber-200 bg-amber-50 text-amber-700",
    idle: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
  },
  rose: {
    active: "border-rose-200 bg-rose-50 text-rose-700",
    idle: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
  },
};

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: ComponentType<{ className?: string }>;
  label: string;
  count: number;
  color: string;
}) {
  const styles = TAB_STYLES[color] ?? TAB_STYLES.emerald;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active ? styles.active : styles.idle
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs">{count}</span>
    </button>
  );
}
