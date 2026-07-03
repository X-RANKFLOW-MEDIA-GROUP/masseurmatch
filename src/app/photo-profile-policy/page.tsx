import type { Metadata } from "next";
import Link from "next/link";
import { Camera, CheckCircle2, ImageOff, XCircle } from "lucide-react";

import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, createPageMetadata } from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Photo and Profile Content Policy",
  description:
    "Requirements and restrictions for profile photos, workspace images, and profile content on MasseurMatch.",
  path: "/photo-profile-policy",
  keywords: ["photo policy", "profile photo rules", "image guidelines", "profile content policy"],
});

const allowed = [
  "Clear, professional photos of the provider that accurately represent their appearance",
  "Workspace or studio photos that show the actual location where services are offered",
  "Professional headshots with or without face (face may be obscured for privacy)",
  "Images with appropriate professional attire",
  "Before/after wellness photos relevant to the services offered (non-sexual, non-medical)",
  "Certification or credential documents (optional, self-declared)",
];

const prohibited = [
  "Explicit nudity of any kind, including full or partial nudity that is sexually explicit",
  "Sexually posed, suggestive, or erotic images",
  "AI-generated or composite faces used to misrepresent a provider's appearance",
  "Photos of other people used as if they are the provider",
  "Stolen images from other websites, stock photo services, or other providers' profiles",
  "Watermarked images from commercial stock photo libraries",
  "Images that contain solicitation language, pricing, or prohibited content overlaid as text",
  "Photos of minors",
  "Images that include weapons, illegal substances, or content that creates legal or safety risk",
];

export default function PhotoProfilePolicyPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Photo and Profile Content Policy", path: "/photo-profile-policy" },
        ])}
      />

      <main className="page-shell py-10">
        <section className="rounded-3xl border border-border-subtle bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,246,250,0.96))] p-6 shadow-brand sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Content Standards</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Photo and Profile Content Policy
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-text-secondary">
            This policy sets the requirements and restrictions for all photos, images, and profile content
            submitted by providers on MasseurMatch. Profiles that do not meet these standards will be reviewed and
            may be edited, suspended, or removed.
          </p>
          <p className="mt-3 text-xs text-text-muted">Last updated: June 29, 2026</p>
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="premium-surface rounded-3xl border border-border-subtle p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Camera className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">What is allowed</h2>
            </div>
            <ul className="space-y-3">
              {allowed.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-text-secondary">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-500" strokeWidth={2.25} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="premium-surface rounded-3xl border border-border-subtle p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-brand-secondary">
                <ImageOff className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">What is prohibited</h2>
            </div>
            <ul className="space-y-3">
              {prohibited.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-text-secondary">
                  <XCircle className="mt-0.5 h-4 w-4 flex-none text-brand-secondary" strokeWidth={2.25} />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Profile text and descriptions</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-text-secondary">
            <p>
              All profile text — including bios, service descriptions, specialties, and any other written content
              — must meet the following standards:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Written in English and professional in tone.</li>
              <li>Accurate, truthful, and current at the time of publication.</li>
              <li>Free of sexual, erotic, or solicitation language of any kind.</li>
              <li>Free of coded language that implies illegal or prohibited services.</li>
              <li>Free of false credentials, fabricated certifications, or unverifiable claims.</li>
              <li>Free of discriminatory or offensive language.</li>
              <li>Not used for keyword stuffing or search manipulation.</li>
            </ul>
          </div>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Copyright and image ownership</h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-text-secondary">
            <p>
              By uploading any image to MasseurMatch, you represent and warrant that you own the image or have
              explicit permission from the copyright holder to use it on the platform. You grant MasseurMatch a
              non-exclusive license to host, display, and format your images for platform operation.
            </p>
            <p>
              If you believe your copyrighted image has been uploaded without your permission, submit a takedown
              request under our <Link href="/dmca" className="text-brand-secondary underline hover:text-brand-primary">DMCA Policy</Link>.
            </p>
          </div>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Moderation and removal</h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-text-secondary">
            <p>
              MasseurMatch reviews profile content at submission and on an ongoing basis. Photos or content that
              do not comply with this policy may be removed immediately without prior notice. Providers will be
              given an opportunity to resubmit compliant content in most cases, except for serious violations
              such as explicit content or illegal material.
            </p>
            <p>
              Repeated violations may result in account suspension or permanent removal. See the{" "}
              <Link href="/moderation-policy" className="text-brand-secondary underline hover:text-brand-primary">Moderation Policy</Link> for full enforcement details.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-border-subtle bg-brand-primary px-6 py-7 text-white shadow-brand sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">Related Policies</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            {[
              { href: "/content-guidelines", label: "Content Guidelines" },
              { href: "/community-guidelines", label: "Community Guidelines" },
              { href: "/dmca", label: "DMCA Policy" },
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
      </main>
    </>
  );
}
