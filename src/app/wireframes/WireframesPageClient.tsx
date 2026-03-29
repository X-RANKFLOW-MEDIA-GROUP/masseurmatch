"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Download,
  FileCode2,
  FilePenLine,
  Layers3,
  Monitor,
  ShieldCheck,
  Smartphone,
  Tablet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import styles from "./wireframes.module.css";
import {
  ACCESSIBILITY_CHECKLIST,
  COMPONENT_INVENTORY,
  CONTRAST_PAIRS,
  EXPORT_ASSETS,
  FIGMA_HANDOFF,
  PROTOTYPE_FLOW,
  SCREENS,
  VIEWPORTS,
  type ComponentInventoryItem,
  type ContrastPair,
  type ScreenStateSpec,
  type WireframeBlock,
  type WireframeHeight,
  type WireframeScreenSpec,
  type WireframeStateId,
  type WireframeTone,
  type WireframeViewportId,
} from "./_data";

const viewportOrder: WireframeViewportId[] = ["desktop", "tablet", "mobile"];
const heightMap: Record<WireframeHeight, string> = {
  xs: "2.75rem",
  sm: "3.5rem",
  md: "5rem",
  lg: "8rem",
  xl: "11rem",
};

function toneClass(tone: WireframeTone | undefined) {
  switch (tone) {
    case "accent":
      return styles.blockAccent;
    case "support":
    case "success":
      return styles.blockSupport;
    case "warning":
      return styles.blockWarning;
    case "ghost":
      return styles.blockGhost;
    default:
      return styles.blockSurface;
  }
}

function viewportIcon(viewportId: WireframeViewportId) {
  switch (viewportId) {
    case "desktop":
      return Monitor;
    case "tablet":
      return Tablet;
    case "mobile":
      return Smartphone;
  }
}

function swatchStyle(color: string): CSSProperties {
  return { backgroundColor: color };
}

function blockStyle(block: WireframeBlock): CSSProperties {
  return {
    gridColumn: `span ${block.span} / span ${block.span}`,
    minHeight: heightMap[block.height],
  };
}

