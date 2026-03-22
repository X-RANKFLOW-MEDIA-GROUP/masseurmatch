"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  House,
  LayoutDashboard,
  Monitor,
  Search,
  Smartphone,
  Tablet,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import styles from "./wireframes.module.css";
import {
  PROTOTYPE_FLOW,
  PROTOTYPE_SEQUENCE,
  VIEWPORTS,
  getPrototypeStep,
  type PrototypePrompt,
  type PrototypeStepId,
  type WireframeStateId,
  type WireframeViewportId,
} from "./_data";

type PrototypeMessage = {
  id: number;
  role: "assistant" | "user";
  content: string;
};

const viewportOrder: WireframeViewportId[] = ["desktop", "tablet", "mobile"];

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

function SurfaceCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(styles.prototypeSection, className)}>{children}</div>;
}

function PrototypeActionRow({
  onPrimary,
  primaryLabel,
  onSecondary,
  secondaryLabel,
}: {
  onPrimary: () => void;
  primaryLabel: string;
  onSecondary?: () => void;
  secondaryLabel?: string;
}) {
  return (
    <div className="mt-5 flex flex-wrap gap-3">
      <button type="button" className={styles.primaryButton} onClick={onPrimary}>
        {primaryLabel}
      </button>
      {onSecondary && secondaryLabel ? (
        <button type="button" className={styles.secondaryButton} onClick={onSecondary}>
          {secondaryLabel}
        </button>
      ) : null}
    </div>
  );
}

