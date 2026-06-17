/**
 * /design-system/buttons
 * ──────────────────────
 * Interactive showcase of all button variants for team approval.
 * Server Component — no client JS needed for the demo layout.
 * The ButtonLiquidMetal hover effect is client-only CSS (no JS).
 *
 * Route: /design-system/buttons
 */

import { Button } from "@/components/ui/button";
import { ButtonLiquidMetal } from "@/components/ui/button-liquid-metal";
import { TherapistCardTilt } from "@/components/ui/therapist-card-tilt";

export const metadata = {
  title: "Button Showcase — MasseurMatch Design System",
  description: "Interactive approval showcase for the design team.",
  robots: { index: false },
};

// ── Section wrapper ─────────────────────────────────────────
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-12 border-b border-[var(--color-divider)] last:border-0">
      <div className="mb-8">
        <h2 className="font-display text-xl text-[var(--color-text)]">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-[var(--color-text-muted)] max-w-prose">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

// ── Variant row ──────────────────────────────────────────────
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-xs font-medium tracking-widest uppercase text-[var(--color-text-faint)]">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

// ── Code snippet ────────────────────────────────────────────
function Code({ children }: { children: string }) {
  return (
    <pre className="mt-4 rounded-lg bg-[var(--color-surface-offset)] border border-[var(--color-border)] p-4 text-xs text-[var(--color-text-muted)] overflow-x-auto">
      <code>{children}</code>
    </pre>
  );
}

