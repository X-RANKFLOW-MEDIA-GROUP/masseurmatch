import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  user_id: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  open: "bg-warning/20 text-warning border-warning/30",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  resolved: "bg-success/20 text-success border-success/30",
  closed: "bg-muted text-muted-foreground border-border",
};

const AdminMailbox = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    let query = supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setTickets(data || []);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("support_tickets").update({ status }).eq("id", id);
    toast({ title: `Ticket atualizado para ${status}` });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Mailbox</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abertos</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="resolved">Resolvidos</SelectItem>
            <SelectItem value="closed">Fechados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tickets.length === 0 ? (
        <p className="text-muted-foreground">Nenhum ticket encontrado.</p>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Card key={t.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{t.subject}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusColors[t.status]}>{t.status}</Badge>
                    <Badge variant="outline">{t.priority}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{t.message}</p>
                <div className="flex items-center gap-2">
                  {t.status === "open" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, "in_progress")}>Iniciar</Button>
                  )}
                  {t.status === "in_progress" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, "resolved")}>Resolver</Button>
                  )}
                  {t.status !== "closed" && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(t.id, "closed")}>Fechar</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMailbox;
