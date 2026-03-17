import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";

type Plan = {
  name: "Free" | "Pro" | "Featured";
  price: string;
  points: string[];
};

const plans: Plan[] = [
  { name: "Free", price: "$0", points: ["Basic profile", "Local indexing", "Direct contact"] },
  { name: "Pro", price: "$29/mo", points: ["Priority placement", "More galleries", "Expanded SEO"] },
  { name: "Featured", price: "$79/mo", points: ["Premium placement", "Top city slots", "Growth support"] },
];

export const metadata: Metadata = createPageMetadata({
  title: "Advertise on MasseurMatch",
  description:
    "Compare listing plans for massage therapists and grow visibility through city pages, profile pages, and directory search.",
  path: "/advertise",
  keywords: ["advertise massage therapist", "directory plans", "therapist seo", "listing packages"],
});

export default function AdvertisePage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Advertise", path: "/advertise" },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "Advertise on MasseurMatch",
          description:
            "Compare therapist listing packages designed for search visibility, profile quality, and direct contact.",
          path: "/advertise",
        })}
      />

      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Advertise on MasseurMatch</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
          Choose a listing plan built for therapist visibility across city pages, directory listings, therapist
          profiles, and specialty discovery paths.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-3xl border border-border p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
              <p className="mt-2 text-3xl font-bold text-foreground">{plan.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-6">
          <Link href="/register" className="text-sm font-medium text-primary hover:underline">
            Create an account and advertise
          </Link>
        </div>
      </div>
    </>
  );
}
