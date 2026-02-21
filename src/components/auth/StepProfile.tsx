import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Upload, X, Loader2, Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";

interface StepProfileProps {
  onComplete: () => void;
}

const SPECIALTIES_OPTIONS = [
  "Relaxation Massage", "Therapeutic Massage", "Sports Massage",
  "Shiatsu", "Reflexology", "Lymphatic Drainage", "Tantric Massage",
  "Thai Massage", "Hot Stones", "Aromatherapy", "Chiropractic",
];

const LANGUAGES_OPTIONS = ["Portuguese", "English", "Spanish", "French", "German", "Italian"];

export const StepProfile = ({ onComplete }: StepProfileProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<{ file: File; preview: string; status: string }[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const [profile, setProfile] = useState({
    display_name: "",
    bio: "",
    phone: "",
    city: "",
    state: "",
    specialties: [] as string[],
    certifications: [] as string[],
    languages: [] as string[],
    incall_price: "",
    outcall_price: "",
    presentation_video_url: "",
    social_media: { instagram: "", website: "" },
  });

  const [newCertification, setNewCertification] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [photoTermsAccepted, setPhotoTermsAccepted] = useState(false);
  const [adTermsAccepted, setAdTermsAccepted] = useState(false);

  const allTermsAccepted = termsAccepted && photoTermsAccepted && adTermsAccepted;

  const toggleArrayItem = (arr: string[], item: string) => {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
    }));
    setPhotos(prev => [...prev, ...newPhotos].slice(0, 10));
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const uploadAndModeratePhotos = async (profileId: string) => {
    setUploadingPhotos(true);
    const results = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      try {
        const filePath = `${user!.id}/${Date.now()}_${photo.file.name}`;
        
        const { data: photoRecord, error: insertError } = await supabase
          .from('profile_photos')
          .insert({
            profile_id: profileId,
            storage_path: filePath,
            is_primary: i === 0,
            sort_order: i,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const base64 = await fileToBase64(photo.file);

        const { data: modResult, error: modError } = await supabase.functions.invoke('moderate-photo', {
          body: { photo_id: photoRecord.id, image_base64: base64 },
        });

        if (modError) {
          console.error('Moderation error:', modError);
          results.push({ ...photo, status: 'error' });
        } else {
          results.push({ ...photo, status: modResult.approved ? 'approved' : 'rejected' });
        }

        setPhotos(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: modResult?.approved ? 'approved' : modResult ? 'rejected' : 'error' } : p
        ));
      } catch (err: any) {
        console.error('Photo upload error:', err);
        results.push({ ...photo, status: 'error' });
      }
    }

    setUploadingPhotos(false);
    return results;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name || null,
          bio: profile.bio || null,
          phone: profile.phone || null,
          city: profile.city || null,
          state: profile.state || null,
          specialties: profile.specialties,
          certifications: profile.certifications,
          languages: profile.languages,
          incall_price: profile.incall_price ? parseFloat(profile.incall_price) : null,
          outcall_price: profile.outcall_price ? parseFloat(profile.outcall_price) : null,
          presentation_video_url: profile.presentation_video_url || null,
          social_media: profile.social_media,
          status: "pending_approval",
          is_active: false,
          terms_accepted_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (profileError) throw profileError;

      if (photos.length > 0 && profileData) {
        const results = await uploadAndModeratePhotos(profileData.id);
        const rejected = results.filter(r => r.status === 'rejected');
        if (rejected.length > 0) {
          toast({
            title: `${rejected.length} photo(s) rejected`,
            description: "Some photos did not pass content moderation.",
            variant: "destructive",
          });
        }
      }

      onComplete();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-1">Complete Your Profile</h3>
        <p className="text-sm text-muted-foreground">Fill in your information and add professional photos</p>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Basic Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Display Name</Label>
            <Input value={profile.display_name} onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))} placeholder="How you want to be called" className="bg-white/5 border-white/10" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 555 123 4567" className="bg-white/5 border-white/10" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>City</Label>
            <Input value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} placeholder="New York" className="bg-white/5 border-white/10" />
          </div>
          <div>
            <Label>State</Label>
            <Input value={profile.state} onChange={e => setProfile(p => ({ ...p, state: e.target.value }))} placeholder="NY" className="bg-white/5 border-white/10" />
          </div>
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself and your experience..." className="bg-white/5 border-white/10 min-h-[100px]" />
        </div>
      </div>

      {/* Specialties */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Specialties</h4>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES_OPTIONS.map(spec => (
            <button
              key={spec}
              type="button"
              onClick={() => setProfile(p => ({ ...p, specialties: toggleArrayItem(p.specialties, spec) }))}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                profile.specialties.includes(spec)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/30'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Languages</h4>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES_OPTIONS.map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => setProfile(p => ({ ...p, languages: toggleArrayItem(p.languages, lang) }))}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                profile.languages.includes(lang)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/30'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Certifications</h4>
        <div className="flex gap-2">
          <Input value={newCertification} onChange={e => setNewCertification(e.target.value)} placeholder="Add certification..." className="bg-white/5 border-white/10" />
          <Button type="button" variant="outline" size="sm" onClick={() => {
            if (newCertification.trim()) {
              setProfile(p => ({ ...p, certifications: [...p.certifications, newCertification.trim()] }));
              setNewCertification("");
            }
          }}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.certifications.map((cert, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-xs bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
              {cert}
              <button onClick={() => setProfile(p => ({ ...p, certifications: p.certifications.filter((_, idx) => idx !== i) }))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Pricing</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Incall ($)</Label>
            <Input type="number" value={profile.incall_price} onChange={e => setProfile(p => ({ ...p, incall_price: e.target.value }))} placeholder="150.00" className="bg-white/5 border-white/10" />
          </div>
          <div>
            <Label>Outcall ($)</Label>
            <Input type="number" value={profile.outcall_price} onChange={e => setProfile(p => ({ ...p, outcall_price: e.target.value }))} placeholder="200.00" className="bg-white/5 border-white/10" />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Social Media</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Instagram</Label>
            <Input value={profile.social_media.instagram} onChange={e => setProfile(p => ({ ...p, social_media: { ...p.social_media, instagram: e.target.value } }))} placeholder="@youruser" className="bg-white/5 border-white/10" />
          </div>
          <div>
            <Label>Website</Label>
            <Input value={profile.social_media.website} onChange={e => setProfile(p => ({ ...p, social_media: { ...p.social_media, website: e.target.value } }))} placeholder="https://..." className="bg-white/5 border-white/10" />
          </div>
        </div>
      </div>

      {/* Video */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Presentation Video</h4>
        <div>
          <Label>Video URL (YouTube or Vimeo)</Label>
          <Input value={profile.presentation_video_url} onChange={e => setProfile(p => ({ ...p, presentation_video_url: e.target.value }))} placeholder="https://youtube.com/..." className="bg-white/5 border-white/10" />
        </div>
      </div>

      {/* Photos */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Professional Photos</h4>
        <p className="text-xs text-muted-foreground">Add up to 10 professional photos. All go through automatic moderation.</p>
        
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
              <img src={photo.preview} alt="" className="w-full h-full object-cover" />
              {photo.status === 'approved' && (
                <div className="absolute top-1 right-1 bg-primary rounded-full p-1">
                  <Camera className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              {photo.status === 'rejected' && (
                <div className="absolute inset-0 bg-destructive/50 flex items-center justify-center">
                  <X className="w-6 h-6 text-white" />
                </div>
              )}
              <button
                onClick={() => removePhoto(idx)}
                className="absolute top-1 left-1 bg-black/60 rounded-full p-1 hover:bg-black/80"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
              {idx === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-primary px-1.5 py-0.5 rounded text-primary-foreground font-medium">Primary</span>}
            </div>
          ))}
          
          {photos.length < 10 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-white/40 transition-colors"
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Add</span>
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" />
      </div>

      {/* Terms & Policy Acceptance */}
      <div className="space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Terms & Policy Acceptance</h4>

        <div className="flex items-start gap-3">
          <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(v === true)} className="mt-0.5" />
          <Label htmlFor="terms" className="text-sm leading-relaxed font-normal cursor-pointer">
            I have read and agree to the{" "}
            <Link to="/terms" target="_blank" className="text-primary underline underline-offset-2 hover:text-primary/80">Terms of Service</Link>{" "}and{" "}
            <Link to="/privacy" target="_blank" className="text-primary underline underline-offset-2 hover:text-primary/80">Privacy Policy</Link>.
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox id="photo-terms" checked={photoTermsAccepted} onCheckedChange={(v) => setPhotoTermsAccepted(v === true)} className="mt-0.5" />
          <Label htmlFor="photo-terms" className="text-sm leading-relaxed font-normal cursor-pointer">
            I confirm my photos are recent (within 12 months), fully clothed, and comply with the Photo Guidelines. No nudity, sexual poses, or stock photos.
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox id="ad-terms" checked={adTermsAccepted} onCheckedChange={(v) => setAdTermsAccepted(v === true)} className="mt-0.5" />
          <Label htmlFor="ad-terms" className="text-sm leading-relaxed font-normal cursor-pointer">
            I confirm my profile description is accurate, professional, and does not contain sexual content, coded language, misleading claims, or deceptive pricing.
          </Label>
        </div>
      </div>

      <Button
        variant="hero"
        className="w-full"
        onClick={handleSubmit}
        disabled={isLoading || uploadingPhotos || !allTermsAccepted}
      >
        {isLoading || uploadingPhotos ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving profile...</>
        ) : (
          "Save Profile & Submit for Review"
        )}
      </Button>
    </div>
  );
};
