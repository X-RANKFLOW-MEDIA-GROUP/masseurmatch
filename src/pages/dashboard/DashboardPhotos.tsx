import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, X, Trash2, Camera, Loader2, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

const DashboardPhotos = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user || !profile) return;
    setUploading(true);

    for (const file of files) {
      try {
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { data: photoRecord, error } = await supabase
          .from("profile_photos")
          .insert({ profile_id: profile.id, storage_path: filePath, is_primary: photos.length === 0, sort_order: photos.length })
          .select()
          .single();
        if (error) throw error;

        // Moderate
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64 = (reader.result as string).split(",")[1];
          await supabase.functions.invoke("moderate-photo", {
            body: { photo_id: photoRecord.id, image_base64: base64 },
          });
          fetchPhotos();
        };
      } catch (err: any) {
        toast({ title: "Upload error", description: err.message, variant: "destructive" });
      }
    }

    // Set profile back to pending after photo upload
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

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Photos</h1>
          <p className="text-sm text-muted-foreground">Manage your professional photos. All photos go through moderation.</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          Add Photos
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
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
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
              <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                <Camera className="w-8 h-8" />
              </div>
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
          ))}
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
