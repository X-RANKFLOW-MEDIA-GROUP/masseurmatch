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
        question: "What does m4m massage mean in Dallas listings?",
        answer:
          "M4m is shorthand for male-for-male massage — a session offered by a male therapist for male clients. In Dallas, browse male massage profiles, review each provider's specialties, session formats, and boundaries, then confirm details directly before scheduling.",
      },
      {
        question: "Does MasseurMatch book Dallas massage sessions?",
        answer:
          "No. MasseurMatch is a discovery directory. Clients contact independent providers directly to discuss availability, rates, location, boundaries, and scheduling.",
      },
    ],
  },
  houston: {
    title: "Houston Male Massage Therapists | MasseurMatch",
    description:
      "Find male massage therapists in Houston, TX. Compare public profiles, Swedish and deep tissue specialties, incall and outcall availability, rates, trust signals, and direct contact details.",
    intro:
      "Browse male massage therapists serving Houston, TX with clear profile comparison and direct provider contact. Public profiles cover Swedish, deep tissue, sports recovery, incall, outcall, mobile, and LGBTQ-friendly options across Houston, with local discovery for Montrose, The Heights, Midtown, and Downtown when useful provider coverage exists.",
    relatedCitySlugs: ["austin", "dallas", "san-antonio", "fort-worth"],
    faqs: [
      {
        question: "How do I find a male massage therapist in Houston?",
        answer:
          "Start from the Houston directory, compare specialties, session formats, rates, availability, and visible trust signals across public profiles, then contact the provider directly to confirm session details.",
      },
      {
        question: "Are gay-friendly massage therapists available in Houston?",
        answer:
          "Public Houston profiles may identify LGBTQ-friendly service, and Montrose is a common service area for inclusive providers. Review each profile's description, boundaries, and trust signals before making direct contact.",
      },
      {
        question: "Can Houston providers travel to my home or hotel?",
        answer:
          "Providers who list outcall or mobile sessions can travel within their stated service area, which often includes Downtown and Galleria-area hotels. Confirm the exact location, travel fee, rate, and timing directly with the provider.",
      },
      {
        question: "Which Houston neighborhoods have local pages?",
        answer:
          "Neighborhood pages such as Montrose, The Heights, Midtown, and Downtown are published only when they have useful provider coverage. Otherwise the main Houston page remains the canonical local destination.",
      },
      {
        question: "Does MasseurMatch handle Houston bookings or payments?",
        answer:
          "No. MasseurMatch is a discovery directory. Clients contact independent Houston providers directly to confirm availability, pricing, boundaries, and scheduling.",
      },
    ],
  },
  austin: {
    title: "Austin Male Massage Therapists | MasseurMatch",
    description:
      "Find male massage therapists in Austin, TX. Compare public profiles, deep tissue and recovery specialties, incall and outcall options, rates, trust signals, and direct contact details.",
    intro:
      "Compare male massage therapists serving Austin, TX through public profiles built for direct contact. Listings cover deep tissue, sports recovery, Swedish, incall, outcall, and mobile sessions, with local discovery for South Congress and East Austin when enough provider coverage is available.",
    relatedCitySlugs: ["san-antonio", "houston", "dallas", "round-rock"],
    faqs: [
      {
        question: "How do I choose a male massage therapist in Austin?",
        answer:
          "Compare Austin profiles by specialty, session format, rate, availability, service area, and visible trust signals, then reach out to the provider directly to confirm the details that matter to you.",
      },
      {
        question: "Can I find recovery or deep tissue massage in Austin?",
        answer:
          "Yes, when providers list those specialties. Austin profiles often highlight deep tissue and sports recovery work — check each profile's techniques and experience, then confirm your goals directly with the provider.",
      },
      {
        question: "Do Austin providers offer outcall or mobile sessions?",
        answer:
          "Providers who list outcall or mobile service travel within a stated area, which can include downtown hotels and surrounding neighborhoods. Confirm location, travel fee, setup, and timing directly before scheduling.",
      },
      {
        question: "Which Austin areas have dedicated pages?",
        answer:
          "Local pages such as South Congress and East Austin are added only when they have useful provider coverage and distinct local value. Until then, the main Austin directory is the canonical page.",
      },
      {
        question: "Is MasseurMatch a booking platform in Austin?",
        answer:
          "No. MasseurMatch helps people discover independent providers. Booking, payment, and appointment details are handled directly between the client and the provider.",
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
