import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  Globe2,
  Headphones,
  MessageSquare,
  Mic,
  PhoneCall,
  Settings,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.08,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const headerLinks = [
  { label: "Solutions", to: "/contact" },
  { label: "Pricing", to: "/pricing" },
  { label: "Contact", to: "/contact" },
];

const trustPoints = [
  "Setup in 24 hours",
  "English and Portuguese support",
  "No long-term contracts",
];

const stats = [
  { value: "98%", label: "calls answered automatically" },
  { value: "3.1x", label: "faster lead response" },
  { value: "41%", label: "more bookings recovered" },
  { value: "$28k", label: "monthly revenue impact tracked" },
];

const features = [
  {
    icon: Mic,
    title: "AI voice agent",
    description: "Answer inbound calls 24/7 with a natural script tuned to your offers, FAQs, and booking rules.",
  },
  {
    icon: MessageSquare,
    title: "Missed-call recovery",
    description: "Launch instant text-back flows that re-engage missed callers before they book somewhere else.",
  },
  {
    icon: CalendarDays,
    title: "Smart booking",
    description: "Qualify, schedule, and sync appointments directly into your calendar and CRM pipeline.",
  },
  {
    icon: Brain,
    title: "Conversation memory",
    description: "Capture transcripts, summaries, objections, and intent so your team sees the full customer story.",
  },
  {
    icon: Settings,
    title: "Automation layer",
    description: "Trigger follow-ups, handoffs, review requests, and payment nudges from one connected workflow.",
  },
  {
    icon: Shield,
    title: "Operator visibility",
    description: "Track outcomes, monitor recordings, and keep clear audit trails across every lead interaction.",
  },
];

const workflow = [
  {
    icon: PhoneCall,
    step: "01",
    title: "Capture every call",
    description: "The voice agent answers, greets, routes, and qualifies new callers in seconds.",
  },
  {
    icon: Zap,
    step: "02",
    title: "Recover missed demand",
    description: "If a call is missed, Voxmation sends a branded text workflow and keeps the lead warm automatically.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "See the revenue impact",
    description: "Dashboards tie calls, appointments, and recovered opportunities back to revenue you can actually measure.",
  },
];

const commandMetrics = [
  { label: "Total calls", value: "1,284" },
  { label: "Recovered leads", value: "146" },
  { label: "Booked this week", value: "39" },
  { label: "Revenue impact", value: "$18,420" },
];

const activityFeed = [
  { title: "New caller booked", detail: "Kitchen remodel consult scheduled for Tuesday at 2:30 PM", tone: "success" },
  { title: "Missed-call text sent", detail: "Lead replied in 3 minutes and requested a callback", tone: "warning" },
  { title: "CRM sync complete", detail: "Transcript, summary, and lead score pushed to pipeline", tone: "secondary" },
] as const;

const brandGradient = "linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)";
const heroGlow =
  "radial-gradient(circle at 12% 20%, rgb(var(--color-brand-secondary-rgb) / 0.15), transparent 34%), radial-gradient(circle at 88% 18%, rgb(var(--color-brand-accent-rgb) / 0.18), transparent 28%), linear-gradient(180deg, rgb(var(--color-bg-surface-rgb)) 0%, rgb(var(--color-bg-body-rgb)) 100%)";

const toneClassMap = {
  success: "bg-feedback-success/10 text-feedback-success border-feedback-success/20",
  warning: "bg-feedback-warning/10 text-feedback-warning border-feedback-warning/20",
  secondary: "bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20",
} as const;

