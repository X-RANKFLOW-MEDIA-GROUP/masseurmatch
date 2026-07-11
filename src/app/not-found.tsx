import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";

export const metadata: Metadata = {
  title: "Page not found | MasseurMatch",
  description: "The page you are looking for could not be found. Browse our therapist directory or return to the home page.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function NotFoundPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Page not found",
          description: "The page you are looking for could not be found.",
          isPartOf: {
            "@type": "WebSite",
            name: "MasseurMatch",
            url: "https://masseurmatch.com",
          },
        }}
      />
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-sm font-bold uppercase tracking-widest text-accent">404 Error</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Page not found
        </h1>
        <p className="mt-6 text-lg leading-7 text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. Try browsing our therapist directory or returning to the home page.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Go back home
          </Link>
          <Link href="/therapists" className="text-sm font-semibold text-foreground hover:text-accent">
            Browse therapists <span aria-hidden="true">→</span>
          </Link>
          <Link href="/explore" className="text-sm font-semibold text-foreground hover:text-accent">
            Explore by location <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </>
  );
}
