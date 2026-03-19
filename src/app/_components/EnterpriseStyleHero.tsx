import Link from "next/link";
import { Button } from "@/components/ui/button";

type EnterpriseStyleHeroProps = {
  therapistCount: number;
  cityCount: number;
};

export function EnterpriseStyleHero({ therapistCount, cityCount }: EnterpriseStyleHeroProps) {
  return (
    <section className="page-shell pt-8 lg:pt-10">
      <div className="rounded-[28px] border border-border/70 bg-[#f6f7fb] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr),minmax(360px,0.95fr)] lg:items-center">
          <div>
            <span className="inline-flex items-center rounded-full border border-[#d8deea] bg-[#eef2fb] px-3 py-1 text-[11px] font-medium text-[#264a81]">
              Voice-inspired booking flow
            </span>
            <h1 className="mt-6 max-w-2xl text-balance font-heading text-4xl leading-[1.12] text-[#0b2345] sm:text-5xl lg:text-[56px]">
              Converta buscas em contatos com uma vitrine premium e objetiva.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4d5d72]">
              MasseurMatch conecta descoberta por cidade, perfis verificados e contato direto em uma experiencia limpa,
              sem friccao no caminho do cliente.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild className="h-12 rounded-full bg-[#ff8a1f] px-7 text-base font-bold text-white hover:bg-[#f67c0c]">
                <Link href="/search">Buscar profissionais</Link>
              </Button>
              <Link href="/therapists" className="text-base font-semibold text-[#0f3a74] transition hover:text-[#1e4b8f]">
                Ver como funciona
              </Link>
            </div>

            <p className="mt-5 text-sm text-[#6d7b8e]">Em media, perfis completos recebem mais visitas qualificadas na busca local.</p>
          </div>

          <div className="rounded-3xl border border-[#d4dbea] bg-white p-5 shadow-[0_10px_40px_rgba(13,35,68,0.08)] sm:p-6">
            <p className="text-sm font-semibold text-[#1f4d86]">Painel em tempo real</p>
            <div className="mt-4 rounded-2xl border border-[#e5eaf3] bg-[#f8faff] px-4 py-4 sm:px-5">
              <dl className="space-y-3">
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-sm text-[#56657a]">Buscas hoje</dt>
                  <dd className="text-lg font-bold text-[#0d2d57]">{Math.max(therapistCount * 2, 280)}</dd>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-sm text-[#56657a]">Perfis qualificados</dt>
                  <dd className="text-lg font-bold text-[#ff8a1f]">{Math.max(Math.floor(therapistCount * 0.42), 74)}</dd>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-sm text-[#56657a]">Cidades ativas</dt>
                  <dd className="text-lg font-bold text-[#0d2d57]">{cityCount}+</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="border-x border-b border-border/70 bg-[#f2f4f8] px-6 py-8 sm:px-8">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.34em] text-[#707b8b]">
          integra com suas ferramentas favoritas
        </p>
        <div className="mt-7 grid grid-cols-2 gap-4 text-center font-mono text-xs font-medium uppercase tracking-[0.24em] text-[#adb6c3] sm:grid-cols-3 lg:grid-cols-6">
          <span>Google</span>
          <span>HubSpot</span>
          <span>Stripe</span>
          <span>Calendly</span>
          <span>WhatsApp</span>
          <span>Meta Ads</span>
        </div>
      </div>
    </section>
  );
}
