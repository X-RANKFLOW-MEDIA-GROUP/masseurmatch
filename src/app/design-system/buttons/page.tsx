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
            5 variants × 4 sizes — ready for team approval.
            Hover to see states. The hero CTA uses a separate{" "}
            <code className="mx-1 px-1.5 py-0.5 rounded bg-[var(--color-surface-offset)] text-xs">ButtonLiquidMetal</code>
            component.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6">
        {/* ── 1. LIQUID METAL — Hero CTA ── */}
        <Section
          title="ButtonLiquidMetal — Hero CTA"
          description="Liquid-metal shimmer effect for the primary hero CTA. Pure CSS, no JS. Respects prefers-reduced-motion."
        >
          <Row label="Available sizes">
            <ButtonLiquidMetal size="md">Find a Therapist</ButtonLiquidMetal>
            <ButtonLiquidMetal size="lg">Search Nearby</ButtonLiquidMetal>
            <ButtonLiquidMetal size="xl">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Search Now
            </ButtonLiquidMetal>
          </Row>
          <Row label="Disabled state">
            <ButtonLiquidMetal size="lg" disabled>
              Search Nearby
            </ButtonLiquidMetal>
          </Row>
          <Code>{`import { ButtonLiquidMetal } from "@/components/ui/button-liquid-metal"

// Hero section
<ButtonLiquidMetal size="lg">
  Find a Therapist
</ButtonLiquidMetal>

// With icon
<ButtonLiquidMetal size="xl">
  <SearchIcon />
  Search Now
</ButtonLiquidMetal>`}</Code>
        </Section>

        {/* ── 2. PRIMARY ── */}
        <Section
          title="Primary — Main Action"
          description="Amber/copper accent. Use for primary CTAs: Search, Continue, Confirm. Max 1 primary per viewport."
        >
          <Row label="All sizes">
            <Button variant="primary" size="sm">Contact</Button>
            <Button variant="primary" size="md">View Profile</Button>
            <Button variant="primary" size="lg">Get Started</Button>
            <Button variant="primary" size="xl">Get Started</Button>
          </Row>
          <Row label="With icon">
            <Button variant="primary" size="md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Schedule a Session
            </Button>
            <Button variant="primary" size="icon" aria-label="Schedule">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </Button>
          </Row>
          <Row label="Disabled state">
            <Button variant="primary" disabled>View Profile</Button>
          </Row>
          <Code>{`<Button variant="primary" size="md">View Profile</Button>
<Button variant="primary" size="md" disabled>View Profile</Button>`}</Code>
        </Section>

        {/* ── 3. SECONDARY ── */}
        <Section
          title="Secondary — Secondary Action"
          description="Subtle fill with border. Use for View profile, Share, Save."
        >
          <Row label="All sizes">
            <Button variant="secondary" size="sm">View Profile</Button>
            <Button variant="secondary" size="md">Full Profile</Button>
            <Button variant="secondary" size="lg">Browse All Therapists</Button>
          </Row>
          <Row label="With icon">
            <Button variant="secondary" size="md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Save
            </Button>
          </Row>
          <Code>{`<Button variant="secondary" size="md">Full Profile</Button>`}</Code>
        </Section>

        {/* ── 4. OUTLINE ── */}
        <Section
          title="Outline — Tertiary Action"
          description="Border only. Use for Cancel, Back, Filter."
        >
          <Row label="All sizes">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button variant="outline" size="md">More Filters</Button>
            <Button variant="outline" size="lg">Explore Categories</Button>
          </Row>
          <Code>{`<Button variant="outline" size="md">More Filters</Button>`}</Code>
        </Section>

        {/* ── 5. GHOST ── */}
        <Section
          title="Ghost — Subtle Actions"
          description="No background. Use in list rows, sidebars, tooltips, inline actions."
        >
          <Row label="All sizes">
            <Button variant="ghost" size="sm">Edit</Button>
            <Button variant="ghost" size="md">View Reviews</Button>
            <Button variant="ghost" size="icon" aria-label="Menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </Button>
          </Row>
          <Code>{`<Button variant="ghost" size="md">View Reviews</Button>
<Button variant="ghost" size="icon" aria-label="Menu"><MenuIcon /></Button>`}</Code>
        </Section>

        {/* ── 6. DANGER ── */}
        <Section
          title="Danger — Destructive Actions"
          description="Use only for account deletion, removing data, or other irreversible actions."
        >
          <Row label="All sizes">
            <Button variant="danger" size="sm">Remove</Button>
            <Button variant="danger" size="md">Delete Photo</Button>
            <Button variant="danger" size="lg">Delete Account Permanently</Button>
          </Row>
          <Code>{`<Button variant="danger" size="md">Delete Photo</Button>`}</Code>
        </Section>

        {/* ── 7. THERAPIST CARD TILT ── */}
        <Section
          title="TherapistCardTilt — 3D Mouse Tracking"
          description="CSS 3D perspective + radial glare driven by mouse position. Touch: no tilt. prefers-reduced-motion: no tilt."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TherapistCardTilt
              name="James Carter"
              specialty="Deep Tissue · Swedish"
              location="Los Angeles, CA"
              rating={4.9}
              reviewCount={128}
              pricePerHour={180}
              verified
              available
            />
            <TherapistCardTilt
              name="Marcus Reid"
              specialty="Shiatsu · Trigger Point"
              location="New York, NY"
              rating={4.7}
              reviewCount={94}
              pricePerHour={160}
              verified
            />
            <TherapistCardTilt
              name="Daniel Torres"
              specialty="Hot Stone · Aromatherapy"
              location="Miami, FL"
              rating={5.0}
              reviewCount={52}
              pricePerHour={220}
              verified
              available
            />
          </div>
          <Code>{`import { TherapistCardTilt } from "@/components/ui/therapist-card-tilt"

<TherapistCardTilt
  name="James Carter"
  specialty="Deep Tissue · Swedish"
  location="Los Angeles, CA"
  rating={4.9}
  reviewCount={128}
  pricePerHour={180}
  verified
  available
/>`}</Code>
        </Section>

        {/* ── 8. HERO MOCKUP ── */}
        <Section
          title="Hero Mockup — CTA in context"
          description="ButtonLiquidMetal as primary CTA with Secondary alongside — recommended hero pattern."
        >
          <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-10 flex flex-col items-center text-center gap-6">
            <span className="label-eyebrow">Wellness at your door</span>
            <h2 className="font-display text-2xl text-[var(--color-text)] max-w-sm">
              Find the right therapist for you
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
              Verified profiles, direct contact, available across the US.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ButtonLiquidMetal size="lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                Find a Therapist
              </ButtonLiquidMetal>
              <Button variant="outline" size="lg">How it works</Button>
            </div>
            <p className="text-xs text-[var(--color-text-faint)]">Verified therapists in 80+ US cities</p>
          </div>
        </Section>

        {/* Footer */}
        <footer className="py-10 text-center">
          <p className="text-xs text-[var(--color-text-faint)]">
            MasseurMatch Design System v2 · Internal approval only
          </p>
        </footer>
      </div>
    </main>
  );
}
