type LegalTopicLink = { href: string; label: string };

export type LegalTopic = {
  id: string;
  title: string;
  summary: string;
  highlights: string[];
  mergedNotes?: string[];
  links?: LegalTopicLink[];
};

export const LEGAL_LAST_UPDATED = "August 10, 2026";

export const LEGAL_QUICK_FACTS = [
  { label: "Governing law", value: "Delaware, USA" },
  { label: "Last reviewed", value: LEGAL_LAST_UPDATED },
  { label: "Coverage", value: "Terms, privacy, safety & billing" },
  { label: "Platform model", value: "Directory only" },
] as const;

export const LEGAL_QUICK_ANSWERS = [
  {
    question: "Does MasseurMatch book appointments or process client payments?",
    answer: "No. MasseurMatch is a directory and visibility platform. Providers and clients communicate, schedule, and arrange payment directly outside the platform.",
  },
  {
    question: "Does MasseurMatch verify professional licenses?",
    answer: "No. MasseurMatch does not independently verify therapist licenses. Any badge or verification indicator means only the specific checks described by the platform for that badge.",
  },
  {
    question: "Who is responsible for a provider's services?",
    answer: "Providers are independent businesses or individuals. They are responsible for their profile accuracy, legal compliance, credentials, rates, availability, and services.",
  },
  {
    question: "Where do legal, privacy, billing, and support requests go?",
    answer: "Legal, privacy, DMCA, and formal compliance matters go to legal@masseurmatch.com; billing matters go to billing@masseurmatch.com; general support and account questions go to support@masseurmatch.com.",
  },
] as const;

export const LEGAL_TOPICS: readonly LegalTopic[] = [
  {
    id: "terms",
    title: "Terms of Service and Platform Role",
    summary: "MasseurMatch is a directory, not an employer, agency, healthcare provider, booking service, or payment intermediary for massage sessions.",
    highlights: [
      "Users must be at least 18 years old and use the service lawfully.",
      "Clients contact independent providers directly and perform their own due diligence.",
      "MasseurMatch does not guarantee availability, results, earnings, credentials, or service quality.",
      "Accounts and listings may be restricted or removed for policy violations, fraud, or unlawful activity.",
    ],
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/platform-disclaimer", label: "Platform Disclaimer" },
    ],
  },
  {
    id: "providers",
    title: "Provider Terms, Subscriptions, and Visibility",
    summary: "Providers remain independent and are responsible for truthful listings, lawful business practices, subscriptions, and direct interactions with clients.",
    highlights: [
      "Paid tiers and featured placement affect visibility or features but do not guarantee leads, revenue, or ranking outcomes.",
      "Providers must keep profile, pricing, location, travel, and contact information accurate.",
      "Subscription, cancellation, renewal, and refund rules are governed by the applicable paid-plan terms.",
      "MasseurMatch does not create an employment, agency, partnership, or contractor relationship with providers.",
    ],
    links: [
      { href: "/therapist-agreement", label: "Provider Agreement" },
      { href: "/subscriptions", label: "Subscription Terms" },
      { href: "/refund-policy", label: "Refund Policy" },
    ],
  },
  {
    id: "privacy",
    title: "Privacy, Data Use, Cookies, and User Choices",
    summary: "The privacy package explains the categories of data collected, why they are used, service providers involved, retention, security practices, and available user choices.",
    highlights: [
      "Data may include account, profile, contact, location, subscription, support, cookie, analytics, verification, and AI-interaction information where those features are used.",
      "MasseurMatch uses service providers only for defined platform functions and should not make privacy promises that exceed actual product behavior.",
      "Users may request access, correction, or deletion where applicable and subject to legal or operational retention requirements.",
      "Cookie and analytics disclosures should match the technologies actually deployed on the site.",
    ],
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/cookie-policy", label: "Cookie Policy" },
      { href: "/data-deletion", label: "Data Deletion" },
    ],
  },
  {
    id: "content",
    title: "Content, Conduct, Trust, and Safety",
    summary: "Profiles and communications connected to MasseurMatch must remain lawful, professional, accurate, and consistent with the platform's content and safety policies.",
    highlights: [
      "Sexual solicitation, trafficking, coercion, exploitation, illegal services, harassment, scams, and deceptive conduct are prohibited.",
      "Photos and profile claims must accurately represent the provider and may not impersonate another person or mislead users.",
      "Reports can lead to review, content removal, suspension, or account termination depending on severity and evidence.",
      "MasseurMatch does not verify licenses and does not guarantee that a listed provider is suitable for a particular user.",
    ],
    links: [
      { href: "/community-guidelines", label: "Community Guidelines" },
      { href: "/acceptable-use", label: "Acceptable Use" },
      { href: "/prohibited-conduct", label: "Prohibited Conduct" },
    ],
  },
  {
    id: "verification",
    title: "Badges and Verification Disclosures",
    summary: "Verification indicators are limited signals. Each badge means only the checks expressly described by MasseurMatch and is not a professional-license, background, safety, or quality guarantee.",
    highlights: [
      "Identity verification may be handled by a third-party verification provider.",
      "A badge does not mean MasseurMatch endorses a provider or guarantees services.",
      "Users should confirm any credential, license, insurance, or qualification important to their decision directly with the provider or relevant authority.",
      "Verification status may be removed when information changes or platform requirements are no longer met.",
    ],
    links: [{ href: "/badge-disclaimer", label: "Badge Disclaimer" }],
  },
  {
    id: "communications",
    title: "Email, SMS, and AI Disclosures",
    summary: "Email, SMS, and AI-assisted features require clear disclosures, appropriate consent where required, practical opt-out mechanisms, and truthful descriptions of what the automation does.",
    highlights: [
      "Transactional and marketing communications should be distinguished and handled according to the applicable consent context.",
      "Marketing recipients must have a practical opt-out path; SMS programs should honor supported STOP/HELP flows when applicable.",
      "AI-generated or AI-assisted output should not be presented as a human professional judgment when it is not one.",
      "Users remain responsible for reviewing information before relying on it for decisions about independent providers.",
    ],
    links: [
      { href: "/sms-terms", label: "SMS Terms" },
      { href: "/email-opt-out", label: "Email Opt-Out" },
      { href: "/ai-disclosure", label: "AI Disclosure" },
    ],
  },
  {
    id: "ip",
    title: "Copyright, DMCA, and Intellectual Property",
    summary: "MasseurMatch provides a process for copyright notices, counter-notices, and other intellectual-property complaints and may remove content while reviewing a substantiated report.",
    highlights: [
      "Copyright notices should identify the protected work, disputed material, contact information, and the statements required for a valid notice.",
      "Counter-notice procedures are available where applicable.",
      "Repeated substantiated infringement may result in account action.",
      "Formal IP and DMCA requests should be sent to legal@masseurmatch.com.",
    ],
    links: [{ href: "/dmca", label: "DMCA Policy" }],
  },
  {
    id: "disputes",
    title: "Disputes and Formal Legal Process",
    summary: "The governing terms explain applicable law, dispute procedures, limitations, and where formal legal process must be sent.",
    highlights: [
      "Users should review the current Terms of Service for the controlling dispute language.",
      "Formal legal notices and law-enforcement requests must go to legal@masseurmatch.com.",
      "Nothing in the Legal Center replaces the complete terms governing a specific service or subscription.",
      "Policy summaries are provided for readability; the linked full policies control if a summary and a full policy differ.",
    ],
    links: [{ href: "/terms", label: "Terms of Service" }],
  },
];