const HomeTest = () => {
  return (
    <>
      <SEOHead
        title="Voxmation Home Test | AI Voice Agent Design"
        description="Test landing page for Voxmation using the updated logo palette across voice AI, automation, booking, and reporting sections."
        path="/home-test"
      />

      <div className="theme-voxmation min-h-screen bg-bg-body text-text-primary">
        <div className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: heroGlow }}
          />

          <header className="sticky top-0 z-50 border-b border-border-subtle/80 bg-bg-surface/88 backdrop-blur-xl">
            <div className="container mx-auto flex h-[4.5rem] items-center justify-between px-4">
              <Link to="/home-test" className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ background: brandGradient }}
                >
                  <Mic className="h-5 w-5 text-brand-accent" />
                </div>
                <div className="leading-none">
                  <p className="font-heading text-lg font-bold tracking-tight text-brand-primary">
                    VOX<span className="text-brand-accent">matiON</span>
                  </p>
                  <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">AI voice systems</p>
                </div>
              </Link>

              <nav className="hidden items-center gap-8 md:flex">
                {headerLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-sm font-medium text-text-secondary transition-colors hover:text-brand-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <Button asChild variant="ghost" className="hidden text-text-secondary md:inline-flex">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-xl bg-action-primary text-brand-primary shadow-sm transition-colors hover:bg-action-primary-hover"
                >
                  <Link to="/contact">Book a demo</Link>
                </Button>
              </div>
            </div>
          </header>

          <main className="relative z-10">
            <section className="border-b border-border-subtle">
              <div className="container mx-auto grid gap-14 px-4 py-20 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <div className="max-w-2xl">
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-secondary/12 bg-brand-secondary/6 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
                    Built for teams that live on the phone
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, delay: 0.08 }}
                    className="font-heading text-5xl font-bold leading-[0.92] tracking-tight text-brand-primary md:text-6xl lg:text-7xl"
                  >
                    Make every call feel answered, booked, and followed up.
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.75, delay: 0.2 }}
                    className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary md:text-xl"
                  >
                    Voxmation combines AI voice agents, automation, and lead recovery into one premium operating layer for service businesses that cannot afford missed opportunities.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.32 }}
                    className="mt-10 flex flex-col gap-4 sm:flex-row"
                  >
                    <Button
                      asChild
                      size="lg"
                      className="rounded-2xl bg-brand-primary px-8 text-text-inverse shadow-sm transition-transform hover:bg-brand-secondary hover:-translate-y-0.5"
                    >
                      <Link to="/contact">
                        Schedule a live walkthrough
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="rounded-2xl border-border-strong bg-bg-surface px-8 text-brand-primary hover:bg-bg-subtle"
                    >
                      <Link to="/pricing">See pricing</Link>
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.42 }}
                    className="mt-10 flex flex-wrap gap-3"
                  >
                    {trustPoints.map((point) => (
                      <span
                        key={point}
                        className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-surface px-4 py-2 text-sm text-text-secondary"
                      >
                        <CheckCircle2 className="h-4 w-4 text-action-primary" />
                        {point}
                      </span>
                    ))}
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.18 }}
                  className="relative"
                >
                  <div
                    className="rounded-[32px] border border-border-strong/70 bg-bg-surface p-5 md:p-7"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <div
                      className="rounded-[24px] p-5 text-text-inverse"
                      style={{ background: brandGradient }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm uppercase tracking-[0.24em] text-text-inverse/70">Live command center</p>
                          <h2 className="mt-2 text-2xl font-bold">One place to monitor calls, bookings, and recovery.</h2>
                        </div>
                        <div className="hidden rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium md:block">
                          Live sync
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        {commandMetrics.map((metric) => (
                          <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-[0.18em] text-text-inverse/65">{metric.label}</p>
                            <p className="mt-2 text-2xl font-bold">{metric.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 rounded-[24px] border border-border-subtle bg-bg-body p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-brand-primary">Today&apos;s recovery feed</p>
                          <p className="text-sm text-text-secondary">Recent AI actions affecting bookings and revenue.</p>
                        </div>
                        <Headphones className="h-5 w-5 text-brand-secondary" />
                      </div>

                      <div className="mt-5 space-y-3">
                        {activityFeed.map((item) => (
                          <div
                            key={item.title}
                            className="rounded-2xl border border-border-subtle bg-bg-surface p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-text-primary">{item.title}</p>
                                <p className="mt-1 text-sm leading-relaxed text-text-secondary">{item.detail}</p>
                              </div>
                              <span
                                className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${toneClassMap[item.tone]}`}
                              >
                                Live
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="absolute -right-2 -top-4 hidden rounded-2xl border border-brand-accent/30 bg-brand-accent px-4 py-3 text-sm font-semibold text-brand-primary shadow-sm md:block">
                    24/7 receptionist mode active
                  </div>
                </motion.div>
              </div>
            </section>

            <section className="border-b border-border-subtle bg-bg-surface/70">
              <div className="container mx-auto px-4 py-12">
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      custom={index}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.3 }}
                      variants={fadeUp}
                      className="rounded-3xl border border-border-subtle bg-bg-surface p-6"
                      style={{ boxShadow: "var(--shadow-subtle)" }}
                    >
                      <p className="text-4xl font-bold tracking-tight text-brand-primary">{stat.value}</p>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-20 md:py-24">
              <div className="container mx-auto px-4">
                <div className="mx-auto mb-14 max-w-2xl text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-accent">Platform capabilities</p>
                  <h2 className="mt-4 font-heading text-4xl font-bold tracking-tight text-brand-primary md:text-5xl">
                    Premium tools that make the operation feel tighter, faster, and more reliable.
                  </h2>
                  <p className="mt-5 text-lg leading-relaxed text-text-secondary">
                    Every layer is designed to help you answer more demand, automate follow-up, and show clients exactly what the AI is contributing.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      custom={index}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.2 }}
                      variants={fadeUp}
                      className="group rounded-[28px] border border-border-subtle bg-bg-surface p-7 transition-transform duration-300 hover:-translate-y-1"
                      style={{ boxShadow: "var(--shadow-subtle)" }}
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/6 text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-text-inverse">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-6 text-2xl font-bold text-text-primary">{feature.title}</h3>
                      <p className="mt-3 text-base leading-relaxed text-text-secondary">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            <section className="border-y border-border-subtle bg-bg-surface py-20 md:py-24">
              <div className="container mx-auto px-4">
                <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                  <div className="max-w-xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-accent">How it works</p>
                    <h2 className="mt-4 font-heading text-4xl font-bold tracking-tight text-brand-primary md:text-5xl">
                      The system handles the call, the follow-up, and the reporting loop.
                    </h2>
                    <p className="mt-5 text-lg leading-relaxed text-text-secondary">
                      Voxmation is strongest when it feels invisible to your operators and obvious in the numbers. The workflow below is what clients actually log in to monitor.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {workflow.map((item, index) => (
                      <motion.div
                        key={item.step}
                        custom={index}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeUp}
                        className="flex flex-col gap-5 rounded-[28px] border border-border-subtle bg-bg-body p-6 md:flex-row md:items-start"
                      >
                        <div className="flex items-center gap-4 md:block">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-secondary text-text-inverse">
                            <item.icon className="h-6 w-6" />
                          </div>
                          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.28em] text-brand-secondary">{item.step}</p>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-text-primary">{item.title}</h3>
                          <p className="mt-3 text-base leading-relaxed text-text-secondary">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="py-20 md:py-24">
              <div className="container mx-auto px-4">
                <div
                  className="rounded-[36px] border border-brand-primary/10 p-8 text-text-inverse md:p-12"
                  style={{ background: brandGradient, boxShadow: "var(--shadow-card)" }}
                >
                  <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="max-w-2xl">
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-accent">Ready for a polished client experience?</p>
                      <h2 className="mt-4 font-heading text-4xl font-bold tracking-tight md:text-5xl">
                        Launch a portal your clients trust at first glance.
                      </h2>
                      <p className="mt-5 text-lg leading-relaxed text-text-inverse/76">
                        Use the updated palette across the homepage, dashboards, pricing, and reporting screens so the brand feels consistent from the first visit through the client portal.
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
                      <Button
                        asChild
                        size="lg"
                        className="rounded-2xl bg-action-primary px-8 text-brand-primary hover:bg-action-primary-hover"
                      >
                        <Link to="/contact">
                          Talk to sales
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="rounded-2xl border-white/25 bg-white/10 px-8 text-text-inverse hover:bg-white/15"
                      >
                        <Link to="/pricing">
                          View plans
                          <Globe2 className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <footer className="border-t border-border-subtle bg-bg-surface">
            <div className="container mx-auto flex flex-col gap-5 px-4 py-8 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ background: brandGradient }}
                >
                  <Mic className="h-4 w-4 text-brand-accent" />
                </div>
                <div>
                  <p className="font-heading font-bold tracking-tight text-brand-primary">
                    VOX<span className="text-brand-accent">matiON</span>
                  </p>
                  <p className="text-sm text-text-secondary">AI voice agents, automation, and recovery</p>
                </div>
              </div>

              <p className="text-sm text-text-secondary">Copyright 2026 Voxmation. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default HomeTest;
