import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const reasonLabels: Record<string, string> = {
  terms_violation: "Violação dos Termos",
  spam: "Spam",
  inappropriate_content: "Conteúdo Impróprio",
  fake_profile: "Perfil Falso",
  harassment: "Assédio",
  other: "Outro",
};

const AdminFlags = () => {
  const { toast } = useToast();
  const [flags, setFlags] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending");

  const load = async () => {
    let query = supabase.from("content_flags").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setFlags(data || []);
  };

  useEffect(() => { load(); }, [filter]);

  const resolve = async (id: string, status: "resolved" | "dismissed") => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("content_flags").update({ status, resolved_by: user?.id }).eq("id", id);
    if (user) {
      await supabase.from("audit_log").insert({ admin_user_id: user.id, action: `flag_${status}`, target_type: "flag", target_id: id });
    }
    toast({ title: `Flag ${status === "resolved" ? "resolvido" : "dispensado"}` });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Content Flags</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="reviewing">Em revisão</SelectItem>
            <SelectItem value="resolved">Resolvidos</SelectItem>
            <SelectItem value="dismissed">Dispensados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {flags.length === 0 ? (
        <p className="text-muted-foreground">Nenhum flag encontrado.</p>
      ) : (
        <div className="space-y-3">
          {flags.map((f) => (
            <Card key={f.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{f.target_type} — {f.target_id?.slice(0, 8)}</CardTitle>
                  <Badge variant="outline">{f.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-1"><span className="text-muted-foreground">Motivo:</span> {reasonLabels[f.reason] || f.reason}</p>
                {f.description && <p className="text-xs text-muted-foreground mb-3">{f.description}</p>}
                {f.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => resolve(f.id, "resolved")}>Resolver</Button>
                    <Button size="sm" variant="ghost" onClick={() => resolve(f.id, "dismissed")}>Dispensar</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFlags;
