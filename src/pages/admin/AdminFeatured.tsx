import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Star, Trash2 } from "lucide-react";

const AdminFeatured = () => {
  const { toast } = useToast();
  const [featured, setFeatured] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("featured_masters")
      .select("*, profiles(display_name, full_name, city)")
      .order("display_order");
    setFeatured(data || []);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    await supabase.from("featured_masters").delete().eq("id", id);
    toast({ title: "Removido dos destaques" });
    load();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("featured_masters").update({ is_active: !active }).eq("id", id);
    toast({ title: active ? "Desativado" : "Ativado" });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Featured Masters</h1>
      {featured.length === 0 ? (
        <p className="text-muted-foreground">Nenhum profissional em destaque.</p>
      ) : (
        <div className="space-y-3">
          {featured.map((f) => (
            <Card key={f.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-warning" />
                    {f.profiles?.display_name || f.profiles?.full_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {f.city && <Badge variant="outline">{f.city}</Badge>}
                    <Badge variant="outline" className={f.is_active ? "text-success border-success/30" : "text-muted-foreground"}>
                      {f.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggle(f.id, f.is_active)}>
                  {f.is_active ? "Desativar" : "Ativar"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(f.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeatured;
