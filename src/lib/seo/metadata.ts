import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo/site";

export function buildMetadata(input: { title: string; description: string; path: string; noIndex?: boolean }): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: siteUrl(input.path) },
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { title: input.title, description: input.description, url: siteUrl(input.path), type: "website" },
  };
}

export const METADATA_FORMULAS = {
  homepage: {
    title: "MasseurMatch | Find Independent Massage Therapists Near You",
    description: "Find independent massage therapists by city, style, availability, and contact preference. Browse profiles and contact providers directly.",
  },
  city: (city: string) => ({
    title: `Massage Therapists in ${city} | MasseurMatch`,
    description: `Find independent massage therapists in ${city}. Browse professional profiles, compare massage styles, and contact providers directly by phone, text, WhatsApp, email, or website.`,
  }),
  gayCity: (city: string) => ({
    title: `Gay Massage Therapists in ${city} | MasseurMatch`,
    description: `Find gay friendly and LGBT friendly massage therapists in ${city}. Browse independent provider profiles and contact therapists directly.`,
  }),
};