function HomeCanvas({
  viewportId,
  authStateId,
  onNavigate,
}: {
  viewportId: WireframeViewportId;
  authStateId: WireframeStateId;
  onNavigate: (target: PrototypeStepId) => void;
}) {
  const stacked = viewportId !== "desktop";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E0D6] pb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#102A43]">
          <House className="h-4 w-4" />
          MasseurMatch
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-[#334E68]">
          <span className={styles.browserPill}>Therapists</span>
          <span className={styles.browserPill}>Safety</span>
          <span className={styles.browserPill}>{authStateId === "logged-in" ? "Dashboard" : "Join"}</span>
        </div>
      </div>

      <div className={cn("grid gap-4", stacked ? "grid-cols-1" : "grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]")}>
        <SurfaceCard className="bg-[linear-gradient(180deg,#DCEBFF_0%,#F4F8FF_100%)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61758A]">Trust-first homepage</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#102A43]">The safest path into search-led discovery.</h2>
          <p className="mt-4 text-sm leading-7 text-[#334E68]">
            Hero combines trust copy, immediate search, provider onboarding, and a live Knotty entry point.
          </p>
          <PrototypeActionRow
            onPrimary={() => onNavigate("explore")}
            primaryLabel={authStateId === "logged-in" ? "Continue searching" : "Explore therapists"}
            onSecondary={() => onNavigate(authStateId === "logged-in" ? "dashboard" : "join")}
            secondaryLabel={authStateId === "logged-in" ? "Open dashboard" : "Join as provider"}
          />
        </SurfaceCard>

        <SurfaceCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61758A]">Featured spotlight</p>
              <h3 className="mt-2 text-xl font-semibold text-[#102A43]">Jordan Lane</h3>
            </div>
            <span className={cn(styles.pill, styles.pillAvailable)}>Available Now</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#334E68]">3D profile spotlight jumps directly into the detail view while keeping the homepage low-friction.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className={styles.secondaryButton} onClick={() => onNavigate("profile")}>
              Open profile
            </button>
            <button type="button" className={styles.ghostButton} onClick={() => onNavigate("explore")}>
              Browse city cards
            </button>
          </div>
        </SurfaceCard>
      </div>

      <div className={cn("grid gap-4", viewportId === "mobile" ? "grid-cols-1" : "grid-cols-3")}>
        {["Verification signals", "Search by city or specialty", "Knotty shortcuts"].map((item) => (
          <SurfaceCard key={item}>
            <p className="text-sm font-semibold text-[#102A43]">{item}</p>
            <p className="mt-2 text-sm leading-6 text-[#334E68]">Low-fidelity blocks stand in for proof rails, search chips, and AI helper prompts.</p>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}

function ExploreCanvas({
  viewportId,
  authStateId,
  onNavigate,
}: {
  viewportId: WireframeViewportId;
  authStateId: WireframeStateId;
  onNavigate: (target: PrototypeStepId) => void;
}) {
  const stacked = viewportId !== "desktop";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E0D6] pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61758A]">Explore / search</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#102A43]">Verified-first result grid</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={styles.browserPill}>Dallas</span>
          <span className={styles.browserPill}>Verified</span>
          <span className={styles.browserPill}>Outcall</span>
          {authStateId === "logged-in" ? <span className={styles.browserPill}>Saved search</span> : null}
        </div>
      </div>

      <div className={cn("grid gap-4", stacked ? "grid-cols-1" : "grid-cols-[280px_minmax(0,1fr)]")}>
        <SurfaceCard>
          <p className="text-sm font-semibold text-[#102A43]">Filter rail</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Modality", "Price", "Availability", "Tier", "Travel"].map((chip) => (
              <span key={chip} className={styles.browserPill}>{chip}</span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-[#334E68]">On mobile this collapses into a sticky sheet trigger with save and clear actions.</p>
        </SurfaceCard>

        <div className="grid gap-4">
          {[1, 2, 3].map((card) => (
            <SurfaceCard key={card}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#102A43]">Result card {card}</p>
                  <p className="mt-2 text-sm leading-6 text-[#334E68]">Rates, badges, specialties, and short CTA row all stay visible above the fold.</p>
                </div>
                {card === 1 ? <span className={cn(styles.pill, styles.pillAvailable)}>Best match</span> : null}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" className={styles.primaryButton} onClick={() => onNavigate("profile")}>
                  Open profile
                </button>
                <button type="button" className={styles.secondaryButton}>
                  {authStateId === "logged-in" ? "Save shortlist" : "Prompt sign in"}
                </button>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileCanvas({
  viewportId,
  authStateId,
  onNavigate,
}: {
  viewportId: WireframeViewportId;
  authStateId: WireframeStateId;
  onNavigate: (target: PrototypeStepId) => void;
}) {
  const stacked = viewportId !== "desktop";

  return (
    <div className="space-y-4">
      <div className={cn("grid gap-4", stacked ? "grid-cols-1" : "grid-cols-[320px_minmax(0,1fr)]")}>
        <SurfaceCard>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61758A]">Profile media</p>
          <div className="mt-4 rounded-[1.4rem] bg-[#E4ECF7] p-6 text-center text-sm font-semibold text-[#1E3E70]">
            Gallery / hero image
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={cn(styles.pill, styles.pillAvailable)}>Verified</span>
            <span className={styles.browserPill}>Identity checked</span>
            <span className={styles.browserPill}>Photos reviewed</span>
          </div>
        </SurfaceCard>

        <SurfaceCard className="bg-[linear-gradient(180deg,#FFFDF8_0%,#F7F4EE_100%)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61758A]">Profile details</p>
          <h2 className="mt-2 text-3xl font-semibold text-[#102A43]">Jordan Lane</h2>
          <p className="mt-2 text-sm text-[#334E68]">Dallas, TX · Deep tissue · Sports recovery · Outcall</p>
          <p className="mt-4 text-sm leading-7 text-[#334E68]">
            Trust summary, short bio, and contact CTAs stay together so users can validate fit before they leave the page.
          </p>
          <PrototypeActionRow
            onPrimary={() => onNavigate("join")}
            primaryLabel={authStateId === "logged-in" ? "Open provider tools" : "Review provider flow"}
            onSecondary={() => onNavigate("explore")}
            secondaryLabel="Back to explore"
          />
        </SurfaceCard>
      </div>

      <div className={cn("grid gap-4", viewportId === "mobile" ? "grid-cols-1" : "grid-cols-2")}>
        <SurfaceCard>
          <p className="text-sm font-semibold text-[#102A43]">About / services / hours</p>
          <p className="mt-3 text-sm leading-6 text-[#334E68]">The tabbed body becomes an accordion on smaller breakpoints, but the reading order stays intact.</p>
        </SurfaceCard>
        <SurfaceCard>
          <p className="text-sm font-semibold text-[#102A43]">Reviews / FAQ / safety</p>
          <p className="mt-3 text-sm leading-6 text-[#334E68]">Trust and safety remain visible even when users are not signed in.</p>
        </SurfaceCard>
      </div>
    </div>
  );
}

function JoinCanvas({
  viewportId,
  authStateId,
  onNavigate,
}: {
  viewportId: WireframeViewportId;
  authStateId: WireframeStateId;
  onNavigate: (target: PrototypeStepId) => void;
}) {
  const stacked = viewportId !== "desktop";

  return (
    <div className="space-y-4">
      <SurfaceCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61758A]">Provider join</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#102A43]">
              {authStateId === "logged-in" ? "Upgrade or continue setup" : "Create your listing account"}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={styles.browserPill}>Step 1 account</span>
            <span className={styles.browserPill}>Step 2 profile</span>
            <span className={styles.browserPill}>Step 3 publish</span>
          </div>
        </div>
      </SurfaceCard>

      <div className={cn("grid gap-4", stacked ? "grid-cols-1" : "grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]")}>
        <SurfaceCard>
          <p className="text-sm font-semibold text-[#102A43]">Plan comparison</p>
          <div className="mt-4 grid gap-3">
            {["Standard", "Pro", "Elite"].map((plan) => (
              <div key={plan} className="rounded-2xl border border-[#D6D0C4] bg-white/80 p-4">
                <p className="font-semibold text-[#102A43]">{plan}</p>
                <p className="mt-2 text-sm leading-6 text-[#334E68]">Pricing, visibility, and support notes are summarized before the form starts.</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="bg-[linear-gradient(180deg,#DCEBFF_0%,#F6F9FF_100%)]">
          <p className="text-sm font-semibold text-[#102A43]">Account form</p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-[#B6C2D2] bg-white p-4 text-sm text-[#61758A]">Full name</div>
            <div className="rounded-2xl border border-[#B6C2D2] bg-white p-4 text-sm text-[#61758A]">Email address</div>
            <div className="rounded-2xl border border-[#B6C2D2] bg-white p-4 text-sm text-[#61758A]">City and services</div>
          </div>
          <PrototypeActionRow
            onPrimary={() => onNavigate("dashboard")}
            primaryLabel={authStateId === "logged-in" ? "Continue to dashboard" : "Create account"}
            onSecondary={() => onNavigate("profile")}
            secondaryLabel="Back to profile"
          />
        </SurfaceCard>
      </div>
    </div>
  );
}

function DashboardCanvas({
  viewportId,
  authStateId,
  onNavigate,
}: {
  viewportId: WireframeViewportId;
  authStateId: WireframeStateId;
  onNavigate: (target: PrototypeStepId) => void;
}) {
  if (authStateId === "logged-out") {
    return (
      <SurfaceCard className="bg-[linear-gradient(180deg,#FFF1E8_0%,#FFF7F1_100%)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A2E0B]">Secure access gate</p>
        <h2 className="mt-3 text-3xl font-semibold text-[#102A43]">Sign in to open the provider workspace.</h2>
        <p className="mt-4 text-sm leading-7 text-[#334E68]">
          Logged-out dashboard views should explain what is behind the gate instead of showing a blank or broken screen.
        </p>
        <PrototypeActionRow onPrimary={() => onNavigate("join")} primaryLabel="Return to join" onSecondary={() => onNavigate("home")} secondaryLabel="Back to home" />
      </SurfaceCard>
    );
  }

  return (
    <div className="space-y-4">
      <SurfaceCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61758A]">Provider dashboard</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#102A43]">Welcome back, Jordan.</h2>
          </div>
          <button type="button" className={styles.secondaryButton} onClick={() => onNavigate("home")}>
            Restart test flow
          </button>
        </div>
      </SurfaceCard>

      <div className={cn("grid gap-4", viewportId === "mobile" ? "grid-cols-1" : "grid-cols-4")}>
        {["Completeness 82%", "Status Draft", "Views 124", "Reviews 18"].map((card) => (
          <SurfaceCard key={card}>
            <p className="text-sm font-semibold text-[#102A43]">{card}</p>
          </SurfaceCard>
        ))}
      </div>

      <div className={cn("grid gap-4", viewportId === "desktop" ? "grid-cols-[320px_minmax(0,1fr)]" : "grid-cols-1")}>
        <SurfaceCard className="bg-[linear-gradient(180deg,#DCEBFF_0%,#F4F8FF_100%)]">
          <p className="text-sm font-semibold text-[#102A43]">High-impact checklist</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#334E68]">
            <li>Finish pricing and availability.</li>
            <li>Upload final profile photos.</li>
            <li>Publish FAQ answers.</li>
          </ul>
        </SurfaceCard>
        <SurfaceCard>
          <p className="text-sm font-semibold text-[#102A43]">Photos, FAQ, analytics, and Knotty support</p>
          <p className="mt-4 text-sm leading-7 text-[#334E68]">The dashboard ends the prototype flow with actionable modules instead of passive reporting only.</p>
        </SurfaceCard>
      </div>
    </div>
  );
}

function PrototypeCanvas({
  stepId,
  viewportId,
  authStateId,
  onNavigate,
}: {
  stepId: PrototypeStepId;
  viewportId: WireframeViewportId;
  authStateId: WireframeStateId;
  onNavigate: (target: PrototypeStepId) => void;
}) {
  switch (stepId) {
    case "home":
      return <HomeCanvas viewportId={viewportId} authStateId={authStateId} onNavigate={onNavigate} />;
    case "explore":
      return <ExploreCanvas viewportId={viewportId} authStateId={authStateId} onNavigate={onNavigate} />;
    case "profile":
      return <ProfileCanvas viewportId={viewportId} authStateId={authStateId} onNavigate={onNavigate} />;
    case "join":
      return <JoinCanvas viewportId={viewportId} authStateId={authStateId} onNavigate={onNavigate} />;
    case "dashboard":
      return <DashboardCanvas viewportId={viewportId} authStateId={authStateId} onNavigate={onNavigate} />;
  }
}

export function PrototypePageClient() {
  const reduceMotion = useHydratedReducedMotion();
  const [activeStepId, setActiveStepId] = useState<PrototypeStepId>("home");
  const [viewportId, setViewportId] = useState<WireframeViewportId>("desktop");
  const [authStateId, setAuthStateId] = useState<WireframeStateId>("logged-out");
  const [messages, setMessages] = useState<PrototypeMessage[]>([
    {
      id: 1,
      role: "assistant",
      content: "I’m Knotty. Pick a prompt and I’ll explain the next move in the user-testing flow.",
    },
  ]);

  const activeStep = useMemo(() => getPrototypeStep(activeStepId), [activeStepId]);
  const activeIndex = PROTOTYPE_SEQUENCE.indexOf(activeStepId);

  useEffect(() => {
    if (activeStepId === "dashboard" && authStateId === "logged-out") {
      setAuthStateId("logged-in");
    }
  }, [activeStepId, authStateId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      if (tagName === "input" || tagName === "textarea" || tagName === "select") {
        return;
      }

      if (event.key === "ArrowRight" && activeIndex < PROTOTYPE_SEQUENCE.length - 1) {
        setActiveStepId(PROTOTYPE_SEQUENCE[activeIndex + 1]);
      }

      if (event.key === "ArrowLeft" && activeIndex > 0) {
        setActiveStepId(PROTOTYPE_SEQUENCE[activeIndex - 1]);
      }

      if (event.key === "1") setViewportId("desktop");
      if (event.key === "2") setViewportId("tablet");
      if (event.key === "3") setViewportId("mobile");
      if (event.key.toLowerCase() === "l") {
        setAuthStateId((current) => (current === "logged-out" ? "logged-in" : "logged-out"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  const goTo = (target: PrototypeStepId) => {
    setActiveStepId(target);
    if (target === "dashboard") {
      setAuthStateId("logged-in");
    }
  };

  const handlePrompt = (prompt: PrototypePrompt) => {
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: "user",
        content: prompt.label,
      },
      {
        id: Date.now() + 1,
        role: "assistant",
        content: prompt.response,
      },
    ]);

    if (prompt.target) {
      window.setTimeout(() => {
        goTo(prompt.target!);
      }, 360);
    }
  };

  return (
    <div className={styles.shell}>
      <a href="#prototype-main" className={styles.skipLink}>
        Skip to prototype canvas
      </a>

      <div className="page-shell py-10 sm:py-14">
        <header className={cn(styles.heroCard, "p-6 md:p-8")}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className={styles.eyebrow}>Clickable prototype</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#102A43] md:text-5xl">
                User-testing flow from homepage to provider dashboard.
              </h1>
              <p className="mt-4 text-base leading-8 text-[#334E68]">
                This route connects the key path, applies motion between steps, supports keyboard shortcuts, and keeps
                Knotty AI interactions local so testing is reliable.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/wireframes" className={styles.secondaryButton}>
                Back to wireframes
              </Link>
              <a href="/exports/masseurmatch-wireframes-accessibility.css" className={styles.actionButton}>
                Export CSS
              </a>
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <main id="prototype-main" className="space-y-4">
            <section className={cn(styles.sectionCard, "p-5")} aria-label="Prototype stepper">
              <div className="flex flex-wrap gap-3">
                {PROTOTYPE_FLOW.map((step, index) => {
                  const Icon =
                    step.id === "home"
                      ? House
                      : step.id === "explore"
                        ? Search
                        : step.id === "profile"
                          ? UserRound
                          : step.id === "join"
                            ? Bot
                            : LayoutDashboard;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      aria-current={step.id === activeStepId ? "step" : undefined}
                      className={cn(styles.stepButton, step.id === activeStepId && styles.stepActive)}
                      onClick={() => goTo(step.id)}
                    >
                      <Icon className="mr-2 inline h-4 w-4" />
                      {index + 1}. {step.title}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={cn(styles.sectionCard, "p-5")}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-3" aria-label="Viewport selector">
                  {viewportOrder.map((id) => {
                    const Icon = viewportIcon(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        className={cn(styles.viewportButton, viewportId === id && styles.viewportActive)}
                        onClick={() => setViewportId(id)}
                      >
                        <Icon className="mr-2 inline h-4 w-4" />
                        {VIEWPORTS[id].label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-3" aria-label="Authentication state selector">
                  {(["logged-out", "logged-in"] as WireframeStateId[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={cn(styles.stateButton, authStateId === id && styles.stateActive)}
                      onClick={() => setAuthStateId(id)}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <AnimatePresence mode="wait" initial={false}>
              <motion.section
                key={`${activeStepId}-${viewportId}-${authStateId}`}
                className={styles.prototypeFrame}
                initial={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.985 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -12, scale: 0.99 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.prototypeBrowser}>
                  <div className="flex items-center gap-3">
                    <div className={styles.browserDots} aria-hidden="true">
                      <span className={styles.browserDot} />
                      <span className={styles.browserDot} />
                      <span className={styles.browserDot} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#102A43]">{activeStep.title}</p>
                      <p className="text-xs text-[#61758A]">{activeStep.route}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={styles.browserPill}>{VIEWPORTS[viewportId].frame}</span>
                    <span className={styles.browserPill}>{authStateId}</span>
                  </div>
                </div>

                <div className={styles.prototypeBody}>
                  <PrototypeCanvas
                    stepId={activeStepId}
                    viewportId={viewportId}
                    authStateId={authStateId}
                    onNavigate={goTo}
                  />
                </div>
              </motion.section>
            </AnimatePresence>

            <section className={cn(styles.sectionCard, "p-5")}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm leading-6 text-[#334E68]">
                  Keyboard shortcuts:
                  {" "}
                  <code>←</code>
                  /
                  <code>→</code>
                  {" "}
                  change steps,
                  {" "}
                  <code>1</code>
                  /
                  <code>2</code>
                  /
                  <code>3</code>
                  {" "}
                  switch viewports,
                  {" "}
                  <code>L</code>
                  {" "}
                  toggles logged-in state.
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className={styles.actionButton}
                    disabled={activeIndex === 0}
                    onClick={() => activeIndex > 0 && goTo(PROTOTYPE_SEQUENCE[activeIndex - 1])}
                  >
                    <ArrowLeft className="mr-2 inline h-4 w-4" />
                    Previous
                  </button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    disabled={activeIndex === PROTOTYPE_SEQUENCE.length - 1}
                    onClick={() => activeIndex < PROTOTYPE_SEQUENCE.length - 1 && goTo(PROTOTYPE_SEQUENCE[activeIndex + 1])}
                  >
                    Next
                    <ArrowRight className="ml-2 inline h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>
          </main>

          <aside className={cn(styles.prototypePanel, styles.prototypeSidebar, "p-5")}>
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-[#1E3E70]" />
              <div>
                <p className="text-sm font-semibold text-[#102A43]">Knotty AI prototype</p>
                <p className="text-sm text-[#334E68]">Local prompt simulation for reliable user testing.</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#D6D0C4] bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61758A]">Current step</p>
              <h2 className="mt-2 text-xl font-semibold text-[#102A43]">{activeStep.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#334E68]">{activeStep.goal}</p>
              <p className="mt-3 text-sm font-semibold text-[#1E3E70]">{activeStep.hotspotHint}</p>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-[#102A43]">Prompt shortcuts</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeStep.prompts.map((prompt) => (
                  <button key={prompt.label} type="button" className={styles.promptButton} onClick={() => handlePrompt(prompt)}>
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#D6D0C4] bg-white/80 p-4">
              <p className="text-sm font-semibold text-[#102A43]">Transcript</p>
              <div className={cn(styles.transcriptList, "mt-4")} aria-live="polite" aria-label="Knotty transcript">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={message.role === "assistant" ? styles.chatBubbleAssistant : styles.chatBubbleUser}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#D6D0C4] bg-white/80 p-4">
              <p className="text-sm font-semibold text-[#102A43]">Testing checklist</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#334E68]">
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#1E3E70]" />
                  <span>Verify step-to-step movement in desktop, tablet, and mobile modes.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#1E3E70]" />
                  <span>Confirm logged-out and logged-in states do not break the primary CTA path.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#1E3E70]" />
                  <span>Run keyboard-only navigation through stepper, viewport controls, and prompt chips.</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
