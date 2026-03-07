import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Plane, MapPin, Calendar, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface TravelEntry {
  id: string;
  destination_city: string;
  destination_state: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  notes: string | null;
}

const DashboardTravel = () => {
  const { profile, loading: profileLoading } = useProfile();
  const { maxCities, planLabel } = usePlanLimits();
  const { toast } = useToast();
  const [travels, setTravels] = useState<TravelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    destination_city: "",
    destination_state: "",
    start_date: "",
    end_date: "",
    notes: "",
  });

  const fetchTravels = async () => {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase
      .from("provider_travel")
      .select("*")
      .eq("profile_id", profile.id)
      .order("start_date", { ascending: true });
    setTravels((data as TravelEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (profile) fetchTravels();
  }, [profile]);

  // Count unique active destination cities
  const activeCities = new Set(
    travels.filter(t => t.is_active && new Date(t.end_date) >= new Date(new Date().toDateString())).map(t => t.destination_city.toLowerCase())
  );
  const atCityLimit = activeCities.size >= maxCities;

  const handleAdd = async () => {
    if (!profile || !form.destination_city || !form.start_date || !form.end_date) {
      toast({ title: "Please fill in city and dates", variant: "destructive" });
      return;
    }

    // Check if this is a new city
    const isNewCity = !activeCities.has(form.destination_city.toLowerCase());
    if (isNewCity && atCityLimit) {
      toast({ title: "City limit reached", description: `Your ${planLabel} plan allows up to ${maxCities} destination cities. Upgrade for more.`, variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("provider_travel").insert({
      profile_id: profile.id,
      destination_city: form.destination_city,
      destination_state: form.destination_state || null,
      start_date: form.start_date,
      end_date: form.end_date,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Travel added!" });
      setForm({ destination_city: "", destination_state: "", start_date: "", end_date: "", notes: "" });
      setShowForm(false);
      fetchTravels();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("provider_travel").delete().eq("id", id);
    toast({ title: "Travel removed" });
    fetchTravels();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("provider_travel").update({ is_active: !current }).eq("id", id);
    toast({ title: current ? "Deactivated" : "Activated" });
    fetchTravels();
  };

  const isUpcoming = (date: string) => new Date(date) >= new Date(new Date().toDateString());
  const isCurrent = (start: string, end: string) => {
    const now = new Date(new Date().toDateString());
    return new Date(start) <= now && new Date(end) >= now;
  };

  if (profileLoading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3" /><div className="h-40 bg-muted rounded" /></div>;

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Plane className="w-6 h-6" />
            Travel Schedule
          </h1>
          <p className="text-sm text-muted-foreground">
            Add cities you're visiting. During travel dates, you'll appear in the destination city instead of your home city.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} disabled={atCityLimit && !showForm}>
          {atCityLimit ? <Lock className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {atCityLimit ? "Limit Reached" : "Add Trip"}
        </Button>
      </div>

      {/* Plan limit indicator */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2">
        <span className="text-xs text-muted-foreground">
          Active cities: <span className="font-semibold text-foreground">{activeCities.size}</span> / {maxCities === 999 ? "∞" : maxCities} ({planLabel})
        </span>
        {atCityLimit && (
          <Link to="/dashboard/subscription">
            <Button variant="link" size="sm" className="text-xs h-auto p-0">
              Upgrade for more <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        )}
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4">
        <Plane className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">How travel works</p>
          <p className="text-xs text-muted-foreground">
            During your travel dates, your profile will appear in the destination city's listings and be hidden from your home city.
            Premium+ plans are automatically featured in the destination city.
          </p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <section className="glass-card p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">New Trip</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Destination City *</Label>
              <CityAutocomplete
                value={form.destination_city}
                onChange={(v) => setForm((f) => ({ ...f, destination_city: v }))}
                placeholder="e.g. Miami"
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                value={form.destination_state}
                onChange={(e) => setForm((f) => ({ ...f, destination_state: e.target.value }))}
                placeholder="e.g. FL"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label>End Date *</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Available for outcall only, etc."
              className="min-h-[60px]"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Trip
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </section>
      )}

      {/* Travel List */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : travels.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No trips scheduled yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Add a trip to appear in other cities.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {travels.map((trip) => {
            const current = isCurrent(trip.start_date, trip.end_date);
            const upcoming = isUpcoming(trip.end_date);
            const past = !upcoming;

            return (
              <div
                key={trip.id}
                className={`glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${past ? "opacity-50" : ""}`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">
                      {trip.destination_city}{trip.destination_state ? `, ${trip.destination_state}` : ""}
                    </span>
                    {current && (
                      <Badge className="bg-success/20 text-success border-success/30 text-[10px]">
                        Currently There
                      </Badge>
                    )}
                    {!current && upcoming && trip.is_active && (
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                        Upcoming
                      </Badge>
                    )}
                    {past && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">Past</Badge>
                    )}
                    {!trip.is_active && !past && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(trip.start_date).toLocaleDateString()} — {new Date(trip.end_date).toLocaleDateString()}</span>
                  </div>
                  {trip.notes && (
                    <p className="text-xs text-muted-foreground italic">{trip.notes}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {!past && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(trip.id, trip.is_active)}
                    >
                      {trip.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(trip.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardTravel;