function ViewportCard({
  screen,
  viewportId,
  state,
}: {
  screen: WireframeScreenSpec;
  viewportId: WireframeViewportId;
  state: ScreenStateSpec;
}) {
  const viewport = VIEWPORTS[viewportId];
  const layout = screen.layouts[viewportId];
  const ViewportIcon = viewportIcon(viewportId);

  return (
    <section aria-labelledby={`${screen.id}-${viewportId}-title`} className={styles.wireframeCanvas}>
      <div className={styles.canvasTop}>
        <div className="flex items-center gap-3">
          <div className={styles.browserDots} aria-hidden="true">
            <span className={styles.browserDot} />
            <span className={styles.browserDot} />
            <span className={styles.browserDot} />
          </div>
          <div>
            <p id={`${screen.id}-${viewportId}-title`} className="text-sm font-semibold text-[#102A43]">
              {viewport.label}
            </p>
            <p className="text-xs text-[#61758A]">{viewport.frame}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={styles.browserPill}>{state.label}</span>
          <span className={styles.browserPill}>
            <ViewportIcon className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      <div className={styles.canvasBody}>
        <div className="rounded-2xl border border-[#D6D0C4] bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61758A]">Viewport note</p>
          <p className="mt-2 text-sm leading-6 text-[#334E68]">{layout.note}</p>
          <p className="mt-2 text-sm leading-6 text-[#334E68]">{state.canvasNote}</p>
        </div>

        {layout.bands.map((band) => (
          <div key={band.label} className={styles.canvasBand}>
            <p className={styles.bandLabel}>{band.label}</p>
            <div
              className={styles.canvasGrid}
              style={{ gridTemplateColumns: `repeat(${band.columns}, minmax(0, 1fr))` }}
            >
              {band.blocks.map((block, index) => (
                <div
                  key={`${band.label}-${block.label}-${index}`}
                  className={cn(
                    styles.canvasBlock,
                    toneClass(block.tone),
                    block.interactive && styles.blockInteractive,
                  )}
                  style={blockStyle(block)}
                >
                  <span>{block.label}</span>
                  {block.interactive ? <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScreenSection({ screen }: { screen: WireframeScreenSpec }) {
  const [activeStateId, setActiveStateId] = useState<WireframeStateId>("logged-out");
  const activeState = screen.states.find((state) => state.id === activeStateId) ?? screen.states[0];

  return (
    <article id={screen.id} className="scroll-mt-28">
      <div className={cn(styles.sectionCard, "p-6 md:p-8")}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className={styles.eyebrow}>{screen.route}</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#102A43] md:text-4xl">{screen.title}</h2>
            <p className="mt-4 text-base leading-7 text-[#334E68]">{screen.description}</p>
            <p className="mt-3 text-sm font-semibold text-[#1E3E70]">{screen.goal}</p>
          </div>

          <div className="flex flex-wrap gap-3" aria-label={`${screen.title} state toggle`}>
            {screen.states.map((state) => (
              <button
                key={state.id}
                type="button"
                aria-pressed={activeState.id === state.id}
                className={cn(styles.stateButton, activeState.id === state.id && styles.stateActive)}
                onClick={() => setActiveStateId(state.id)}
              >
                {state.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {screen.states.map((state) => (
            <button
              key={`${screen.id}-${state.id}`}
              type="button"
              className={cn(
                styles.infoCard,
                "p-5 text-left transition duration-200",
                activeState.id === state.id ? "ring-2 ring-[#0F62FE] ring-offset-4 ring-offset-[#F7F4EE]" : "",
              )}
              aria-pressed={activeState.id === state.id}
              onClick={() => setActiveStateId(state.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-[#102A43]">{state.label}</h3>
                <span className={styles.browserPill}>{state.id}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#334E68]">{state.summary}</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-[#334E68]">
                <p><span className="font-semibold text-[#102A43]">Navigation:</span> {state.navigation}</p>
                <p><span className="font-semibold text-[#102A43]">Primary action:</span> {state.primaryAction}</p>
                <p><span className="font-semibold text-[#102A43]">Access:</span> {state.accessPattern}</p>
                <p><span className="font-semibold text-[#102A43]">Knotty AI:</span> {state.knottyBehavior}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {viewportOrder.map((viewportId) => (
            <ViewportCard key={`${screen.id}-${viewportId}`} screen={screen} viewportId={viewportId} state={activeState} />
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <div className={cn(styles.infoCard, "p-5")}>
            <h3 className="text-lg font-semibold text-[#102A43]">Component structure</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#334E68]">
              {screen.structure.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#1E3E70]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={cn(styles.infoCard, "p-5")}>
            <h3 className="text-lg font-semibold text-[#102A43]">Spacing rules</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#334E68]">
              {screen.spacingRules.map((item) => (
                <li key={item} className="flex gap-3">
                  <Layers3 className="mt-1 h-4 w-4 shrink-0 text-[#1E3E70]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={cn(styles.infoCard, "p-5")}>
            <h3 className="text-lg font-semibold text-[#102A43]">Alignment rules</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#334E68]">
              {screen.alignmentRules.map((item) => (
                <li key={item} className="flex gap-3">
                  <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-[#1E3E70]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}

function ButtonsPreview() {
  return (
    <div className={styles.previewRow}>
      <button type="button" className={styles.primaryButton}>Primary</button>
      <button type="button" className={styles.secondaryButton}>Secondary</button>
      <button type="button" className={styles.ghostButton}>Ghost</button>
      <button type="button" className={styles.primaryButton} disabled>Disabled</button>
    </div>
  );
}

function PillsPreview() {
  return (
    <div className={styles.previewRow}>
      <span className={cn(styles.pill, styles.pillAvailable)}>
        <span className={styles.liveDot} aria-hidden="true" />
        Available Now
      </span>
      <span className={cn(styles.pill, styles.pillVisiting)}>Visiting Soon</span>
      <span className={cn(styles.pill, styles.pillNew)}>New Profile</span>
    </div>
  );
}

function ProfileCardPreview() {
  return (
    <div className={styles.profileCard3d}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61758A]">Featured profile</p>
          <h4 className="mt-2 text-xl font-semibold text-[#102A43]">Jordan Lane</h4>
          <p className="mt-1 text-sm text-[#334E68]">Dallas, TX · ID Verified · Outcall</p>
        </div>
        <span className={cn(styles.pill, styles.pillAvailable)}>
          <span className={styles.liveDot} aria-hidden="true" />
          Available
        </span>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-6 text-[#334E68]">
        <p>3D card keeps the avatar, trust badges, rates, and CTA above the fold in one predictable reading order.</p>
        <div className="flex flex-wrap gap-2">
          <span className={styles.browserPill}>Deep tissue</span>
          <span className={styles.browserPill}>Sports recovery</span>
          <span className={styles.browserPill}>LGBTQ+ friendly</span>
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <button type="button" className={styles.primaryButton}>View profile</button>
        <button type="button" className={styles.secondaryButton}>Save</button>
      </div>
    </div>
  );
}

function FormsPreview() {
  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold text-[#102A43]">
        Full name
        <input className={styles.field} defaultValue="Jordan Lane" />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#102A43]">
        Listing tier
        <select className={styles.field} defaultValue="pro">
          <option value="standard">Standard</option>
          <option value="pro">Pro</option>
          <option value="elite">Elite</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#102A43]">
        Error state
        <input className={cn(styles.field, styles.fieldError)} defaultValue="missing@example" />
        <span className="text-sm text-[#8C1D18]">Enter a valid email address.</span>
      </label>
      <div className={styles.modalShell}>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#61758A]">Modal</p>
        <h4 className="mt-2 text-lg font-semibold text-[#102A43]">Confirm publish</h4>
        <p className="mt-2 text-sm leading-6 text-[#334E68]">Review required fields, plan limits, and accessibility checks before publishing.</p>
      </div>
    </div>
  );
}

function ChatPreview() {
  return (
    <div className={styles.chatShell}>
      <div className={styles.chatHeader}>
        <p className="text-sm font-semibold text-[#102A43]">Knotty AI</p>
        <p className="mt-1 text-sm text-[#334E68]">Discovery assistant with quick prompts and account-safe follow-up actions.</p>
      </div>
      <div className={styles.chatTranscript}>
        <div className={styles.chatBubbleAssistant}>I can help narrow by city, availability, pricing, or provider plans.</div>
        <div className={styles.chatBubbleUser}>Show therapists in Dallas.</div>
        <div className={styles.chatBubbleAssistant}>I’d start in Explore with the verified filter on and Knotty suggested chips above the result grid.</div>
      </div>
      <div className="border-t border-[#E7E0D6] p-4">
        <div className={styles.previewRow}>
          <button type="button" className={styles.promptButton}>Find availability</button>
          <button type="button" className={styles.promptButton}>Compare plans</button>
          <button type="button" className={styles.promptButton}>Open dashboard</button>
        </div>
      </div>
    </div>
  );
}

function ComponentPreview({ item }: { item: ComponentInventoryItem }) {
  switch (item.preview) {
    case "buttons":
      return <ButtonsPreview />;
    case "pills":
      return <PillsPreview />;
    case "profile-card":
      return <ProfileCardPreview />;
    case "forms":
      return <FormsPreview />;
    case "chat":
      return <ChatPreview />;
  }
}

function ComponentCard({ item }: { item: ComponentInventoryItem }) {
  return (
    <article className={cn(styles.componentCard, "p-5")}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61758A]">{item.category}</p>
          <h3 className="mt-2 text-xl font-semibold text-[#102A43]">{item.title}</h3>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#334E68]">{item.description}</p>
      <div className="mt-4">
        <ComponentPreview item={item} />
      </div>
      <div className="mt-5">
        <p className="text-sm font-semibold text-[#102A43]">Tailwind base reference</p>
        <pre className={cn(styles.codePill, "mt-2 overflow-x-auto whitespace-pre-wrap")}>{item.tailwindReference}</pre>
      </div>
      <div className="mt-5 grid gap-3">
        {item.states.map((state) => (
          <div key={state.name} className="rounded-2xl border border-[#D6D0C4] bg-white/80 p-4">
            <p className="text-sm font-semibold text-[#102A43]">{state.name}</p>
            <pre className={cn(styles.codePill, "mt-2 overflow-x-auto whitespace-pre-wrap")}>{state.tailwind}</pre>
            <p className="mt-2 text-sm leading-6 text-[#334E68]">{state.note}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function ContrastRow({ pair }: { pair: ContrastPair }) {
  return (
    <tr className="border-b border-[#E7E0D6] align-top">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <span className={styles.tokenSwatch} style={swatchStyle(pair.foreground)} aria-hidden="true" />
          <span className={styles.tokenSwatch} style={swatchStyle(pair.background)} aria-hidden="true" />
          <div>
            <p className="font-semibold text-[#102A43]">{pair.label}</p>
            <p className="text-sm text-[#334E68]">{pair.usage}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-[#334E68]">{pair.foreground}</td>
      <td className="px-4 py-4 text-sm text-[#334E68]">{pair.background}</td>
      <td className="px-4 py-4 text-sm font-semibold text-[#102A43]">{pair.ratio}</td>
    </tr>
  );
}

export function WireframesPageClient() {
  return (
    <div className={styles.shell}>
      <a href="#wireframes-main" className={styles.skipLink}>
        Skip to wireframe content
      </a>

      <div className="page-shell py-10 sm:py-14">
        <header className={cn(styles.heroCard, "p-6 md:p-8 lg:p-10")}>
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            <div className="relative z-[1]">
              <p className={styles.eyebrow}>Wireframe system</p>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-[#102A43] md:text-5xl lg:text-6xl">
                Complete wireframes, clickable prototype, and accessibility handoff for every major MasseurMatch screen.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#334E68] md:text-lg">
                This workbench covers homepage, explore, profile, join, dashboard, admin, legal, and Knotty AI views in
                desktop, tablet, and mobile layouts with logged-in and logged-out variations.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/wireframes/prototype" className={styles.primaryButton}>
                  Open clickable prototype
                </Link>
                <a href="/exports/masseurmatch-wireframes-accessibility.css" className={styles.secondaryButton}>
                  Download exported stylesheet
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-[#334E68]">
                <span className={styles.browserPill}>8 screen families</span>
                <span className={styles.browserPill}>3 responsive breakpoints</span>
                <span className={styles.browserPill}>2 auth states</span>
                <span className={styles.browserPill}>WCAG 2.2 AA notes</span>
              </div>
            </div>

            <aside className={cn(styles.infoCard, "relative z-[1] p-5")}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61758A]">Export pack</p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-[#334E68]">
                <p>
                  The prototype route is optimized for user testing, while the stylesheet export and Figma notes keep the
                  handoff consistent with the implementation tokens.
                </p>
                <div className="space-y-3">
                  {EXPORT_ASSETS.map((asset) => (
                    <div key={asset.title} className="rounded-2xl border border-[#D6D0C4] bg-white/80 p-4">
                      <div className="flex items-center gap-3">
                        {asset.path.startsWith("/") ? (
                          <Download className="h-4 w-4 text-[#1E3E70]" />
                        ) : (
                          <FilePenLine className="h-4 w-4 text-[#1E3E70]" />
                        )}
                        <p className="font-semibold text-[#102A43]">{asset.title}</p>
                      </div>
                      {asset.path.startsWith("/") ? (
                        <a href={asset.path} className="mt-3 inline-flex text-sm font-semibold text-[#1E3E70] underline underline-offset-4">
                          {asset.path}
                        </a>
                      ) : (
                        <pre className={cn(styles.codePill, "mt-3 whitespace-pre-wrap")}>{asset.path}</pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </header>

        <nav className={cn(styles.sectionCard, "mt-6 p-5")} aria-label="Wireframe sections">
          <div className={styles.anchorNav}>
            <a href="#flow-map" className={styles.anchorLink}>Flow map</a>
            {SCREENS.map((screen) => (
              <a key={screen.id} href={`#${screen.id}`} className={styles.anchorLink}>
                {screen.title}
              </a>
            ))}
            <a href="#components" className={styles.anchorLink}>Components</a>
            <a href="#accessibility" className={styles.anchorLink}>Accessibility</a>
          </div>
        </nav>

        <main id="wireframes-main" className="mt-8 space-y-8">
          <section id="flow-map" className={cn(styles.sectionCard, "p-6 md:p-8")}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className={styles.eyebrow}>Prototype flow</p>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#102A43]">Home → Explore → Profile → Join → Dashboard</h2>
                <p className="mt-4 text-base leading-7 text-[#334E68]">
                  The core clickable prototype follows the public discovery path into provider onboarding and completion.
                  Knotty AI prompts can jump the tester forward at each step.
                </p>
              </div>
              <Link href="/wireframes/prototype" className={styles.actionButton}>
                Launch test flow
              </Link>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-5">
              {PROTOTYPE_FLOW.map((step, index) => (
                <article key={step.id} className={cn(styles.infoCard, "p-5")}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61758A]">Step {index + 1}</p>
                  <h3 className="mt-2 text-xl font-semibold text-[#102A43]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#334E68]">{step.goal}</p>
                  <p className="mt-3 text-sm font-semibold text-[#1E3E70]">{step.hotspotHint}</p>
                </article>
              ))}
            </div>
          </section>

          {SCREENS.map((screen) => (
            <ScreenSection key={screen.id} screen={screen} />
          ))}

          <section id="components" className={cn(styles.sectionCard, "p-6 md:p-8")}>
            <div className="max-w-3xl">
              <p className={styles.eyebrow}>Reusable components</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#102A43]">Master component inventory with state references</h2>
              <p className="mt-4 text-base leading-7 text-[#334E68]">
                Each component preview pairs the design intent with Tailwind class references for hover, active,
                disabled, and error states where relevant.
              </p>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {COMPONENT_INVENTORY.map((item) => (
                <ComponentCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          <section id="accessibility" className={cn(styles.sectionCard, "p-6 md:p-8")}>
            <div className="max-w-3xl">
              <p className={styles.eyebrow}>Accessibility handoff</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#102A43]">WCAG 2.2 AA decisions baked into the wireframes</h2>
              <p className="mt-4 text-base leading-7 text-[#334E68]">
                Contrast, focus, keyboard flow, semantic regions, and scalable type are specified here so they transfer
                into prototype review, Figma construction, and stylesheet export consistently.
              </p>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {ACCESSIBILITY_CHECKLIST.map((group) => (
                <article key={group.title} className={cn(styles.infoCard, "p-5")}>
                  <h3 className="text-lg font-semibold text-[#102A43]">{group.title}</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[#334E68]">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-[#1E3E70]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className={cn(styles.infoCard, "mt-6 overflow-hidden")}>
              <div className="border-b border-[#E7E0D6] px-6 py-5">
                <h3 className="text-xl font-semibold text-[#102A43]">Contrast ratios</h3>
                <p className="mt-2 text-sm leading-6 text-[#334E68]">Core color pairs used in the accessible prototype and exported stylesheet.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#E7E0D6] text-left text-xs uppercase tracking-[0.16em] text-[#61758A]">
                      <th className="px-4 py-4">Token pair</th>
                      <th className="px-4 py-4">Foreground</th>
                      <th className="px-4 py-4">Background</th>
                      <th className="px-4 py-4">Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CONTRAST_PAIRS.map((pair) => (
                      <ContrastRow key={pair.label} pair={pair} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <article className={cn(styles.infoCard, "p-5")}>
                <div className="flex items-center gap-3">
                  <FileCode2 className="h-5 w-5 text-[#1E3E70]" />
                  <h3 className="text-lg font-semibold text-[#102A43]">Figma integration notes</h3>
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[#334E68]">
                  {FIGMA_HANDOFF.map((item) => (
                    <li key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#1E3E70]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className={cn(styles.infoCard, "p-5")}>
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-[#1E3E70]" />
                  <h3 className="text-lg font-semibold text-[#102A43]">What ships with this pass</h3>
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[#334E68]">
                  <li>Dedicated `/wireframes` hub covering all requested screens, states, and responsive structures.</li>
                  <li>Dedicated `/wireframes/prototype` flow for user-testing across the core public-to-provider journey.</li>
                  <li>Accessible stylesheet export at <code>/exports/masseurmatch-wireframes-accessibility.css</code>.</li>
                  <li>Repo handoff guide at <code>docs/masseurmatch-wireframe-handoff.md</code>.</li>
                </ul>
              </article>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
