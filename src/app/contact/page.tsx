import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildContactPageJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = createPageMetadata({
  title: "Contact MasseurMatch",
  description:
    "Contact the MasseurMatch team for support, trust and safety issues, profile questions, or partnership requests.",
  path: "/contact",
  keywords: ["contact masseurmatch", "support", "trust and safety", "directory help"],
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <JsonLd data={buildContactPageJsonLd()} />

      <div className="container mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Contact and support</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">Reach the team behind MasseurMatch.</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Use this page for support, trust and safety reports, profile issues, directory feedback, or partnership
          conversations. We route messages to the right inbox and keep this page crawlable so search engines can
          understand it as the site support hub.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/safety" className="text-primary hover:underline">
            Trust and safety
          </Link>
          <Link href="/blog" className="text-primary hover:underline">
            Blog
          </Link>
          <Link href="/chat" className="text-primary hover:underline">
            Knotty AI
          </Link>
        </div>

        <ContactPageClient />
      </div>
    </>
  );
}
