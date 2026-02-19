import { useProfile } from "@/hooks/useProfile";
import { Search, TrendingUp, BarChart3, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DashboardSeo = () => {
  const { profile, loading } = useProfile();

  if (loading) return <div className="animate-pulse h-40 bg-muted rounded" />;

  const suggestions = [
    { text: "Adicione uma bio com pelo menos 100 caracteres", done: (profile?.bio?.length || 0) >= 100 },
    { text: "Defina pelo menos 3 especialidades", done: (profile?.specialties?.length || 0) >= 3 },
    { text: "Adicione suas certificações", done: (profile?.certifications?.length || 0) > 0 },
    { text: "Preencha cidade e estado", done: !!profile?.city && !!profile?.state },
    { text: "Adicione foto de perfil aprovada", done: !!profile?.is_verified_photos },
    { text: "Adicione vídeo de apresentação", done: !!profile?.presentation_video_url },
  ];

  const score = Math.round((suggestions.filter((s) => s.done).length / suggestions.length) * 100);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SEO Assistido</h1>
        <p className="text-sm text-muted-foreground">Otimize seu perfil para aparecer melhor nas buscas</p>
      </div>

      {/* SEO Score */}
      <div className="glass-card p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold">{score}</span>
        </div>
        <div>
          <h2 className="font-semibold">Pontuação SEO</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {score >= 80 ? "Excelente! Seu perfil está bem otimizado." : score >= 50 ? "Bom, mas há melhorias possíveis." : "Precisa de atenção. Complete os itens abaixo."}
          </p>
        </div>
      </div>

      {/* Suggestions */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Lightbulb className="w-4 h-4" /> Sugestões de Melhoria
        </h2>
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div key={s.text} className="flex items-center gap-3 text-sm">
              <div className={`w-2 h-2 rounded-full shrink-0 ${s.done ? "bg-success" : "bg-warning"}`} />
              <span className={s.done ? "text-muted-foreground line-through" : "text-foreground"}>{s.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats placeholder */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Métricas de Busca
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Posição Média</p>
            <p className="text-2xl font-bold mt-1">—</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Competitividade</p>
            <p className="text-2xl font-bold mt-1">—</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Dados de busca estarão disponíveis após seu perfil estar ativo por 7 dias.</p>
      </section>
    </div>
  );
};

export default DashboardSeo;