export const LEGAL_SUPPLEMENTAL_NOTICES = [
  { title: "Directory-only model", body: "MasseurMatch helps people discover independent providers; it does not manage massage bookings, client-provider payments, calendars, or reviews." },
  { title: "No license verification", body: "MasseurMatch does not independently verify professional massage licenses. Users should verify credentials important to them directly." },
  { title: "Paid visibility", body: "Subscriptions and add-ons may affect placement or features but do not guarantee impressions, contacts, clients, revenue, or search-engine outcomes." },
  { title: "AI disclosure", body: "AI-assisted features may generate suggestions or summaries. They are not legal, medical, or professional advice and should be reviewed before use." },
  { title: "Anti-exploitation", body: "Trafficking, coercion, exploitation, illegal services, and sexual solicitation through the platform are prohibited." },
  { title: "Security", body: "Users should never send passwords or one-time verification codes to someone claiming to represent MasseurMatch." },
] as const;

export const LEGAL_CONTACT_MATRIX = [
  { matter: "Legal notices, privacy rights, DMCA, subpoenas, law enforcement, and formal compliance", email: "legal@masseurmatch.com", responseWindow: "Reviewed according to the applicable request type" },
  { matter: "Billing, subscription, cancellation, charge, and refund questions", email: "billing@masseurmatch.com", responseWindow: "Handled by the billing team" },
  { matter: "General support, accounts, content reports, accessibility, and product questions", email: "support@masseurmatch.com", responseWindow: "Handled by the support team" },
] as const;

export const LEGAL_CONTACT_SUBJECTS = [
  "Legal or compliance inquiry",
  "Privacy or data request",
  "DMCA or copyright notice",
  "Billing, cancellation, or refund",
  "Content report or safety concern",
  "Accessibility issue",
  "General support",
] as const;
