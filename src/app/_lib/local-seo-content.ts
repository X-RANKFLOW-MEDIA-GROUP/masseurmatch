export type LocalSeoFaq = {
  question: string;
  answer: string;
};

export type LocalSeoCityContent = {
  title: string;
  description: string;
  intro: string;
  relatedCitySlugs: string[];
  faqs: LocalSeoFaq[];
};

const CITY_CONTENT: Record<string, LocalSeoCityContent> = {
  dallas: {
    title: "Dallas Male Massage Therapists | MasseurMatch",
    description:
      "Find male massage therapists in Dallas, TX. Compare public profiles, deep tissue and sports massage specialties, incall and outcall options, rates, availability, trust signals, and direct contact details.",
    intro:
      "Find male massage therapists in Dallas, TX through a directory built for clear comparison and direct contact. Browse public profiles for deep tissue, sports recovery, Swedish massage, incall, outcall, mobile, and LGBTQ-friendly options across Dallas, including Oak Lawn, Uptown, Downtown, Turtle Creek, the Medical District, Love Field, and the DFW Airport area when useful provider coverage is available.",
    relatedCitySlugs: ["fort-worth", "plano", "irving", "frisco", "arlington", "richardson"],
    faqs: [
      {
        question: "How do I find a male massage therapist in Dallas?",
        answer:
          "Browse Dallas profiles, compare specialties, rates, availability, incall or outcall options, service areas, and visible trust signals, then contact the provider directly to confirm session details.",
      },
      {
        question: "Can I find gay-friendly massage therapists in Dallas?",
        answer:
          "Yes. MasseurMatch includes public provider profiles that may identify LGBTQ-friendly service. Review each profile, service description, boundaries, and trust signals before contacting the provider directly.",
      },
      {
        question: "Can I find incall, outcall, or mobile massage in Dallas?",
        answer:
          "Yes, when providers list those session formats. Confirm the location, travel area, travel fee, rate, timing, setup, and boundaries directly with the provider before scheduling.",
      },
      {
        question: "Which Dallas neighborhoods can I browse?",
        answer:
          "MasseurMatch may provide local discovery pages for Oak Lawn, Uptown, Downtown, Turtle Creek, the Medical District, Love Field, and the DFW Airport area when each page has useful provider coverage and distinct local value.",
      },
      {
        question: "What should I compare before contacting a Dallas massage provider?",
        answer:
          "Compare specialties, session format, rate, availability, service area, profile completeness, photos, visible trust signals, and direct-contact information. Confirm all appointment details directly with the independent provider.",
      },
      {
        question: "Does MasseurMatch book Dallas massage sessions?",
        answer:
          "No. MasseurMatch is a discovery directory. Clients contact independent providers directly to discuss availability, rates, location, boundaries, and scheduling.",
      },
    ],
  },
  chicago: {
    title: "Male Massage Therapists in Chicago, IL",
    description:
      "Find male massage therapists in Chicago, IL. Compare specialties, incall and outcall options, availability, rates, trust signals, and direct contact details.",
    intro:
      "Browse male massage therapists serving Chicago and compare deep tissue, sports recovery, Swedish, incall, outcall, and mobile options. Profiles help you evaluate specialties, availability, pricing, and direct contact information in one place.",
    relatedCitySlugs: ["evanston", "oak-park", "skokie", "naperville"],
    faqs: [
      {
        question: "How do I compare male massage therapists in Chicago?",
        answer:
          "Review each provider's specialties, session formats, availability, rates, service area, photos, and trust signals before contacting the provider directly.",
      },
      {
        question: "Are outcall massage options available in Chicago?",
        answer:
          "Some providers offer outcall or mobile sessions. Check the profile for service format and travel area, then confirm the exact location and rate directly.",
      },
      {
        question: "Can I search for massage by neighborhood in Chicago?",
        answer:
          "Neighborhood discovery pages are added only when they provide useful local inventory and distinct information. Otherwise, the main Chicago directory remains the canonical page.",
      },
      {
        question: "Is MasseurMatch a booking platform in Chicago?",
        answer:
          "No. MasseurMatch helps people discover independent providers. Booking, payment, boundaries, and appointment details are handled directly between the client and provider.",
      },
    ],
  },
  indianapolis: {
    title: "Male Massage Therapists in Indianapolis, IN",
    description:
      "Find male massage therapists in Indianapolis, IN. Compare specialties, availability, incall and outcall options, rates, trust signals, and direct contact details.",
    intro:
      "Discover male massage therapists serving Indianapolis. Compare available specialties, session formats, pricing, service areas, and direct contact options through public provider profiles.",
    relatedCitySlugs: ["carmel", "fishers", "greenwood"],
    faqs: [
      {
        question: "How do I find a male massage therapist in Indianapolis?",
        answer:
          "Use the Indianapolis directory to compare public provider profiles, specialties, availability, rates, and incall or outcall options before making direct contact.",
      },
      {
        question: "Can providers travel to clients in Indianapolis?",
        answer:
          "Providers who offer outcall or mobile service may travel within a stated service area. Confirm the address, travel fee, setup, timing, and rate directly.",
      },
      {
        question: "When is the Indianapolis page indexed?",
        answer:
          "MasseurMatch keeps empty or insufficient local pages out of the sitemap. A city page becomes indexable when it is supported by real approved public inventory.",
      },
      {
        question: "Does MasseurMatch verify professional licenses?",
        answer:
          "MasseurMatch is a directory and does not represent that every provider holds a professional license. Review the profile and ask the provider directly about credentials relevant to your needs.",
      },
    ],
  },
};

export function getLocalSeoCityContent(citySlug: string): LocalSeoCityContent | null {
  return CITY_CONTENT[citySlug] ?? null;
}
