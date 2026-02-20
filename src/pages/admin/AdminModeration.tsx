import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

const AdminModeration = () => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);

  const loadPhotos = async () => {
    const { data } = await supabase.from("profile_photos").select("*, profiles(display_name, full_name)").eq("moderation_status", "pending");
    setPhotos(data || []);
  };

  const loadVerifications = async () => {
    const { data } = await supabase.from("identity_verifications").select("*").eq("status", "pending");
    setVerifications(data || []);
  };

  useEffect(() => { loadPhotos(); loadVerifications(); }, []);

  const moderatePhoto = async (id: string, status: "approved" | "rejected", reason?: string) => {
    await supabase.from("profile_photos").update({ moderation_status: status, moderation_reason: reason || null }).eq("id", id);
    // Audit log
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("audit_log").insert({ admin_user_id: user.id, action: `photo_${status}`, target_type: "photo", target_id: id });
    }
    toast({ title: `Foto ${status === "approved" ? "aprovada" : "rejeitada"}` });
    loadPhotos();
  };

  const moderateVerification = async (id: string, status: "verified" | "failed") => {
    await supabase.from("identity_verifications").update({ status }).eq("id", id);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("audit_log").insert({ admin_user_id: user.id, action: `verification_${status}`, target_type: "verification", target_id: id });
    }
    toast({ title: `Verificação ${status === "verified" ? "aprovada" : "reprovada"}` });
    loadVerifications();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Moderation</h1>
      <Tabs defaultValue="photos">
        <TabsList>
          <TabsTrigger value="photos">Fotos ({photos.length})</TabsTrigger>
          <TabsTrigger value="identity">Identidade ({verifications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="space-y-3 mt-4">
          {photos.length === 0 ? <p className="text-muted-foreground">Nenhuma foto pendente.</p> : photos.map((p) => (
            <Card key={p.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {p.profiles?.display_name || p.profiles?.full_name || "Unknown"} — Foto
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Badge variant="outline">pending</Badge>
                <Button size="sm" variant="outline" onClick={() => moderatePhoto(p.id, "approved")}>
                  <CheckCircle className="w-4 h-4 mr-1" /> Aprovar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => moderatePhoto(p.id, "rejected", "Content policy violation")}>
                  <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="identity" className="space-y-3 mt-4">
          {verifications.length === 0 ? <p className="text-muted-foreground">Nenhuma verificação pendente.</p> : verifications.map((v) => (
            <Card key={v.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Verificação #{v.id.slice(0, 8)}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Badge variant="outline">pending</Badge>
                <Button size="sm" variant="outline" onClick={() => moderateVerification(v.id, "verified")}>
                  <CheckCircle className="w-4 h-4 mr-1" /> Aprovar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => moderateVerification(v.id, "failed")}>
                  <XCircle className="w-4 h-4 mr-1" /> Reprovar
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminModeration;
