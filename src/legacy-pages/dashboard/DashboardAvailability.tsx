import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, Loader2, Clock, Home, Car } from "lucide-react";
import { AvailableNowCard } from "@/components/dashboard/AvailableNowCard";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type DaySchedule = { active: boolean; start: string; end: string };
type WeekSchedule = Record<string, DaySchedule>;
type BusinessHours = { incall: WeekSchedule; outcall: WeekSchedule };

const defaultWeek = (): WeekSchedule =>
  Object.fromEntries(DAYS.map((d) => [d, { active: false, start: "09:00", end: "18:00" }]));

const DashboardAvailability = () => {
  const { profile, loading, updateProfile } = useProfile();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [hours, setHours] = useState<BusinessHours>({ incall: defaultWeek(), outcall: defaultWeek() });

  useEffect(() => {
    if (profile) {
      setIsActive(profile.is_active);
      const bh = profile.business_hours as any;
      if (bh && typeof bh === "object") {
        if (bh.incall && bh.outcall) {
          setHours({
            incall: { ...defaultWeek(), ...bh.incall },
            outcall: { ...defaultWeek(), ...bh.outcall },
          });
        } else {
          // Legacy flat format → apply to both
          const legacy = { ...defaultWeek(), ...bh };
          setHours({ incall: legacy, outcall: { ...legacy } });
        }
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

  const updateDay = (type: "incall" | "outcall", day: string, patch: Partial<DaySchedule>) => {
    setHours((prev) => ({
      ...prev,
      [type]: { ...prev[type], [day]: { ...prev[type][day], ...patch } },
    }));
  };

  const ScheduleSection = ({ type, icon, label }: { type: "incall" | "outcall"; icon: React.ReactNode; label: string }) => (
    <section className="glass-card p-4 sm:p-6 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        {icon} {label}
      </h2>
      <div className="space-y-3">
        {DAYS.map((day) => {
          const d = hours[type][day];
          return (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-20 sm:w-24">
                  <Label className="text-sm">{day.slice(0, 3)}<span className="hidden sm:inline">{day.slice(3)}</span></Label>
                </div>
                <Switch
                  checked={d?.active || false}
                  onCheckedChange={(v) => updateDay(type, day, { active: v })}
                />
              </div>
              {d?.active && (
                <div className="flex items-center gap-2 text-sm pl-[calc(1.25rem+0.75rem)] sm:pl-0">
                  <input
                    type="time"
                    value={d.start || "09:00"}
                    onChange={(e) => updateDay(type, day, { start: e.target.value })}
                    className="bg-card border border-border rounded px-2 py-1.5 text-xs text-foreground min-w-0"
                  />
                  <span className="text-muted-foreground text-xs">to</span>
                  <input
                    type="time"
                    value={d.end || "18:00"}
                    onChange={(e) => updateDay(type, day, { end: e.target.value })}
                    className="bg-card border border-border rounded px-2 py-1.5 text-xs text-foreground min-w-0"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="max-w-3xl space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Availability</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Control when your profile is active and your schedule</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
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

      {/* Available Now Boost */}
      <AvailableNowCard />

      <ScheduleSection type="incall" icon={<Home className="w-4 h-4" />} label="Incall Hours" />
      <ScheduleSection type="outcall" icon={<Car className="w-4 h-4" />} label="Outcall Hours" />
    </div>
  );
};

export default DashboardAvailability;
