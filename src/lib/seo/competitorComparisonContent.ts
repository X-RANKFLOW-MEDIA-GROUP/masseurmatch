import { COMPETITORS } from "@/lib/seo/competitors";
import { type CompetitorRoute } from "@/lib/seo/competitorComparisonRoutes";

export type ComparisonFeatureRow = {
  label: string;
  masseurMatch: "Yes" | "No" | "Limited" | "Varies by provider" | "Not publicly confirmed" | "Depends on profile" | "Directory only" | "Direct contact";
  competitor: "Yes" | "No" | "Limited" | "Varies by provider" | "Not publicly confirmed" | "Depends on profile" | "Directory only" | "Direct contact";
};

export type ComparisonFaq = { question: string; answer: string };

export function buildComparisonFeatureRows(): ComparisonFeatureRow[] {
  return [
    { label: "Directory focus", masseurMatch: "Directory only", competitor: "Directory only" },
    { label: "Professional profile browsing", masseurMatch: "Yes", competitor: "Yes" },
    { label: "City based discovery", masseurMatch: "Yes", competitor: "Limited" },
    { label: "Modality based discovery", masseurMatch: "Yes", competitor: "Limited" },
    { label: "LGBT friendly discovery", masseurMatch: "Yes", competitor: "Varies by provider" },
    { label: "Male massage therapist discovery", masseurMatch: "Yes", competitor: "Varies by provider" },
    { label: "Direct contact options", masseurMatch: "Direct contact", competitor: "Depends on profile" },
    { label: "Client account required", masseurMatch: "No", competitor: "Not publicly confirmed" },
    { label: "In platform booking", masseurMatch: "No", competitor: "Not publicly confirmed" },
    { label: "In platform payments", masseurMatch: "No", competitor: "Not publicly confirmed" },
    { label: "Reviews", masseurMatch: "Limited", competitor: "Not publicly confirmed" },
    { label: "Therapist profile control", masseurMatch: "Yes", competitor: "Depends on profile" },
    { label: "Therapist visibility options", masseurMatch: "Yes", competitor: "Limited" },
    { label: "Best for clients", masseurMatch: "Yes", competitor: "Varies by provider" },
    { label: "Best for independent therapists", masseurMatch: "Yes", competitor: "Varies by provider" },
  ];
}

export function buildComparisonFaqs(competitorName: string): ComparisonFaq[] {
  return [
    {
      question: `Is MasseurMatch a booking marketplace like ${competitorName}?`,
      answer:
        "No. MasseurMatch is a directory-first platform. Visitors browse therapist profiles and contact providers directly outside the platform.",
    },
    {
      question: `Can I compare ${competitorName} and MasseurMatch by city and massage style?`,
      answer:
        "Yes. This page compares city-based discovery, massage style discovery, profile details, and direct contact pathways.",
    },
    {
      question: "Does MasseurMatch manage payments between clients and therapists?",
      answer: "No. MasseurMatch does not process in-platform payments between visitors and providers.",
    },
    {
      question: "Can therapists control their own profile details on MasseurMatch?",
      answer: "Yes. Therapists manage public profile details from their dashboard, including contact preferences and profile content.",
    },
  ];
}

export function buildComparisonH1(route: CompetitorRoute): string {
  const competitor = COMPETITORS.find((item) => item.slug === route.competitorSlug);
  if (!competitor) {
    return "Best Massage Directory Alternatives";
  }

  return route.type === "vs"
    ? `MasseurMatch vs ${competitor.name}: Which Massage Directory Is Right for You?`
    : `Best ${competitor.name} Alternative for Finding Independent Massage Therapists`;
}

export function buildRequiredSections(competitorName: string): string[] {
  return [
    "Neutral intro",
    "Quick answer",
    "Feature comparison table",
    `What ${competitorName} is known for`,
    "What MasseurMatch does differently",
    "Directory model comparison",
    "Search by city comparison",
    "Search by massage style comparison",
    "LGBT friendly discovery comparison",
    "Male massage therapist discovery comparison",
    "Direct contact options",
    "Therapist profile control",
    "Client experience",
    "Therapist visibility",
    `Who should use ${competitorName}`,
    "Who should use MasseurMatch",
    "Safer professional search language note",
    "FAQ",
    "CTA to browse MasseurMatch",
    "CTA for therapists to create a profile",
  ];
}
