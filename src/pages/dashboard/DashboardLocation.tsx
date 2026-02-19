import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, MapPin } from "lucide-react";

const DashboardLocation = () => {
  const { profile, loading, updateProfile } = useProfile();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ city: "", state: "", country: "", service_areas: [] as string[] });
  const [newArea, setNewArea] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "",
        service_areas: Array.isArray(profile.service_areas) ? (profile.service_areas as string[]) : [],
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      city: form.city || null,
      state: form.state || null,
      country: form.country || null,
      service_areas: form.service_areas as any,
    });
    setSaving(false);
    toast({
      title: error ? "Erro" : "Localização atualizada",
      description: error?.message || "Suas alterações foram salvas.",
      variant: error ? "destructive" : "default",
    });
  };

  if (loading) return <div className="animate-pulse h-40 bg-muted rounded" />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Localização</h1>
          <p className="text-sm text-muted-foreground">Configure sua cidade principal e áreas de atendimento</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar
        </Button>
      </div>

      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Cidade Principal
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Cidade</Label>
            <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="São Paulo" />
          </div>
          <div>
            <Label>Estado</Label>
            <Input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="SP" />
          </div>
          <div>
            <Label>País</Label>
            <Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="Brasil" />
          </div>
        </div>
      </section>

      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Áreas de Atendimento</h2>
        <p className="text-xs text-muted-foreground">Cidades ou bairros onde você atende (de acordo com seu plano).</p>
        <div className="flex gap-2">
          <Input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="Adicionar área..." onKeyDown={(e) => {
            if (e.key === "Enter" && newArea.trim()) { setForm((f) => ({ ...f, service_areas: [...f.service_areas, newArea.trim()] })); setNewArea(""); }
          }} />
          <Button variant="outline" size="sm" onClick={() => { if (newArea.trim()) { setForm((f) => ({ ...f, service_areas: [...f.service_areas, newArea.trim()] })); setNewArea(""); } }}>Adicionar</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.service_areas.map((area, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-xs bg-secondary border border-border flex items-center gap-1">
              {area}
              <button onClick={() => setForm((f) => ({ ...f, service_areas: f.service_areas.filter((_, idx) => idx !== i) }))}><span className="text-muted-foreground hover:text-foreground">×</span></button>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardLocation;
