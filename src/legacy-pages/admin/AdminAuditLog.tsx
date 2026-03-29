import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AuditEntry {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: any;
  created_at: string;
}

const AdminAuditLog = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setEntries(data || []);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Audit Log</h1>
      {entries.length === 0 ? (
        <p className="text-muted-foreground">No log entries.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <Card key={e.id} className="bg-card border-border">
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{e.action}</Badge>
                  <span className="text-sm text-muted-foreground">{e.target_type}</span>
                  {e.target_id && <span className="text-xs text-muted-foreground font-mono">{e.target_id.slice(0, 8)}</span>}
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-mono mr-2">{e.admin_user_id.slice(0, 8)}</span>
                  {format(new Date(e.created_at), "MM/dd/yyyy HH:mm")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAuditLog;