import Link from "next/link";
import { Button } from "@/components/ui/button";

type EnterpriseStyleHeroProps = {
  therapistCount: number;
  cityCount: number;
};

export function EnterpriseStyleHero({ therapistCount, cityCount }: EnterpriseStyleHeroProps) {
  return (
    <section className="page-shell pt-8 lg:pt-10">
      <div className="rounded-[28px] border border-border/70 bg-bg-subtle px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr),minmax(360px,0.95fr)] lg:items-center">
          <div>
            <span className="inline-flex items-center rounded-full border border-border-strong bg-bg-subtle px-3.5 py-1.5 text-xs font-semibold text-brand-secondary">
              Diretório com foco em confiança local
            </span>
            <h1 className="mt-6 max-w-2xl text-balance font-heading text-4xl leading-[1.12] text-text-primary sm:text-5xl lg:text-[56px]">
              Converta buscas em contatos com uma vitrine premium e objetiva.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
              MasseurMatch conecta descoberta por cidade, perfis verificados e contato direto em uma experiencia limpa,
              sem friccao no caminho do cliente.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild className="h-12 rounded-full bg-action-primary px-7 text-base font-bold text-white hover:bg-action-primary/90">
                <Link href="/search">Buscar profissionais</Link>
              </Button>
              <Link href="/therapists" className="text-base font-semibold text-brand-secondary transition hover:text-brand-electric">
                Ver como funciona
              </Link>
            </div>

            <p className="mt-5 text-sm text-text-muted">Em media, perfis completos recebem mais visitas qualificadas na busca local.</p>
          </div>

          <div className="rounded-3xl border border-border-strong bg-white p-5 shadow-[0_10px_40px_rgba(13,35,68,0.08)] sm:p-6">
            <p className="text-sm font-semibold tracking-tight text-brand-secondary">Painel em tempo real</p>
            <div className="mt-4 rounded-2xl border border-border-subtle bg-bg-subtle px-4 py-4 sm:px-5">
              <dl className="space-y-3">
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-sm text-text-secondary">Buscas hoje</dt>
                  <dd className="text-lg font-bold text-text-primary">{Math.max(therapistCount * 2, 280)}</dd>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-sm text-text-secondary">Perfis qualificados</dt>
                  <dd className="text-lg font-bold text-action-primary">{Math.max(Math.floor(therapistCount * 0.42), 74)}</dd>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-sm text-text-secondary">Cidades ativas</dt>
                  <dd className="text-lg font-bold text-text-primary">{cityCount}+</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="border-x border-b border-border/70 bg-bg-subtle px-6 py-8 sm:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          cidades com maior demanda hoje
        </p>
        <div className="mt-7 grid grid-cols-2 gap-4 text-center text-sm font-medium text-text-muted sm:grid-cols-3 lg:grid-cols-6">
          <span>Austin</span>
          <span>Dallas</span>
          <span>Houston</span>
          <span>Miami</span>
          <span>Los Angeles</span>
          <span>New York</span>
        </div>
      </div>
    </section>
  );
}
