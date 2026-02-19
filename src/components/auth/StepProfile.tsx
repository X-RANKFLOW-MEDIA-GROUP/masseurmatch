import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Upload, X, Loader2, Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface StepProfileProps {
  onComplete: () => void;
}

const SPECIALTIES_OPTIONS = [
  "Massagem Relaxante", "Massagem Terapêutica", "Massagem Desportiva",
  "Shiatsu", "Reflexologia", "Drenagem Linfática", "Massagem Tantrica",
  "Thai Massage", "Hot Stones", "Aromaterapia", "Quiropraxia",
];

const LANGUAGES_OPTIONS = ["Português", "English", "Español", "Français", "Deutsch", "Italiano"];

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
        // Upload to storage-like path (using profile_photos table)
        const filePath = `${user!.id}/${Date.now()}_${photo.file.name}`;
        
        // Insert photo record
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

        // Convert to base64 for moderation
        const base64 = await fileToBase64(photo.file);

        // Call moderation edge function
        const { data: modResult, error: modError } = await supabase.functions.invoke('moderate-photo', {
          body: { photo_id: photoRecord.id, image_base64: base64 },
        });

        if (modError) {
          console.error('Moderation error:', modError);
          results.push({ ...photo, status: 'error' });
        } else {
          results.push({ ...photo, status: modResult.approved ? 'approved' : 'rejected' });
        }

        // Update local state
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
      // Update profile
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
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (profileError) throw profileError;

      // Upload and moderate photos
      if (photos.length > 0 && profileData) {
        const results = await uploadAndModeratePhotos(profileData.id);
        const rejected = results.filter(r => r.status === 'rejected');
        if (rejected.length > 0) {
          toast({
            title: `${rejected.length} foto(s) rejeitada(s)`,
            description: "Algumas fotos não passaram na moderação de conteúdo.",
            variant: "destructive",
          });
        }
      }

      onComplete();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-1">Complete seu Perfil</h3>
        <p className="text-sm text-muted-foreground">Preencha suas informações e adicione fotos profissionais</p>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Informações Básicas</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nome de exibição</Label>
            <Input value={profile.display_name} onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))} placeholder="Como deseja ser chamado" className="bg-white/5 border-white/10" />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+55 11 99999-9999" className="bg-white/5 border-white/10" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Cidade</Label>
            <Input value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} placeholder="São Paulo" className="bg-white/5 border-white/10" />
          </div>
          <div>
            <Label>Estado</Label>
            <Input value={profile.state} onChange={e => setProfile(p => ({ ...p, state: e.target.value }))} placeholder="SP" className="bg-white/5 border-white/10" />
          </div>
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Conte sobre você e sua experiência..." className="bg-white/5 border-white/10 min-h-[100px]" />
        </div>
      </div>

      {/* Specialties */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Especialidades</h4>
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
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Idiomas</h4>
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
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Certificações</h4>
        <div className="flex gap-2">
          <Input value={newCertification} onChange={e => setNewCertification(e.target.value)} placeholder="Adicionar certificação..." className="bg-white/5 border-white/10" />
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
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Preços</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Incall (R$)</Label>
            <Input type="number" value={profile.incall_price} onChange={e => setProfile(p => ({ ...p, incall_price: e.target.value }))} placeholder="150.00" className="bg-white/5 border-white/10" />
          </div>
          <div>
            <Label>Outcall (R$)</Label>
            <Input type="number" value={profile.outcall_price} onChange={e => setProfile(p => ({ ...p, outcall_price: e.target.value }))} placeholder="200.00" className="bg-white/5 border-white/10" />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Redes Sociais</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Instagram</Label>
            <Input value={profile.social_media.instagram} onChange={e => setProfile(p => ({ ...p, social_media: { ...p.social_media, instagram: e.target.value } }))} placeholder="@seuuser" className="bg-white/5 border-white/10" />
          </div>
          <div>
            <Label>Website</Label>
            <Input value={profile.social_media.website} onChange={e => setProfile(p => ({ ...p, social_media: { ...p.social_media, website: e.target.value } }))} placeholder="https://..." className="bg-white/5 border-white/10" />
          </div>
        </div>
      </div>

      {/* Video */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Vídeo de Apresentação</h4>
        <div>
          <Label>URL do vídeo (YouTube ou Vimeo)</Label>
          <Input value={profile.presentation_video_url} onChange={e => setProfile(p => ({ ...p, presentation_video_url: e.target.value }))} placeholder="https://youtube.com/..." className="bg-white/5 border-white/10" />
        </div>
      </div>

      {/* Photos */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Fotos Profissionais</h4>
        <p className="text-xs text-muted-foreground">Adicione até 10 fotos profissionais. Todas passam por moderação automática.</p>
        
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
              {idx === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-primary px-1.5 py-0.5 rounded text-primary-foreground font-medium">Principal</span>}
            </div>
          ))}
          
          {photos.length < 10 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-white/40 transition-colors"
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Adicionar</span>
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" />
      </div>

      <Button
        variant="hero"
        className="w-full"
        onClick={handleSubmit}
        disabled={isLoading || uploadingPhotos}
      >
        {isLoading || uploadingPhotos ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando perfil...</>
        ) : (
          "Salvar Perfil e Enviar para Análise"
        )}
      </Button>
    </div>
  );
};
