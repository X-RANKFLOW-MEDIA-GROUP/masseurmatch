import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Tag, Clock, AlertTriangle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface WeeklySpecial {
  id: string;
  text: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

const DashboardSpecials = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [specials, setSpecials] = useState<WeeklySpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newText, setNewText] = useState("");

  const fetchSpecials = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("weekly_specials")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });
    setSpecials((data as WeeklySpecial[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchSpecials(); }, [profile]);

  const handleCreate = async () => {
    if (!profile || !newText.trim()) return;
    setSaving(true);

    // Calculate next Sunday 23:59:59
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(23, 59, 59, 999);

    const { error } = await supabase
      .from("weekly_specials")
      .insert({
        profile_id: profile.id,
        text: newText.trim(),
        expires_at: nextSunday.toISOString(),
      } as any);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Special created!", description: "Your weekly special is now live." });
      setNewText("");
      fetchSpecials();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("weekly_specials").delete().eq("id", id);
    setSpecials((s) => s.filter((x) => x.id !== id));
    toast({ title: "Deleted" });
  };

  const activeSpecials = specials.filter((s) => s.is_active && new Date(s.expires_at) > new Date());
  const expiredSpecials = specials.filter((s) => !s.is_active || new Date(s.expires_at) <= new Date());

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3" /><div className="h-40 bg-muted rounded" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Tag className="w-5 h-5" /> Weekly Specials
        </h1>
        <p className="text-sm text-muted-foreground">Create promotions that automatically expire at the end of the week</p>
      </div>

      {/* Create new */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">New Special</h2>
        <Textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="e.g. 20% off deep tissue massage this week only!"
          className="min-h-[80px]"
          maxLength={300}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            <Clock className="w-3 h-3 inline mr-1" />
            Expires automatically at the end of this week (Sunday 11:59 PM)
          </p>
          <Button onClick={handleCreate} disabled={saving || !newText.trim()}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Create Special
          </Button>
        </div>
      </section>

      {/* Active specials */}
      {activeSpecials.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Specials</h2>
          {activeSpecials.map((s) => (
            <div key={s.id} className="glass-card p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium">{s.text}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="text-[10px] bg-success/20 text-success border-success/30">Active</Badge>
                  <span className="text-xs text-muted-foreground">
                    Expires {formatDistanceToNow(new Date(s.expires_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </section>
      )}

      {/* Expired */}
      {expiredSpecials.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Expired</h2>
          {expiredSpecials.slice(0, 5).map((s) => (
            <div key={s.id} className="glass-card p-5 opacity-50 flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm">{s.text}</p>
                <span className="text-xs text-muted-foreground">
                  Expired {format(new Date(s.expires_at), "MMM d, yyyy")}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </section>
      )}

      <div className="flex items-start gap-3 rounded-lg border border-muted bg-muted/20 p-4">
        <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Weekly specials are displayed on your public profile and in search results with a "Special Offer" badge.
          Each special expires automatically at the end of the week.
        </p>
      </div>
    </div>
  );
};

export default DashboardSpecials;
