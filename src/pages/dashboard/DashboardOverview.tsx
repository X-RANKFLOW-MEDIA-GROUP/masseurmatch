import { useProfile } from "@/hooks/useProfile";
import { Eye, MessageSquare, TrendingUp, MousePointerClick, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const DashboardOverview = () => {
  const { profile, loading } = useProfile();

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3" /><div className="h-40 bg-muted rounded" /></div>;

  const completeness = calculateCompleteness(profile);

  const stats = [
    { icon: Eye, label: "Visualizações", value: "—", desc: "do perfil" },
    { icon: MousePointerClick, label: "Cliques em Contato", value: "—", desc: "total" },
    { icon: TrendingUp, label: "Aparições na Busca", value: "—", desc: "esta semana" },
    { icon: MessageSquare, label: "Pico de Atividade", value: "—", desc: "melhor horário" },
  ];

  const checklist = [
    { label: "Perfil preenchido", done: !!profile?.bio && !!profile?.display_name },
    { label: "Identidade verificada", done: !!profile?.is_verified_identity },
    { label: "Fotos aprovadas", done: !!profile?.is_verified_photos },
    { label: "Localização configurada", done: !!profile?.city },
    { label: "Preço definido", done: !!profile?.incall_price || !!profile?.outcall_price },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Painel do Massagista</p>
        <h1 className="text-3xl font-bold">
          Bem-vindo, {profile?.display_name || profile?.full_name || "Profissional"}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          {profile?.is_active ? (
            <Badge variant="outline" className="text-xs border-success/40 text-success">Perfil Ativo</Badge>
          ) : (
            <Badge variant="outline" className="text-xs border-warning/40 text-warning">Perfil Inativo</Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {profile?.is_active
              ? "Seu perfil está visível no diretório."
              : "Complete os requisitos para ativar seu perfil."}
          </span>
        </div>
      </div>

      {/* Profile Completeness */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Completude do Perfil</h3>
          <span className="text-sm font-bold">{completeness}%</span>
        </div>
        <Progress value={completeness} className="h-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              )}
              <span className={item.done ? "text-muted-foreground" : "text-foreground"}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-background p-5">
            <stat.icon className="w-4 h-4 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-lg overflow-hidden">
        {[
          { title: "Editar Perfil", desc: "Atualize bio, especialidades e certificações", link: "/dashboard/profile" },
          { title: "Gerenciar Fotos", desc: "Adicione e organize suas fotos profissionais", link: "/dashboard/photos" },
          { title: "Assinatura", desc: "Veja seu plano e faça upgrade", link: "/dashboard/subscription" },
        ].map((action) => (
          <Link key={action.title} to={action.link} className="block bg-background p-6 hover:bg-card transition-colors group glow-hover">
            <h3 className="font-semibold mb-1 text-sm">{action.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{action.desc}</p>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors inline-flex items-center gap-1 uppercase tracking-widest">
              Abrir <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

function calculateCompleteness(profile: any) {
  if (!profile) return 0;
  const fields = [
    !!profile.display_name,
    !!profile.bio,
    !!profile.city,
    !!profile.phone,
    !!profile.specialties?.length,
    !!profile.incall_price || !!profile.outcall_price,
    !!profile.is_verified_identity,
    !!profile.is_verified_photos,
    !!profile.languages?.length,
    !!profile.certifications?.length,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export default DashboardOverview;
