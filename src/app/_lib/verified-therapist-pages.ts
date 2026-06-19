// Verified therapist landing pages per city
// High-intent pages that capture trust-related queries

export type VerifiedTherapistPageConfig = {
  citySlug: string;
  cityName: string;
  stateCode: string;
  stateName: string;
  verificationBenefits: string[];
  trustSignals: string[];
  faqs: Array<{ question: string; answer: string }>;
};

export const VERIFIED_THERAPIST_PAGES: Record<string, VerifiedTherapistPageConfig> = {
  "dallas-tx": {
    citySlug: "dallas-tx",
    cityName: "Dallas",
    stateCode: "TX",
    stateName: "Texas",
    verificationBenefits: [
      "Professional credentials verified",
      "Background checks completed",
      "Client reviews and ratings",
      "Response time tracking",
      "Service detail transparency",
      "Pricing clarity",
      "Direct contact pathways",
    ],
    trustSignals: [
      "Verified certification and licensing",
      "Years of experience in massage therapy",
      "Consistent client feedback",
      "Transparent incall/outcall offerings",
      "Clear pricing structure",
      "Professional communication",
      "Health and safety standards",
    ],
    faqs: [
      {
        question: "What does 'verified' mean on MasseurMatch?",
        answer:
          "Verified therapists have completed MasseurMatch's profile review process, including credential checks, service detail confirmation, and adherence to our professional standards. This means you can trust the information on their profile.",
      },
      {
        question: "How can I identify verified therapists in Dallas?",
        answer:
          "All therapists featured on MasseurMatch Dallas pages are verified. Look for trust signals including client ratings, years of experience, clear service descriptions, and transparent pricing.",
      },
      {
        question: "Are verified therapists background-checked?",
        answer:
          "MasseurMatch performs verification checks on therapist profiles to ensure accuracy and professionalism. Direct communication with therapists allows you to discuss any specific requirements or concerns.",
      },
      {
        question: "How do I know a Dallas therapist is trustworthy?",
        answer:
          "Compare trust signals: years of experience, client feedback, service transparency, clear pricing, professional communication, and direct contact availability. MasseurMatch only features therapists who meet our professional standards.",
      },
      {
        question: "Can I request additional verification details from a therapist?",
        answer:
          "Yes. When you contact a therapist directly, you can ask about certifications, experience, specialties, and any other details important to you. Professional therapists will respond transparently.",
      },
    ],
  },
  "miami-fl": {
    citySlug: "miami-fl",
    cityName: "Miami",
    stateCode: "FL",
    stateName: "Florida",
    verificationBenefits: [
      "Professional credentials verified",
      "Background checks completed",
      "Client reviews and ratings",
      "Response time tracking",
      "Service detail transparency",
      "Pricing clarity",
      "Direct contact pathways",
    ],
    trustSignals: [
      "Verified certification and licensing",
      "Years of experience in massage therapy",
      "Consistent client feedback",
      "Transparent incall/outcall offerings",
      "Clear pricing structure",
      "Professional communication",
      "Health and safety standards",
    ],
    faqs: [
      {
        question: "What does 'verified' mean on MasseurMatch?",
        answer:
          "Verified therapists have completed MasseurMatch's profile review process, including credential checks, service detail confirmation, and adherence to our professional standards. This means you can trust the information on their profile.",
      },
      {
        question: "How can I identify verified therapists in Miami?",
        answer:
          "All therapists featured on MasseurMatch Miami pages are verified. Look for trust signals including client ratings, years of experience, clear service descriptions, and transparent pricing.",
      },
      {
        question: "Are verified therapists background-checked?",
        answer:
          "MasseurMatch performs verification checks on therapist profiles to ensure accuracy and professionalism. Direct communication with therapists allows you to discuss any specific requirements or concerns.",
      },
      {
        question: "How do I know a Miami therapist is trustworthy?",
        answer:
          "Compare trust signals: years of experience, client feedback, service transparency, clear pricing, professional communication, and direct contact availability. MasseurMatch only features therapists who meet our professional standards.",
      },
      {
        question: "Can I request additional verification details from a therapist?",
        answer:
          "Yes. When you contact a therapist directly, you can ask about certifications, experience, specialties, and any other details important to you. Professional therapists will respond transparently.",
      },
    ],
  },
  "new-york-ny": {
    citySlug: "new-york-ny",
    cityName: "New York",
    stateCode: "NY",
    stateName: "New York",
    verificationBenefits: [
      "Professional credentials verified",
      "Background checks completed",
      "Client reviews and ratings",
      "Response time tracking",
      "Service detail transparency",
      "Pricing clarity",
      "Direct contact pathways",
    ],
    trustSignals: [
      "Verified certification and licensing",
      "Years of experience in massage therapy",
      "Consistent client feedback",
      "Transparent incall/outcall offerings",
      "Clear pricing structure",
      "Professional communication",
      "Health and safety standards",
    ],
    faqs: [
      {
        question: "What does 'verified' mean on MasseurMatch?",
        answer:
          "Verified therapists have completed MasseurMatch's profile review process, including credential checks, service detail confirmation, and adherence to our professional standards. This means you can trust the information on their profile.",
      },
      {
        question: "How can I identify verified therapists in New York?",
        answer:
          "All therapists featured on MasseurMatch New York pages are verified. Look for trust signals including client ratings, years of experience, clear service descriptions, and transparent pricing.",
      },
      {
        question: "Are verified therapists background-checked?",
        answer:
          "MasseurMatch performs verification checks on therapist profiles to ensure accuracy and professionalism. Direct communication with therapists allows you to discuss any specific requirements or concerns.",
      },
      {
        question: "How do I know a New York therapist is trustworthy?",
        answer:
          "Compare trust signals: years of experience, client feedback, service transparency, clear pricing, professional communication, and direct contact availability. MasseurMatch only features therapists who meet our professional standards.",
      },
      {
        question: "Can I request additional verification details from a therapist?",
        answer:
          "Yes. When you contact a therapist directly, you can ask about certifications, experience, specialties, and any other details important to you. Professional therapists will respond transparently.",
      },
    ],
  },
};

export function getVerifiedTherapistPageConfig(citySlug: string): VerifiedTherapistPageConfig | null {
  return VERIFIED_THERAPIST_PAGES[citySlug] || null;
}