export default function ButtonShowcasePage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--color-divider)] bg-[var(--color-surface)]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <span className="label-eyebrow">Design System v2</span>
          <h1 className="mt-2 font-display text-2xl text-[var(--color-text)]">
            Button Showcase
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)] max-w-prose">
            5 variantes × 4 tamanhos — prontos para aprovação do time.
            Hover para ver os estados. CTA hero usa
            <code className="mx-1 px-1.5 py-0.5 rounded bg-[var(--color-surface-offset)] text-xs">ButtonLiquidMetal</code>
            separado.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6">
        {/* ── 1. LIQUID METAL — Hero CTA ── */}
        <Section
          title="ButtonLiquidMetal — Hero CTA"
          description="Efeito shimmer liquid-metal para o CTA principal do hero. Apenas CSS, sem JS. Respeita prefers-reduced-motion."
        >
          <Row label="Tamanhos disponíveis">
            <ButtonLiquidMetal size="md">Book Now</ButtonLiquidMetal>
            <ButtonLiquidMetal size="lg">Encontrar Massoterapeuta</ButtonLiquidMetal>
            <ButtonLiquidMetal size="xl">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Buscar agora
            </ButtonLiquidMetal>
          </Row>
          <Row label="Estado desabilitado">
            <ButtonLiquidMetal size="lg" disabled>
              Encontrar Massoterapeuta
            </ButtonLiquidMetal>
          </Row>
          <Code>{`import { ButtonLiquidMetal } from "@/components/ui/button-liquid-metal"

// Hero section
<ButtonLiquidMetal size="lg">
  Encontrar Massoterapeuta
</ButtonLiquidMetal>

// With icon
<ButtonLiquidMetal size="xl">
  <SearchIcon />
  Buscar agora
</ButtonLiquidMetal>`}</Code>
        </Section>

        {/* ── 2. PRIMARY ── */}
        <Section
          title="Primary — Ação Principal"
          description="Acento âmbar/cobre. Use para Book, Continuar, Confirmar. Máximo 1 primary por viewport."
        >
          <Row label="Todos os tamanhos">
            <Button variant="primary" size="sm">Reservar</Button>
            <Button variant="primary" size="md">Reservar sessão</Button>
            <Button variant="primary" size="lg">Reservar agora</Button>
            <Button variant="primary" size="xl">Reservar agora</Button>
          </Row>
          <Row label="Com ícone">
            <Button variant="primary" size="md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Agendar sessão
            </Button>
            <Button variant="primary" size="icon" aria-label="Agendar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </Button>
          </Row>
          <Row label="Estado desabilitado">
            <Button variant="primary" disabled>Reservar sessão</Button>
          </Row>
          <Code>{`<Button variant="primary" size="md">Reservar sessão</Button>
<Button variant="primary" size="md" disabled>Reservar sessão</Button>`}</Code>
        </Section>

        {/* ── 3. SECONDARY ── */}
        <Section
          title="Secondary — Ação Secundária"
          description="Fill sutil com borda. Use para Ver perfil, Compartilhar, Salvar."
        >
          <Row label="Todos os tamanhos">
            <Button variant="secondary" size="sm">Ver perfil</Button>
            <Button variant="secondary" size="md">Ver perfil completo</Button>
            <Button variant="secondary" size="lg">Ver todos os profissionais</Button>
          </Row>
          <Row label="Com ícone">
            <Button variant="secondary" size="md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Favoritar
            </Button>
          </Row>
          <Code>{`<Button variant="secondary" size="md">Ver perfil completo</Button>`}</Code>
        </Section>

        {/* ── 4. OUTLINE ── */}
        <Section
          title="Outline — Ação Terciária"
          description="Apenas borda. Use para Cancelar, Voltar, Filtrar."
        >
          <Row label="Todos os tamanhos">
            <Button variant="outline" size="sm">Cancelar</Button>
            <Button variant="outline" size="md">Ver mais filtros</Button>
            <Button variant="outline" size="lg">Explorar categorias</Button>
          </Row>
          <Code>{`<Button variant="outline" size="md">Ver mais filtros</Button>`}</Code>
        </Section>

        {/* ── 5. GHOST ── */}
        <Section
          title="Ghost — Ações Sutis"
          description="Sem background. Use em rows de lista, sidebars, tooltips, ações inline."
        >
          <Row label="Todos os tamanhos">
            <Button variant="ghost" size="sm">Editar</Button>
            <Button variant="ghost" size="md">Ver avaliações</Button>
            <Button variant="ghost" size="icon" aria-label="Menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </Button>
          </Row>
          <Code>{`<Button variant="ghost" size="md">Ver avaliações</Button>
<Button variant="ghost" size="icon" aria-label="Menu"><MenuIcon /></Button>`}</Code>
        </Section>

        {/* ── 6. DANGER ── */}
        <Section
          title="Danger — Ações Destrutivas"
          description="Use apenas para cancelar reserva, excluir conta, remover dados."
        >
          <Row label="Todos os tamanhos">
            <Button variant="danger" size="sm">Excluir</Button>
            <Button variant="danger" size="md">Cancelar reserva</Button>
            <Button variant="danger" size="lg">Excluir conta permanentemente</Button>
          </Row>
          <Code>{`<Button variant="danger" size="md">Cancelar reserva</Button>`}</Code>
        </Section>

        {/* ── 7. THERAPIST CARD TILT ── */}
        <Section
          title="TherapistCardTilt — 3D Mouse Tracking"
          description="Perspectiva CSS 3D + glare radial driven by mouse. Touch: sem tilt. prefers-reduced-motion: sem tilt."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TherapistCardTilt
              name="Sofia Almeida"
              specialty="Deep Tissue · Relaxamento"
              location="São Paulo, SP"
              rating={4.9}
              reviewCount={128}
              pricePerHour={180}
              verified
              available
            />
            <TherapistCardTilt
              name="Lucas Ferreira"
              specialty="Shiatsu · Trigger Point"
              location="Rio de Janeiro, RJ"
              rating={4.7}
              reviewCount={94}
              pricePerHour={160}
              verified
            />
            <TherapistCardTilt
              name="Ana Carolina"
              specialty="Pedras Quentes · Aromaterapia"
              location="Belo Horizonte, MG"
              rating={5.0}
              reviewCount={52}
              pricePerHour={220}
              verified
              available
            />
          </div>
          <Code>{`import { TherapistCardTilt } from "@/components/ui/therapist-card-tilt"

<TherapistCardTilt
  name="Sofia Almeida"
  specialty="Deep Tissue · Relaxamento"
  location="São Paulo, SP"
  rating={4.9}
  reviewCount={128}
  pricePerHour={180}
  verified
  available
/>`}</Code>
        </Section>

        {/* ── 8. HERO MOCKUP ── */}
        <Section
          title="Hero Mockup — CTA em contexto real"
          description="ButtonLiquidMetal como CTA primário com Secondary ao lado — padrão hero recomendado."
        >
          <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-10 flex flex-col items-center text-center gap-6">
            <span className="label-eyebrow">Bem-estar a domicílio</span>
            <h2 className="font-display text-2xl text-[var(--color-text)] max-w-sm">
              Encontre o massoterapeuta ideal para você
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
              Profissionais verificados, agendamento em minutos, atendimento onde você estiver.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ButtonLiquidMetal size="lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                Buscar profissionais
              </ButtonLiquidMetal>
              <Button variant="outline" size="lg">Como funciona</Button>
            </div>
            <p className="text-xs text-[var(--color-text-faint)]">+3.200 profissionais verificados em todo o Brasil</p>
          </div>
        </Section>

        {/* Footer */}
        <footer className="py-10 text-center">
          <p className="text-xs text-[var(--color-text-faint)]">
            MasseurMatch Design System v2 · Para aprovação interna
          </p>
        </footer>
      </div>
    </main>
  );
}
