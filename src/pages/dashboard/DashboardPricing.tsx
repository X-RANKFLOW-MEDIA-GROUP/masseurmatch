import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Loader2, DollarSign, Plus, Trash2, AlertCircle, CreditCard } from "lucide-react";

interface PricingSession {
  duration: number;
  incall_price: string;
  outcall_price: string;
}

const MAX_PER_MINUTE = 33;

const PAYMENT_OPTIONS = [
  "Cash", "Credit Card", "Debit Card", "Venmo", "Zelle", "CashApp", "PayPal", "Apple Pay", "Google Pay", "Pix", "Crypto",
];

const DashboardPricing = () => {
  const { profile, loading, updateProfile } = useProfile();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [sessions, setSessions] = useState<PricingSession[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  useEffect(() => {
    if (profile) {
      const saved = (profile as any).pricing_sessions;
      if (Array.isArray(saved) && saved.length > 0) {
        setSessions(saved.map((s: any) => ({
          duration: s.duration,
          incall_price: s.incall_price?.toString() || "",
          outcall_price: s.outcall_price?.toString() || "",
        })));
      } else {
        setSessions([{
          duration: 60,
          incall_price: profile.incall_price?.toString() || "",
          outcall_price: profile.outcall_price?.toString() || "",
        }]);
      }
      setPaymentMethods(profile.payment_methods || []);
    }
  }, [profile]);

  const addSession = () => {
    setSessions((prev) => [...prev, { duration: 60, incall_price: "", outcall_price: "" }]);
  };

  const removeSession = (idx: number) => {
    setSessions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSession = (idx: number, field: keyof PricingSession, value: string | number) => {
    setSessions((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const validatePricing = (): string | null => {
    for (const s of sessions) {
      const incall = parseFloat(s.incall_price);
      const outcall = parseFloat(s.outcall_price);
      if (incall && incall / s.duration > MAX_PER_MINUTE) {
        return `Incall price for ${s.duration}min exceeds $${MAX_PER_MINUTE}/min (max $${MAX_PER_MINUTE * s.duration})`;
      }
      if (outcall && outcall / s.duration > MAX_PER_MINUTE) {
        return `Outcall price for ${s.duration}min exceeds $${MAX_PER_MINUTE}/min (max $${MAX_PER_MINUTE * s.duration})`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validatePricing();
    if (validationError) {
      toast({ title: "Price limit exceeded", description: validationError, variant: "destructive" });
      return;
    }

    setSaving(true);
    const pricingSessions = sessions.map((s) => ({
      duration: s.duration,
      incall_price: s.incall_price ? parseFloat(s.incall_price) : null,
      outcall_price: s.outcall_price ? parseFloat(s.outcall_price) : null,
    }));

    // Also update legacy fields with the first session for backward compat
    const first = pricingSessions[0];
    const { error } = await updateProfile({
      incall_price: first?.incall_price ?? null,
      outcall_price: first?.outcall_price ?? null,
      pricing_sessions: pricingSessions,
      payment_methods: paymentMethods,
    } as any);
    setSaving(false);
    toast({
      title: error ? "Error" : "Pricing updated",
      description: error?.message || "Your changes have been saved.",
      variant: error ? "destructive" : "default",
    });
  };

  if (loading) return <div className="animate-pulse h-40 bg-muted rounded" />;

  return (
    <div className="max-w-3xl space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Pricing</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Set your service rates by session duration</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4">
        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Pricing guidelines</p>
          <p className="text-xs text-muted-foreground">Maximum rate is <strong>${MAX_PER_MINUTE}/minute</strong>. Add multiple session durations to give clients flexibility.</p>
        </div>
      </div>

      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Session Rates
          </h2>
          <Button variant="outline" size="sm" onClick={addSession} className="gap-1">
            <Plus className="w-3 h-3" /> Add Duration
          </Button>
        </div>

        <div className="space-y-4">
          {sessions.map((session, idx) => {
            const incallPerMin = session.incall_price ? parseFloat(session.incall_price) / session.duration : 0;
            const outcallPerMin = session.outcall_price ? parseFloat(session.outcall_price) / session.duration : 0;
            const incallOver = incallPerMin > MAX_PER_MINUTE;
            const outcallOver = outcallPerMin > MAX_PER_MINUTE;

            return (
              <div key={idx} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <Label className="text-xs">Duration (minutes)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={480}
                      value={session.duration}
                      onChange={(e) => {
                        const v = Math.max(1, Math.min(480, parseInt(e.target.value) || 1));
                        updateSession(idx, "duration", v);
                      }}
                      className="w-full sm:w-28"
                    />
                  </div>
                  {sessions.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeSession(idx)} className="text-destructive hover:text-destructive shrink-0 mt-4">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Incall ($)</Label>
                    <Input
                      type="number"
                      value={session.incall_price}
                      onChange={(e) => updateSession(idx, "incall_price", e.target.value)}
                      placeholder="150.00"
                      className={incallOver ? "border-destructive" : ""}
                    />
                    {session.incall_price && (
                      <p className={`text-xs ${incallOver ? "text-destructive" : "text-muted-foreground"}`}>
                        ${incallPerMin.toFixed(2)}/min {incallOver && `(max $${MAX_PER_MINUTE})`}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Outcall ($)</Label>
                    <Input
                      type="number"
                      value={session.outcall_price}
                      onChange={(e) => updateSession(idx, "outcall_price", e.target.value)}
                      placeholder="200.00"
                      className={outcallOver ? "border-destructive" : ""}
                    />
                    {session.outcall_price && (
                      <p className={`text-xs ${outcallOver ? "text-destructive" : "text-muted-foreground"}`}>
                        ${outcallPerMin.toFixed(2)}/min {outcallOver && `(max $${MAX_PER_MINUTE})`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Payment Methods */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Accepted Payment Methods
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PAYMENT_OPTIONS.map((method) => (
            <label key={method} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={paymentMethods.includes(method)}
                onCheckedChange={(checked) => {
                  setPaymentMethods((prev) =>
                    checked ? [...prev, method] : prev.filter((m) => m !== method)
                  );
                }}
              />
              <span className="text-sm">{method}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="glass-card p-4">
        <p className="text-xs text-muted-foreground">
          💡 Rates and payment methods are displayed on your public profile. Clients use these as a reference to contact you directly.
        </p>
      </div>
    </div>
  );
};

export default DashboardPricing;
