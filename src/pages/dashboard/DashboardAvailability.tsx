import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, Loader2, Clock } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DashboardAvailability = () => {
  const { profile, loading, updateProfile } = useProfile();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [hours, setHours] = useState<Record<string, { active: boolean; start: string; end: string }>>(
    Object.fromEntries(DAYS.map((d) => [d, { active: false, start: "09:00", end: "18:00" }]))
  );

  useEffect(() => {
    if (profile) {
      setIsActive(profile.is_active);
      if (profile.business_hours && typeof profile.business_hours === "object") {
        setHours((prev) => ({ ...prev, ...(profile.business_hours as any) }));
      }
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      is_active: isActive,
      business_hours: hours as any,
    });
    setSaving(false);
    toast({
      title: error ? "Error" : "Availability updated",
      description: error?.message || "Your changes have been saved.",
      variant: error ? "destructive" : "default",
    });
  };

  if (loading) return <div className="animate-pulse h-40 bg-muted rounded" />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Availability</h1>
          <p className="text-sm text-muted-foreground">Control when your profile is active and your schedule</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save
        </Button>
      </div>

      {/* Active Toggle */}
      <section className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Profile Status</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isActive ? "Your profile is visible in the directory." : "Your profile is paused and won't appear in searches."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{isActive ? "Active" : "Inactive"}</span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
      </section>

      {/* Weekly Schedule */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Clock className="w-4 h-4" /> Weekly Schedule
        </h2>
        <div className="space-y-3">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
              <div className="w-24">
                <Label className="text-sm">{day}</Label>
              </div>
              <Switch
                checked={hours[day]?.active || false}
                onCheckedChange={(v) => setHours((h) => ({ ...h, [day]: { ...h[day], active: v } }))}
              />
              {hours[day]?.active && (
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    value={hours[day]?.start || "09:00"}
                    onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], start: e.target.value } }))}
                    className="bg-card border border-border rounded px-2 py-1 text-xs text-foreground"
                  />
                  <span className="text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={hours[day]?.end || "18:00"}
                    onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], end: e.target.value } }))}
                    className="bg-card border border-border rounded px-2 py-1 text-xs text-foreground"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardAvailability;