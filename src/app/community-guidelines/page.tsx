import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Ban, HeartHandshake, Scale, UserCheck } from "lucide-react";

import { IconShield } from "@/components/icons";
import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, createPageMetadata } from "@/app/_lib/seo";

type GuidelineCard = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const coreGuidelines: GuidelineCard[] = [
  {
    icon: HeartHandshake,
    title: "Inclusion is non-negotiable",
    body: "We proudly support LGBTQ+ providers and clients. Discrimination, hate speech, harassment, or degrading behavior is grounds for immediate removal.",
  },
  {
    icon: UserCheck,
    title: "Respect professional boundaries",
    body: "Providers and clients are expected to communicate clearly, act professionally, and respect each other's stated boundaries, pricing, and session expectations.",
  },
  {
    icon: Scale,
    title: "Use the platform legally",
    body: "By using MasseurMatch, you confirm you are at least 18 years old and that your activity complies with all applicable local laws and standards.",
  },
];

const prohibitedConduct = [
  "Using the platform for illegal purposes or commercial sexual activities",
  "Impersonating another person, business, or identity",
  "Posting false, misleading, or stolen content",
  "Sending offensive, abusive, or harassing messages",
  "Using discriminatory language or threatening behavior",
  "Uploading content that creates safety or legal risk for the platform or its users",
];

export const metadata: Metadata = createPageMetadata({
  title: "Community Guidelines",
  description:
    "Read the community guidelines for providers and clients using MasseurMatch, including inclusion standards, prohibited conduct, and enforcement policies.",
  path: "/community-guidelines",
  keywords: ["community guidelines", "platform rules", "prohibited conduct", "inclusion policy"],
});

const communityGuidelinesJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Community Guidelines",
  url: "https://www.masseurmatch.com/community-guidelines",
  description:
    "Community standards for providers and clients using MasseurMatch, including inclusion requirements and prohibited conduct.",
};

export default function CommunityGuidelinesPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Community Guidelines", path: "/community-guidelines" },
        ])}
      />
      <JsonLd data={communityGuidelinesJsonLd} />

      <div className="page-shell py-10">
        <section className="rounded-3xl border border-border-subtle bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,246,250,0.96))] p-6 shadow-brand sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Community Guidelines</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Clear standards for a safer, more respectful directory.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-text-secondary">
            These guidelines apply to providers and clients using MasseurMatch. They exist to protect direct,
            transparent wellness connections and to keep the platform inclusive, lawful, and respectful.
          </p>
          <div className="mt-6 inline-flex items-start gap-3 rounded-3xl border border-brand-soft/40 bg-brand-soft/10 px-4 py-3 text-sm leading-6 text-text-secondary">
            <IconShield size={20} className="mt-0.5 flex-none text-brand-primary" />
            <span>Violations may result in content removal, account deletion, or escalation when legal or safety risks are involved.</span>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {coreGuidelines.map((item) => (
            <article
              key={item.title}
              className="premium-surface rounded-3xl border border-border-subtle p-6 shadow-soft"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-brand-soft/12 text-brand-primary">
              <Ban className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Prohibited Conduct</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                The following activity is not allowed on MasseurMatch.
              </h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {prohibitedConduct.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.3rem] border border-border-subtle bg-white/80 px-4 py-3 text-sm leading-7 text-text-secondary"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-border-subtle bg-brand-primary px-6 py-7 text-white shadow-brand sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">Related Policies</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
            Read the supporting legal and platform policies.
          </h2>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/terms" className="rounded-full border border-white/18 bg-white/8 px-4 py-2 text-white transition hover:border-white/32 hover:bg-white/12">
              Terms of Service
            </Link>
            <Link href="/privacy" className="rounded-full border border-white/18 bg-white/8 px-4 py-2 text-white transition hover:border-white/32 hover:bg-white/12">
              Privacy Policy
            </Link>
            <Link href="/platform-disclaimer" className="rounded-full border border-white/18 bg-white/8 px-4 py-2 text-white transition hover:border-white/32 hover:bg-white/12">
              Platform Disclaimer
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
