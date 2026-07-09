import type { Metadata } from "next";
import Link from "next/link";
import { Camera, FileText, ImageOff, ShieldAlert, Type, UserX } from "lucide-react";

import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, createPageMetadata } from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Content Guidelines",
  description:
    "Standards for all content published on MasseurMatch — profile text, photos, service descriptions, reviews, and communications.",
  path: "/content-guidelines",
  keywords: ["content guidelines", "content standards", "profile rules", "listing content policy"],
});

const pillars = [
  {
    icon: Type,
    title: "Professional language",
    body: "All profile text, service descriptions, bios, and communications must be professional, respectful, and free of sexual or erotic language, innuendo, or coded solicitation.",
  },
  {
    icon: Camera,
    title: "Accurate photos",
    body: "Photos must accurately represent the provider or their workspace. AI-generated faces, misleading angles, stolen images, or photos of other people are prohibited.",
  },
  {
    icon: FileText,
    title: "Truthful claims",
    body: "All credentials, certifications, experience, pricing, and availability information must be truthful and current. Do not fabricate or exaggerate qualifications.",
  },
  {
    icon: ShieldAlert,
    title: "No explicit content",
    body: "Explicit nudity, sexually suggestive photos, erotic content, or images that imply sexual services are prohibited in all formats — photos, text, or messaging.",
  },
  {
    icon: UserX,
    title: "No impersonation",
    body: "Do not create fake profiles, use another person's identity or photos, or misrepresent your business name, brand, or credentials.",
  },
  {
    icon: ImageOff,
    title: "No stolen media",
    body: "Only use images and content you own or have explicit permission to use. Uploading images that belong to other people or businesses violates platform policy and may violate copyright law.",
  },
];

const prohibitedContent = [
  'Sexual, erotic, or explicitly suggestive text or images',
  'References to "extras," "special services," "happy endings," or any coded solicitation language',
  "Explicit nudity or pornographic content",
  "AI-generated faces or composite images used to misrepresent a provider",
  "Stolen photos, watermarked images from other sources, or stock photos used as personal photos",
  "False professional credentials, fabricated licenses, or unverifiable certifications",
  "Content promoting illegal activity, discrimination, or hate",
  "Spam, duplicate descriptions, or keyword stuffing intended to manipulate search results",
  "Fake reviews, testimonials, or endorsements",
  "Content that targets, reveals, or endangers another person's private information",
];

export default function ContentGuidelinesPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Content Guidelines", path: "/content-guidelines" },
        ])}
      />

      <div className="page-shell py-10">
        <section className="rounded-3xl border border-border-subtle bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,246,250,0.96))] p-6 shadow-brand sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Platform Standards</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Content Guidelines
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-text-secondary">
            These guidelines apply to all content published on MasseurMatch — profile bios, service descriptions,
            photos, review text, and any other material submitted by providers or users. Content that violates
            these standards will be removed and may result in account action.
          </p>
          <p className="mt-3 text-xs text-text-muted">Last updated: June 29, 2026</p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((item) => (
            <article
              key={item.title}
              className="premium-surface rounded-3xl border border-border-subtle p-6 shadow-soft"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary">
                <item.icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <h2 className="mt-5 font-display text-xl font-semibold tracking-tight text-foreground">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Prohibited Content</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
            The following content is not permitted on MasseurMatch.
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {prohibitedContent.map((item) => (
              <div
                key={item}
                className="rounded-[1.3rem] border border-border-subtle bg-white/80 px-4 py-3 text-sm leading-6 text-text-secondary"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Photo Standards</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">
            Photo and image requirements
          </h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-text-secondary">
            <p>
              Profile photos must genuinely represent the provider. Workspace photos must accurately show the
              actual space where services are provided.
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Photos must be clear, well-lit, and professional in presentation.</li>
              <li>Faces may be obscured for privacy, but the photo must otherwise be genuine.</li>
              <li>AI-generated or digitally altered faces used to misrepresent identity are prohibited.</li>
              <li>Explicit nudity or sexually posed images are prohibited regardless of context.</li>
              <li>You must own or have explicit permission to use any images you upload.</li>
            </ul>
            <p>
              Read the full <Link href="/photo-profile-policy" className="text-brand-secondary underline hover:text-brand-primary">Photo and Profile Content Policy</Link> for detailed requirements.
            </p>
          </div>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Moderation</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">
            How we enforce content standards
          </h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-text-secondary">
            <p>
              MasseurMatch reviews content at submission and on an ongoing basis. Reported content is reviewed by
              our team. Enforcement actions may include:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Requesting revision or correction of non-compliant content.</li>
              <li>Removing specific photos, text sections, or profile elements.</li>
              <li>Temporarily suspending a profile pending review.</li>
              <li>Permanently removing an account for serious or repeated violations.</li>
            </ul>
            <p>
              Read the <Link href="/moderation-policy" className="text-brand-secondary underline hover:text-brand-primary">Moderation Policy</Link> for full enforcement details.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-border-subtle bg-brand-primary px-6 py-7 text-white shadow-brand sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">Related Policies</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white">
            Supporting standards and policies.
          </h2>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            {[
              { href: "/photo-profile-policy", label: "Photo & Profile Policy" },
              { href: "/community-guidelines", label: "Community Guidelines" },
              { href: "/prohibited-conduct", label: "Prohibited Conduct" },
              { href: "/moderation-policy", label: "Moderation Policy" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/18 bg-white/8 px-4 py-2 text-white transition hover:border-white/32 hover:bg-white/12"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
