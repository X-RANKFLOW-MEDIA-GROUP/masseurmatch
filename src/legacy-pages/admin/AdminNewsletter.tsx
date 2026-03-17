import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Search, Trash2, Download, Users } from "lucide-react";

const AdminNewsletter = () => {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0 });

  const load = async () => {
    let query = (supabase.from("newsletter_subscribers" as any) as any)
      .select("*")
      .order("subscribed_at", { ascending: false });
    if (search) query = query.ilike("email", `%${search}%`);
    const { data, count } = await query;
    setSubscribers(data || []);

    const all = data || [];
    setStats({
      total: all.length,
      active: all.filter((s: any) => s.is_active).length,
    });
  };

  useEffect(() => { load(); }, [search]);

  const toggleActive = async (id: string, currentActive: boolean) => {
    await (supabase.from("newsletter_subscribers" as any) as any)
      .update({
        is_active: !currentActive,
        unsubscribed_at: currentActive ? new Date().toISOString() : null,
      })
      .eq("id", id);
    toast({ title: currentActive ? "Subscriber deactivated" : "Subscriber reactivated" });
    load();
  };

  const deleteSubscriber = async (id: string) => {
    await (supabase.from("newsletter_subscribers" as any) as any).delete().eq("id", id);
    toast({ title: "Subscriber removed" });
    load();
  };

  const exportCsv = () => {
    const active = subscribers.filter((s: any) => s.is_active);
    const csv = "email,name,subscribed_at,source\n" +
      active.map((s: any) => `${s.email},${s.name || ""},${s.subscribed_at},${s.source || ""}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-black">Newsletter</h1>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-4 h-4" /> Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="w-4 h-4" /> Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-success">{stats.active}</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-2">
        {subscribers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No subscribers yet.</p>
        ) : (
          subscribers.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{s.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.subscribed_at).toLocaleDateString()} · {s.source}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={s.is_active ? "text-success border-success/30" : "text-muted-foreground"}>
                  {s.is_active ? "active" : "inactive"}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => toggleActive(s.id, s.is_active)}>
                  {s.is_active ? "Deactivate" : "Reactivate"}
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteSubscriber(s.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNewsletter;
