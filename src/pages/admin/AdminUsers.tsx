import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Ban, Clock, RotateCcw, Search } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "text-success border-success/30",
  suspended: "text-warning border-warning/30",
  banned: "text-destructive border-destructive/30",
  pending_approval: "text-muted-foreground border-border",
};

const AdminUsers = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; profileId?: string; userId?: string }>({ open: false });
  const [suspendForm, setSuspendForm] = useState({ type: "suspended" as "suspended" | "banned", reason: "terms_violation", detail: "", days: "7" });

  const load = async () => {
    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50);
    if (search) query = query.or(`full_name.ilike.%${search}%,display_name.ilike.%${search}%`);
    const { data } = await query;
    setProfiles(data || []);
  };

  useEffect(() => { load(); }, [search]);

  const handleSuspend = async () => {
    if (!suspendDialog.userId) return;
    const { data: { user: admin } } = await supabase.auth.getUser();
    if (!admin) return;

    const days = suspendForm.type === "banned" ? null : parseInt(suspendForm.days);
    const endsAt = days ? new Date(Date.now() + days * 86400000).toISOString() : null;

    await supabase.from("user_suspensions").insert({
      user_id: suspendDialog.userId,
      admin_id: admin.id,
      type: suspendForm.type,
      reason: suspendForm.reason,
      reason_detail: suspendForm.detail || null,
      duration_days: days,
      ends_at: endsAt,
    });

    const newStatus = suspendForm.type === "banned" ? "banned" : "suspended";
    await supabase.from("profiles").update({ status: newStatus, is_active: false }).eq("id", suspendDialog.profileId);

    await supabase.from("audit_log").insert({
      admin_user_id: admin.id,
      action: `user_${suspendForm.type}`,
      target_type: "user",
      target_id: suspendDialog.userId,
      details: { reason: suspendForm.reason, days },
    });

    toast({ title: `Usuário ${newStatus}` });
    setSuspendDialog({ open: false });
    load();
  };

  const reactivate = async (profile: any) => {
    const { data: { user: admin } } = await supabase.auth.getUser();
    if (!admin) return;

    await supabase.from("user_suspensions").update({ is_active: false, revoked_at: new Date().toISOString(), revoked_by: admin.id })
      .eq("user_id", profile.user_id).eq("is_active", true);
    await supabase.from("profiles").update({ status: "active", is_active: true }).eq("id", profile.id);
    await supabase.from("audit_log").insert({
      admin_user_id: admin.id, action: "user_reactivated", target_type: "user", target_id: profile.user_id,
    });
    toast({ title: "Usuário reativado" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">User Management</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-3">
        {profiles.map((p) => (
          <Card key={p.id} className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{p.display_name || p.full_name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColors[p.status] || ""}>{p.status}</Badge>
                  {p.is_verified_identity && <Badge variant="outline" className="text-success border-success/30">ID ✓</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex gap-2">
              {p.status === "active" && (
                <Dialog open={suspendDialog.open && suspendDialog.profileId === p.id} onOpenChange={(open) => setSuspendDialog(open ? { open, profileId: p.id, userId: p.user_id } : { open: false })}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive"><Ban className="w-4 h-4 mr-1" /> Suspender/Banir</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Suspender ou Banir Usuário</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <Select value={suspendForm.type} onValueChange={(v: any) => setSuspendForm({ ...suspendForm, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="suspended">Suspender temporariamente</SelectItem>
                          <SelectItem value="banned">Banir permanentemente</SelectItem>
                        </SelectContent>
                      </Select>
                      {suspendForm.type === "suspended" && (
                        <Select value={suspendForm.days} onValueChange={(v) => setSuspendForm({ ...suspendForm, days: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 dias</SelectItem>
                            <SelectItem value="30">30 dias</SelectItem>
                            <SelectItem value="90">90 dias</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Select value={suspendForm.reason} onValueChange={(v) => setSuspendForm({ ...suspendForm, reason: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="terms_violation">Violação dos Termos</SelectItem>
                          <SelectItem value="spam">Spam</SelectItem>
                          <SelectItem value="inappropriate_content">Conteúdo Impróprio</SelectItem>
                          <SelectItem value="fake_profile">Perfil Falso</SelectItem>
                          <SelectItem value="harassment">Assédio</SelectItem>
                          <SelectItem value="fraud">Fraude</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea placeholder="Detalhes adicionais..." value={suspendForm.detail} onChange={(e) => setSuspendForm({ ...suspendForm, detail: e.target.value })} />
                      <Button onClick={handleSuspend} variant="destructive" className="w-full">Confirmar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {(p.status === "suspended" || p.status === "banned") && (
                <Button size="sm" variant="outline" onClick={() => reactivate(p)}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Reativar
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
