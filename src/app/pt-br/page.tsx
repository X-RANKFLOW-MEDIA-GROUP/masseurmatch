import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/json-ld";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, createPageMetadata } from "@/app/_lib/seo";
import { siteUrl } from "@/lib/site";
import { PtBrLocaleSync } from "./PtBrLocaleSync";

const ptBrMetadata = createPageMetadata({
  title: "MasseurMatch em portugues",
  description:
    "Descubra terapeutas de massagem masculina em cidades dos Estados Unidos com perfis publicos, sinais de confianca e contato direto.",
  path: "/pt-br",
  keywords: [
    "massagem masculina",
    "terapeutas de massagem nos estados unidos",
    "diretorio de massagem masculina",
    "massagem masculina verificada",
  ],
});

export const metadata: Metadata = {
  ...ptBrMetadata,
  alternates: {
    canonical: siteUrl("/pt-br"),
    languages: {
      en: siteUrl("/"),
      "pt-BR": siteUrl("/pt-br"),
    },
  },
  openGraph: {
    ...ptBrMetadata.openGraph,
    locale: "pt_BR",
    url: siteUrl("/pt-br"),
  },
};

export const revalidate = 1800;

const FEATURED_CITY_SLUGS = new Set(["dallas", "miami", "chicago", "houston", "austin"]);

export default async function PortugueseHomePage() {
  const featuredCities = getCities().filter((city) => FEATURED_CITY_SLUGS.has(city.slug));
  const therapists = await getPublicTherapists({ page: 1, pageSize: 36 });

  return (
    <>
      <PtBrLocaleSync />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Portuguese", path: "/pt-br" },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "MasseurMatch em portugues",
          description:
            "Versao em portugues da pagina inicial da MasseurMatch, com acesso rapido a busca, exploracao por cidade e cadastro de terapeutas.",
          path: "/pt-br",
        })}
      />

      <main className="page-shell py-10">
        <section className="rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-8">
          <span className="inline-flex rounded-full border border-border bg-secondary/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Portugues do Brasil
          </span>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Encontre terapeutas de massagem masculina com mais clareza e confianca.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
            A MasseurMatch ajuda voce a explorar perfis publicos, sinais de verificacao, especialidades e formas de
            contato direto em cidades importantes dos Estados Unidos.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/search" className="rounded-full bg-action-primary px-5 py-3 text-sm font-semibold text-white">
              Buscar terapeutas
            </Link>
            <Link href="/explore" className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground">
              Explorar por localizacao
            </Link>
            <Link href="/signup" className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground">
              Cadastrar perfil
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Perfis publicos</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Veja informacoes principais antes de entrar em contato: cidade, modalidades, sinais de confianca e faixas
              de preco quando disponiveis.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Contato direto</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              A plataforma e focada em descoberta. O visitante compara opcoes e depois fala diretamente com o terapeuta
              para confirmar disponibilidade, formato da sessao e detalhes.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Cobertura em crescimento</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Hoje a plataforma ja mostra {therapists.total}+ perfis publicos e continua expandindo cidades, paginas de
              servico e guias editoriais.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground">Cidades populares</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Comece por uma das cidades abaixo e refine depois por servico, bairro ou formato de atendimento.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {featuredCities.map((city) => (
              <Link
                key={city.slug}
                href={`/${city.slug}`}
                className="rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground">Como usar a plataforma</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
            <li>Escolha uma cidade ou use a busca para localizar perfis relevantes.</li>
            <li>Compare verificacao, especialidades, formato incall ou outcall e informacoes do perfil.</li>
            <li>Abra o perfil e use os canais de contato direto para confirmar horario, local e preferencias.</li>
          </ol>
        </section>
      </main>
    </>
  );
}
