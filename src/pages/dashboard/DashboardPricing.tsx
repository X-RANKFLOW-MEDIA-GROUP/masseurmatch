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
      title: error ? "Error" : "Pricing updated",
      description: error?.message || "Your changes have been saved.",
      variant: error ? "destructive" : "default",
    });
  };

  if (loading) return <div className="animate-pulse h-40 bg-muted rounded" />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pricing</h1>
          <p className="text-sm text-muted-foreground">Set your service rates</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save
        </Button>
      </div>

      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Rates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Incall ($)</Label>
            <p className="text-xs text-muted-foreground">Service at your location</p>
            <Input type="number" value={form.incall_price} onChange={(e) => setForm((f) => ({ ...f, incall_price: e.target.value }))} placeholder="150.00" />
          </div>
          <div className="space-y-2">
            <Label>Outcall ($)</Label>
            <p className="text-xs text-muted-foreground">Service at the client's location</p>
            <Input type="number" value={form.outcall_price} onChange={(e) => setForm((f) => ({ ...f, outcall_price: e.target.value }))} placeholder="200.00" />
          </div>
        </div>
      </section>

      <div className="glass-card p-4">
        <p className="text-xs text-muted-foreground">
          💡 Rates are displayed on your public profile. Clients use these as a reference to contact you directly.
        </p>
      </div>
    </div>
  );
};

export default DashboardPricing;