import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, X, Trash2, Camera, Loader2, GripVertical, Lock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

const DashboardPhotos = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const { maxPhotos, planLabel, isLoading: limitsLoading } = usePlanLimits();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Tables<"profile_photos">[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchPhotos = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("profile_photos")
      .select("*")
      .eq("profile_id", profile.id)
      .order("sort_order");
    setPhotos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPhotos(); }, [profile]);

  const atLimit = photos.length >= maxPhotos;

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const { data: signData, error: signError } = await supabase.functions.invoke('cloudinary-sign');
    if (signError || !signData) throw new Error(signError?.message || 'Failed to get upload signature');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signData.api_key);
    formData.append('timestamp', signData.timestamp.toString());
    formData.append('signature', signData.signature);
    formData.append('folder', signData.folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errBody = await res.json();
      throw new Error(errBody?.error?.message || 'Cloudinary upload failed');
    }

    const result = await res.json();
    return result.secure_url;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user || !profile) return;

    const remaining = maxPhotos - photos.length;
    if (remaining <= 0) {
      toast({ title: "Photo limit reached", description: `Your ${planLabel} plan allows up to ${maxPhotos} photos. Upgrade for more.`, variant: "destructive" });
      return;
    }

    const filesToUpload = files.slice(0, remaining);
    if (filesToUpload.length < files.length) {
      toast({ title: "Limit applied", description: `Only uploading ${filesToUpload.length} of ${files.length} photos (plan limit: ${maxPhotos}).` });
    }

    setUploading(true);

    for (const file of filesToUpload) {
      try {
        const imageUrl = await uploadToCloudinary(file);

        const { data: photoRecord, error } = await supabase
          .from("profile_photos")
          .insert({
            profile_id: profile.id,
            storage_path: imageUrl,
            is_primary: photos.length === 0,
            sort_order: photos.length,
          })
          .select()
          .single();
        if (error) throw error;

        await supabase.functions.invoke("moderate-photo", {
          body: { photo_id: photoRecord.id, image_url: imageUrl },
        });
        fetchPhotos();
      } catch (err: any) {
        toast({ title: "Upload error", description: err.message, variant: "destructive" });
      }
    }

    await updateProfile({ status: "pending_approval", is_active: false, is_verified_photos: false });
    setUploading(false);
    toast({ title: "Photos uploaded", description: "Your photos are being reviewed. Your profile is now under review." });
  };

  const deletePhoto = async (id: string) => {
    await supabase.from("profile_photos").delete().eq("id", id);
    await updateProfile({ status: "pending_approval", is_active: false, is_verified_photos: false });
    fetchPhotos();
    toast({ title: "Photo removed" });
  };

  const setPrimary = async (id: string) => {
    if (!profile) return;
    await supabase.from("profile_photos").update({ is_primary: false }).eq("profile_id", profile.id);
    await supabase.from("profile_photos").update({ is_primary: true }).eq("id", id);
    fetchPhotos();
    toast({ title: "Primary photo updated" });
  };

  const statusColor = (status: string) => {
    if (status === "approved") return "border-success/40 text-success";
    if (status === "rejected") return "border-destructive/40 text-destructive";
    return "border-warning/40 text-warning";
  };

  const getPhotoUrl = (photo: Tables<"profile_photos">) => {
    if (photo.storage_path.startsWith('http')) return photo.storage_path;
    return undefined;
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Photos</h1>
          <p className="text-sm text-muted-foreground">Manage your professional photos. All photos go through moderation.</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading || atLimit}>
          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : atLimit ? <Lock className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
          {atLimit ? "Limit Reached" : "Add Photos"}
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
      </div>

      {/* Plan limit indicator */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2">
        <span className="text-xs text-muted-foreground">
          Photos: <span className="font-semibold text-foreground">{photos.length}</span> / {maxPhotos} ({planLabel})
        </span>
        {atLimit && (
          <Link to="/dashboard/subscription">
            <Button variant="link" size="sm" className="text-xs h-auto p-0">
              Upgrade for more <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : photos.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-1">No photos yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Add professional photos to attract more clients.</p>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" /> Upload Photos
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo) => {
            const url = getPhotoUrl(photo);
            return (
              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                {url ? (
                  <img src={url} alt="Profile photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className={`text-[10px] ${statusColor(photo.moderation_status)}`}>
                    {photo.moderation_status === "approved" ? "Approved" : photo.moderation_status === "rejected" ? "Rejected" : "Pending"}
                  </Badge>
                </div>
                {photo.is_primary && (
                  <span className="absolute bottom-2 left-2 text-[10px] bg-primary px-1.5 py-0.5 rounded text-primary-foreground font-medium">Primary</span>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!photo.is_primary && (
                    <button onClick={() => setPrimary(photo.id)} className="bg-background/80 rounded p-1 hover:bg-background" title="Set as primary">
                      <Camera className="w-3 h-3" />
                    </button>
                  )}
                  <button onClick={() => deletePhoto(photo.id)} className="bg-background/80 rounded p-1 hover:bg-destructive/80" title="Remove">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quality Guidelines</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Clear, well-lit, professional photos</li>
          <li>• Minimum 500x500px recommended</li>
          <li>• Explicit content will be automatically rejected</li>
          <li>• The primary photo appears in the directory listing</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPhotos;
