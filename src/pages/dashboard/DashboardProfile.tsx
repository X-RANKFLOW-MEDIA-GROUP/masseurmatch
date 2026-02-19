import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X, Save } from "lucide-react";

const SPECIALTIES_OPTIONS = [
  "Massagem Relaxante", "Massagem Terapêutica", "Massagem Desportiva",
  "Shiatsu", "Reflexologia", "Drenagem Linfática", "Massagem Tantrica",
  "Thai Massage", "Hot Stones", "Aromaterapia", "Quiropraxia",
];

const LANGUAGES_OPTIONS = ["Português", "English", "Español", "Français", "Deutsch", "Italiano"];

const DashboardProfile = () => {
  const { profile, loading, updateProfile } = useProfile();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [newCert, setNewCert] = useState("");

  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    phone: "",
    specialties: [] as string[],
    certifications: [] as string[],
    languages: [] as string[],
    presentation_video_url: "",
    social_media: { instagram: "", website: "" } as Record<string, string>,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        phone: profile.phone || "",
        specialties: profile.specialties || [],
        certifications: profile.certifications || [],
        languages: profile.languages || [],
        presentation_video_url: profile.presentation_video_url || "",
        social_media: (profile.social_media as Record<string, string>) || { instagram: "", website: "" },
      });
    }
  }, [profile]);

  const toggleItem = (field: "specialties" | "languages", item: string) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(item) ? f[field].filter((i) => i !== item) : [...f[field], item],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      display_name: form.display_name || null,
      bio: form.bio || null,
      phone: form.phone || null,
      specialties: form.specialties,
      certifications: form.certifications,
      languages: form.languages,
      presentation_video_url: form.presentation_video_url || null,
      social_media: form.social_media,
    });
    setSaving(false);
    toast({
      title: error ? "Erro ao salvar" : "Perfil atualizado",
      description: error?.message || "Suas alterações foram salvas com sucesso.",
      variant: error ? "destructive" : "default",
    });
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3" /><div className="h-40 bg-muted rounded" /></div>;

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Perfil</h1>
          <p className="text-sm text-muted-foreground">Edite suas informações profissionais</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar
        </Button>
      </div>

      {/* Basic */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Informações Básicas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Nome de exibição</Label>
            <Input value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} placeholder="Como deseja ser chamado" />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+55 11 99999-9999" />
          </div>
        </div>
        <div>
          <Label>Bio profissional</Label>
          <Textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Conte sobre sua experiência e abordagem..." className="min-h-[120px]" />
        </div>
      </section>

      {/* Specialties */}
      <section className="glass-card p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Especialidades</h2>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES_OPTIONS.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => toggleItem("specialties", spec)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                form.specialties.includes(spec)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="glass-card p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Idiomas</h2>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES_OPTIONS.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleItem("languages", lang)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                form.languages.includes(lang)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="glass-card p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Certificações</h2>
        <div className="flex gap-2">
          <Input value={newCert} onChange={(e) => setNewCert(e.target.value)} placeholder="Adicionar certificação..." onKeyDown={(e) => {
            if (e.key === "Enter" && newCert.trim()) {
              setForm((f) => ({ ...f, certifications: [...f.certifications, newCert.trim()] }));
              setNewCert("");
            }
          }} />
          <Button variant="outline" size="icon" onClick={() => { if (newCert.trim()) { setForm((f) => ({ ...f, certifications: [...f.certifications, newCert.trim()] })); setNewCert(""); } }}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.certifications.map((cert, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-xs bg-secondary border border-border flex items-center gap-1">
              {cert}
              <button onClick={() => setForm((f) => ({ ...f, certifications: f.certifications.filter((_, idx) => idx !== i) }))}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </section>

      {/* Social & Video */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Redes Sociais & Vídeo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Instagram</Label>
            <Input value={form.social_media.instagram || ""} onChange={(e) => setForm((f) => ({ ...f, social_media: { ...f.social_media, instagram: e.target.value } }))} placeholder="@seuuser" />
          </div>
          <div>
            <Label>Website</Label>
            <Input value={form.social_media.website || ""} onChange={(e) => setForm((f) => ({ ...f, social_media: { ...f.social_media, website: e.target.value } }))} placeholder="https://..." />
          </div>
        </div>
        <div>
          <Label>Vídeo de apresentação (URL)</Label>
          <Input value={form.presentation_video_url} onChange={(e) => setForm((f) => ({ ...f, presentation_video_url: e.target.value }))} placeholder="https://youtube.com/..." />
        </div>
      </section>
    </div>
  );
};

export default DashboardProfile;
