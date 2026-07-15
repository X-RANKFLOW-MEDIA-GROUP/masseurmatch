import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Benefits } from "@/components/city-landing/Benefits";
import { CityHero } from "@/components/city-landing/CityHero";
import { FAQ, FAQ_ITEMS } from "@/components/city-landing/FAQ";
import { FinalCTA } from "@/components/city-landing/FinalCTA";
import { HowItWorks } from "@/components/city-landing/HowItWorks";
import { LocalHighlight } from "@/components/city-landing/LocalHighlight";
import { TrustSection } from "@/components/city-landing/TrustSection";
import type { City } from "@/data/provider-cities";
import { getCity, getCitySlugs } from "@/lib/get-city";
import { SITE_URL } from "@/lib/site";

type Params = { citySlug: string };

/** Base site URL used for canonical + Open Graph absolute URLs. */
const baseUrl = SITE_URL;
/** Where the "Create Your Profile" flow lives. */
const signupUrl = "/signup";

/** Build the tracked signup CTA for a given city. */
function buildProfileHref(city: City): string {
  return `${signupUrl}?city=${city.slug}&utm_source=landing_page&utm_medium=organic&utm_campaign=city_directory`;
}

/** Pre-render every registered city at build time. */
export function generateStaticParams(): Params[] {
  return getCitySlugs().map((citySlug) => ({ citySlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { citySlug } = await params;
  const city = getCity(citySlug);

  if (!city) {
    return {
      title: "City Not Found | MasseurMatch",
      robots: { index: false, follow: false },
    };
  }

  const title = `Massage Professionals in ${city.name}, ${city.stateCode} | MasseurMatch`;
  const description = `Create your professional MasseurMatch profile and join the massage provider directory for ${city.name}, ${city.stateCode}. Start a 14-day free trial with no credit card required.`;
  const path = `/providers/${city.slug}`;
  const canonical = `${baseUrl}${path}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "MasseurMatch",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProviderCityLandingPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { citySlug } = await params;
  const city = getCity(citySlug);

  if (!city) {
    notFound();
  }

  const path = `/providers/${city.slug}`;
  const canonical = `${baseUrl}${path}`;
  const profileHref = buildProfileHref(city);

  // JSON-LD: WebPage (not LocalBusiness — MasseurMatch is a directory platform,
  // not a physical massage business).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Massage Professionals in ${city.name}, ${city.stateCode} | MasseurMatch`,
    description: `Create your professional MasseurMatch profile and join the massage provider directory for ${city.name}, ${city.stateCode}. Start a 14-day free trial with no credit card required.`,
    url: canonical,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: "MasseurMatch",
      url: baseUrl,
    },
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
        <SiteHeader profileHref={profileHref} />

        <main id="main" className="flex-1">
          <CityHero city={city} profileHref={profileHref} />
          <Benefits />
          <HowItWorks />
          <LocalHighlight city={city} />
          <TrustSection />
          <FAQ />
          <FinalCTA city={city} profileHref={profileHref} />
        </main>

        <SiteFooter />
      </div>
    </>
  );
}

/** Landing-page header: wordmark, login, and primary CTA. */
function SiteHeader({ profileHref }: { profileHref: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="page-shell flex h-16 items-center justify-between">
        <Link
          href="/"
          className="rounded-md text-lg font-bold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
        >
          Masseur<span className="text-accent">Match</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Primary">
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
          >
            Log in
          </Link>
          <Link
            href={profileHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6E1521] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
          >
            Create Your Profile
            <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Provider Guidelines", href: "/community-guidelines" },
  { label: "Content Policy", href: "/content-guidelines" },
  { label: "Contact", href: "/contact" },
  { label: "Login", href: "/login" },
];

/** Landing-page footer: legal links + directory-only disclaimer. */
function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[#F7F7F7]">
      <div className="page-shell py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-lg font-bold tracking-tight text-foreground">
              Masseur<span className="text-accent">Match</span>
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              MasseurMatch is a directory platform only. We do not provide
              massage services directly, and we do not employ or represent the
              independent providers listed in the directory.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-3">
              {FOOTER_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="rounded-md text-sm text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MasseurMatch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
