import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, DollarSign } from "lucide-react";

const DashboardPricing = () => {
  const { profile, loading, updateProfile } = useProfile();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ incall_price: "", outcall_price: "" });

  useEffect(() => {
    if (profile) {
      setForm({
        incall_price: profile.incall_price?.toString() || "",
        outcall_price: profile.outcall_price?.toString() || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      incall_price: form.incall_price ? parseFloat(form.incall_price) : null,
      outcall_price: form.outcall_price ? parseFloat(form.outcall_price) : null,
    });
    setSaving(false);
    toast({
      title: error ? "Erro" : "Preços atualizados",
      description: error?.message || "Suas alterações foram salvas.",
      variant: error ? "destructive" : "default",
    });
  };

  if (loading) return <div className="animate-pulse h-40 bg-muted rounded" />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Preços</h1>
          <p className="text-sm text-muted-foreground">Defina seus valores de atendimento</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar
        </Button>
      </div>

      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Valores
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Incall (R$)</Label>
            <p className="text-xs text-muted-foreground">Atendimento no seu espaço</p>
            <Input type="number" value={form.incall_price} onChange={(e) => setForm((f) => ({ ...f, incall_price: e.target.value }))} placeholder="150.00" />
          </div>
          <div className="space-y-2">
            <Label>Outcall (R$)</Label>
            <p className="text-xs text-muted-foreground">Atendimento no local do cliente</p>
            <Input type="number" value={form.outcall_price} onChange={(e) => setForm((f) => ({ ...f, outcall_price: e.target.value }))} placeholder="200.00" />
          </div>
        </div>
      </section>

      <div className="glass-card p-4">
        <p className="text-xs text-muted-foreground">
          💡 Valores são exibidos no seu perfil público. Clientes usam esses valores como referência para entrar em contato com você diretamente.
        </p>
      </div>
    </div>
  );
};

export default DashboardPricing;
