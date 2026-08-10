import type { Metadata } from "next";
import Link from "next/link";
import { Camera, CheckCircle2, ImageOff, XCircle } from "lucide-react";

import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, createPageMetadata } from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Photo and Profile Content Policy",
  description: "Requirements and restrictions for profile photos, workspace images, and profile content on MasseurMatch.",
  path: "/photo-profile-policy",
  keywords: ["photo policy", "profile photo rules", "image guidelines", "profile content policy"],
});

const allowed = [
  "Clear, professional photos that accurately represent the provider",
  "Professional shirtless photos when non-explicit and not sexually posed",
  "Fitness, swimwear, wellness, and bodywork-related images when presented professionally",
  "Workspace or studio photos showing the actual location where services are offered",
  "Professional headshots with or without the face visible, including privacy-conscious compositions",
  "Before/after wellness photos relevant to services offered when non-sexual and non-medical",
  "Certification or credential documents when optional and accurately described as self-declared unless MasseurMatch expressly verifies them",
];

const prohibited = [
  "Visible genitalia, explicit nudity, or deliberately emphasized genital areas",
  "Sexual activity, simulated sexual activity, masturbation, genital touching, or sexually explicit imagery",
  "Sexually suggestive or erotic poses reasonably interpreted as advertising sexual services",
  "Images, captions, overlays, or profile content advertising or implying prostitution, commercial sexual activity, erotic services, or sexual services",
  "Coded language intended to evade MasseurMatch's prohibition on sexual or illegal services",
  "Photos depicting minors or persons who reasonably appear to be minors in a sexualized context",
  "AI-generated or composite faces used to misrepresent a provider's appearance",
  "Photos of other people used as if they are the provider",
  "Stolen, unauthorized, or commercial stock images presented as provider content",
  "Images containing illegal substances, unlawful activity, or content creating a material legal or safety risk",
];

export default function PhotoProfilePolicyPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Photo and Profile Content Policy", path: "/photo-profile-policy" }])} />
      <div className="page-shell py-10">
        <section className="rounded-3xl border border-border-subtle bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,246,250,0.96))] p-6 shadow-brand sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Content Standards</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Photo and Profile Content Policy</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-text-secondary">MasseurMatch is a directory and technology platform. This policy governs user-submitted profile content and is designed to maintain a professional, non-sexual directory environment. Providers remain solely responsible for their content, services, conduct, qualifications, and compliance with applicable law.</p>
          <p className="mt-3 text-xs text-text-muted">Last updated: August 10, 2026</p>
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="premium-surface rounded-3xl border border-border-subtle p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-3"><div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Camera className="h-5 w-5" strokeWidth={2.25} /></div><h2 className="font-display text-xl font-semibold tracking-tight text-foreground">What is allowed</h2></div>
            <ul className="space-y-3">{allowed.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-text-secondary"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-500" strokeWidth={2.25} />{item}</li>)}</ul>
          </section>
          <section className="premium-surface rounded-3xl border border-border-subtle p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-3"><div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-brand-secondary"><ImageOff className="h-5 w-5" strokeWidth={2.25} /></div><h2 className="font-display text-xl font-semibold tracking-tight text-foreground">What is prohibited</h2></div>
            <ul className="space-y-3">{prohibited.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-text-secondary"><XCircle className="mt-0.5 h-4 w-4 flex-none text-brand-secondary" strokeWidth={2.25} />{item}</li>)}</ul>
          </section>
        </div>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Context matters</h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-text-secondary">
            <p>A visible torso alone does not constitute prohibited sexual content. MasseurMatch may evaluate an image together with pose, genital emphasis, captions, profile text, advertised services, pricing language, communications reported to us, and other relevant context.</p>
            <p>Content may be removed whenever, viewed individually or as part of a profile, it reasonably creates the impression that commercial sexual activity, prostitution, erotic services, or sexual services are being advertised, solicited, promoted, or arranged.</p>
          </div>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Profile text and descriptions</h2>
          <ul className="mt-5 ml-5 list-disc space-y-2 text-sm leading-7 text-text-secondary">
            <li>Content must be accurate, truthful, current, and professional.</li>
            <li>Sexual, erotic, prostitution, trafficking, or commercial sexual activity language is prohibited.</li>
            <li>Coded language intended to imply prohibited services or evade moderation is prohibited.</li>
            <li>False credentials, fabricated certifications, deceptive claims, harassment, discrimination, spam, and search manipulation are prohibited.</li>
          </ul>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Copyright and image ownership</h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-text-secondary">
            <p>By uploading content, you represent and warrant that you own it or possess all rights and permissions necessary to authorize its use. You grant MasseurMatch a non-exclusive license to host, display, reproduce, resize, format, and distribute that content solely as reasonably necessary to operate, secure, promote, and improve the platform, subject to our Terms.</p>
            <p>Copyright complaints should be submitted under our <Link href="/dmca" className="text-brand-secondary underline hover:text-brand-primary">DMCA Policy</Link>.</p>
          </div>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Moderation and enforcement</h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-text-secondary">
            <p>MasseurMatch may use automated systems and human review to identify policy violations. We may approve, reject, restrict, remove, suspend, preserve, or escalate content or accounts when reasonably necessary for safety, legal compliance, platform integrity, or enforcement of our policies.</p>
            <p>Approval of a photo or profile is not an endorsement, certification, guarantee of legality, guarantee of professional qualifications, or guarantee of future conduct. Moderation decisions may be revisited when new information becomes available.</p>
            <p>Serious safety concerns, suspected exploitation, trafficking indicators, or content involving minors may be escalated and handled separately from ordinary profile review, including preservation or disclosure when required or permitted by applicable law.</p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-border-subtle bg-brand-primary px-6 py-7 text-white shadow-brand sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">Related Policies</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">{[
            { href: "/content-guidelines", label: "Content Guidelines" },
            { href: "/community-guidelines", label: "Community Guidelines" },
            { href: "/prohibited-conduct", label: "Prohibited Conduct" },
            { href: "/dmca", label: "DMCA Policy" },
            { href: "/moderation-policy", label: "Moderation Policy" },
          ].map((link) => <Link key={link.href} href={link.href} className="rounded-full border border-white/18 bg-white/8 px-4 py-2 text-white transition hover:border-white/32 hover:bg-white/12">{link.label}</Link>)}</div>
        </section>
      </div>
    </>
  );
}
