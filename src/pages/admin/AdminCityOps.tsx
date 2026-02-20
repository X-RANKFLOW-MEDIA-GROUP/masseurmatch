import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const AdminCityOps = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">City Operations</h1>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-5 h-5" /> Manage Visit Windows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Gerencie janelas de visita por cidade, configure cidades destacadas e controle a visibilidade regional dos profissionais.
          </p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {["Los Angeles", "San Francisco", "New York", "Miami", "Chicago", "Seattle"].map((city) => (
              <div key={city} className="p-3 rounded-lg bg-secondary border border-border">
                <p className="text-sm font-medium">{city}</p>
                <p className="text-xs text-muted-foreground">Ativo</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCityOps;
