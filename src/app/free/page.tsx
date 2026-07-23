import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "14 Days Free — No Credit Card | MasseurMatch",
  description:
    "Create your MasseurMatch profile and get discovered by clients in your city. Try it free for 14 days with no credit card required.",
  alternates: { canonical: "https://www.masseurmatch.com/free" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Join MasseurMatch Free for 14 Days",
    description:
      "Build your professional profile, appear in local search, and connect directly with clients. No credit card required.",
    url: "https://www.masseurmatch.com/free",
    siteName: "MasseurMatch",
    type: "website",
  },
};

type FreePageProps = {
  searchParams: Promise<{
    city?: string | string[];
  }>;
};

function normalizeCity(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "your city";

  const cleaned = raw
    .replace(/[^\p{L}\p{N}\s,.'-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);

  return cleaned || "your city";
}

const benefits = [
  {
    icon: MapPin,
    title: "Get found locally",
    body: "Show up when clients search for massage professionals near them.",
  },
  {
    icon: Phone,
    title: "Direct client contact",
    body: "Clients contact you directly. MasseurMatch does not take a cut from your sessions.",
  },
  {
    icon: BadgeCheck,
    title: "Build a trusted profile",
    body: "Present your services, photos, location, availability, and professional details clearly.",
  },
];

const steps = [
  "Create your account",
  "Add your profile details",
  "Submit your profile for review",
];

export default async function FreePage({ searchParams }: FreePageProps) {
  const params = await searchParams;
  const city = normalizeCity(params.city);
  const signupHref =
    "/signup/plan?selected=free&utm_source=sms&utm_medium=sms&utm_campaign=14_day_free";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(139,30,45,0.10),transparent_30%),linear-gradient(180deg,#080e18_0%,#0c1522_48%,#f7f7f7_48%,#ffffff_100%)] text-foreground">
      <section className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-[#8B1E2D]/45 bg-[#8B1E2D]/15 text-[#f2a7b1] hover:bg-[#8B1E2D]/15">
                For massage professionals in {city}
              </Badge>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                <ShieldCheck className="h-3.5 w-3.5" />
                No credit card required
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.7rem,7vw,5.5rem)] font-bold leading-[0.94] tracking-tight text-white">
              Get discovered by clients in {city}.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65 sm:text-xl">
              Create your MasseurMatch profile and try the platform free for 14 days. No credit card, no booking commission, and no payment taken from your massage sessions.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" variant="hero" className="min-h-13 px-7 text-base">
                <Link href={signupHref}>
                  Start My Free 14 Days
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-sm text-white/45">Takes only a few minutes to begin.</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/65">
              {[
                "14 days free",
                "No credit card",
                "Direct contact",
                "Cancel anytime",
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#d65b6c]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
            <div className="rounded-[1.45rem] border border-white/10 bg-[#101a28] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d65b6c]">
                    Your invitation
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-semibold text-white">
                    Professional profile trial
                  </h2>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8B1E2D]/20 text-[#f2a7b1]">
                  <Sparkles className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-end gap-2">
                  <span className="font-display text-5xl font-bold text-white">$0</span>
                  <span className="pb-1 text-sm text-white/45">for 14 days</span>
                </div>
                <p className="mt-2 text-sm text-white/55">No card is collected to start.</p>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-white/70">
                {[
                  "Appear in local discovery",
                  "Add your professional photos and services",
                  "Receive inquiries directly",
                  "Keep 100% of your session earnings",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#d65b6c]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Button asChild size="lg" className="mt-7 w-full bg-white text-[#0a111c] hover:bg-white/90">
                <Link href={signupHref}>Create My Profile</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8B1E2D]">
              Built for independent professionals
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              More visibility. Direct connections. No middleman.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8B1E2D]/10 text-[#8B1E2D]">
                  <benefit.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{benefit.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-[#f7f7f7] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <Badge variant="secondary">Simple sign up</Badge>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Your profile can be started in three steps.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              You control your profile and how clients contact you. MasseurMatch is a directory and does not process appointments or session payments.
            </p>
          </div>

          <ol className="grid gap-4">
            {steps.map((step, index) => (
              <li key={step} className="flex items-center gap-4 rounded-2xl border border-border bg-white px-5 py-4 shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0b1f3a] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#080e18] px-6 py-10 text-center shadow-xl sm:px-12 sm:py-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B1E2D]/20 text-[#f2a7b1]">
            <UserRoundCheck className="h-7 w-7" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#d65b6c]">A note from Marcus</p>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            I built MasseurMatch to give massage professionals a modern, affordable way to be discovered.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/60">
            Start without a card, build your profile, and see how MasseurMatch can help you create a stronger professional presence in {city}.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-sm text-white/60">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" /> 14-day access
            </span>
            <span className="inline-flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> No card required
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Secure sign up
            </span>
          </div>

          <Button asChild size="lg" variant="hero" className="mt-8 min-h-13 px-8 text-base">
            <Link href={signupHref}>
              Start Free Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <p className="mt-4 text-xs text-white/35">
            By signing up, you agree to MasseurMatch&apos;s Terms and Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}
