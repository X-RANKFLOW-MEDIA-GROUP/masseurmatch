export type LegalTopicLink = {
  href: string;
  label: string;
};

export type LegalTopic = {
  id: string;
  title: string;
  summary: string;
  highlights: string[];
  mergedNotes?: string[];
  links?: LegalTopicLink[];
};

export const LEGAL_LAST_UPDATED = "March 10, 2026";

export const LEGAL_QUICK_FACTS = [
  {
    label: "Primary law",
    value: "Delaware, USA",
  },
  {
    label: "Core package",
    value: "March 2026 legal package",
  },
  {
    label: "Merged extras",
    value: "Legal Hub topics added",
  },
  {
    label: "Platform model",
    value: "Directory only, not bookings",
  },
] as const;

export const LEGAL_QUICK_ANSWERS = [
  {
    question: "Does MasseurMatch handle bookings or payments between users?",
    answer:
      "No. The platform is a directory and visibility tool. Direct scheduling, payments, and service arrangements happen outside the platform between the parties involved.",
  },
  {
    question: "Does MasseurMatch verify every provider license or background?",
    answer:
      "No. The legal package states that credentials and profile content should not be treated as independently verified unless a listing is expressly marked and explained as verified.",
  },
  {
    question: "What happens with illegal, sexual, or exploitative content?",
    answer:
      "The policies apply zero tolerance to sexual solicitation, trafficking, exploitation, illegal conduct, misleading credentials, and unsafe content. Listings can be removed immediately and matters may be escalated.",
  },
  {
    question: "Where should privacy, billing, DMCA, or legal requests go?",
    answer:
      "The page routes visitors to the correct mailbox based on the subject they choose, and the contact matrix below lists the correct team and expected response window.",
  },
] as const;

export const LEGAL_TOPICS: readonly LegalTopic[] = [
  {
    id: "terms",
    title: "Terms of Use and Platform Boundaries",
    summary:
      "The 2026 legal package makes clear that MasseurMatch is a directory, not an employer, agency, booking tool, or payment intermediary. Users must be 18+ and use the platform lawfully.",
    highlights: [
      "The platform does not book appointments, process client-to-provider payments, or guarantee outcomes.",
      "Users are responsible for their own due diligence before contacting a listed provider.",
      "Accounts may be suspended or terminated for false information, underage use, or prohibited conduct.",
      "The terms include broad warranty disclaimers, liability limits, and user indemnification obligations.",
    ],
    mergedNotes: [
      "The imported Legal Hub wording reinforces the same boundary: advertising exposure only, no service transaction management.",
      "The merged copy keeps the stronger March 2026 framework while preserving the Legal Hub's emphasis on zero tolerance for illegal services.",
    ],
    links: [
      { href: "/terms", label: "Read full Terms" },
      { href: "/platform-disclaimer", label: "Platform Disclaimer" },
    ],
  },
  {
    id: "providers",
    title: "Therapist Listings, Advertiser Rules, and Billing",
    summary:
      "Therapists remain independent providers. They are responsible for their licenses, content accuracy, local-law compliance, and subscription billing obligations.",
    highlights: [
      "Listing content must stay truthful, current, professional, and legally compliant.",
      "Subscriptions renew automatically unless canceled before renewal; Stripe handles payment processing.",
      "Refunds are limited and typically tied to billing errors, legal requirements, or platform-side failures.",
      "Chargebacks, false claims, or policy violations can lead to suspension or termination without refund.",
    ],
    mergedNotes: [
      "This section merges the March 2026 therapist agreement with Legal Hub additions around advertiser policy, refund eligibility, and right-to-remove language.",
      "The merged version also keeps the Legal Hub note that advertising performance, leads, and earnings are never guaranteed.",
    ],
    links: [
      { href: "/therapist-agreement", label: "Therapist Agreement" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    id: "privacy",
    title: "Privacy, Notice at Collection, and Cookies",
    summary:
      "The privacy package explains what data is collected, why it is used, how it is shared, and what rights users have under laws such as the TDPSA and CCPA/CPRA.",
    highlights: [
      "Collected data may include account details, therapist profile data, support messages, subscription status, and limited technical usage data.",
      "MasseurMatch states that it does not sell personal data and uses processors such as Stripe, Supabase, Vercel, and email vendors for specific platform needs.",
      "Short-form notices must appear at or before collection points such as account signup, checkout, and support forms.",
      "Cookie usage is split between strictly necessary cookies and consent-based categories like analytics and functional preferences.",
    ],
    mergedNotes: [
      "The imported Legal Hub copy adds explicit reminders that health or medical data should not be treated as part of the normal platform flow and that protected health information is not part of the intended data model.",
      "The merged page keeps the more complete March 2026 rights language while preserving the Legal Hub's emphasis on verification data being handled by Stripe Identity where applicable.",
    ],
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/cookie-policy", label: "Cookie Policy" },
    ],
  },
  {
    id: "content",
    title: "Content Standards, Safety, and Community Enforcement",
    summary:
      "Content must remain professional, accurate, and lawful. The safety framework covers acceptable use, photo rules, anti-trafficking, complaints, phishing warnings, and non-discrimination.",
    highlights: [
      "Sexual solicitation, nudity, minors, trafficking, illegal activity, hate speech, and deceptive or unsafe content are prohibited.",
      "Photos must reflect the real provider or workspace and cannot use stolen images, misleading AI faces, or sexually suggestive imagery.",
      "Reports may lead to content removal, warnings, suspension, permanent bans, or referrals to law enforcement.",
      "The legal package commits to an inclusive environment and prohibits discriminatory conduct.",
    ],
    mergedNotes: [
      "This section folds in the Legal Hub topics for content guidelines, photo rules, anti-trafficking, complaints and compliance, phishing and scam notice, and non-discrimination.",
      "The merged guidance also preserves the Legal Hub's simple warning that the platform never asks for passwords or one-time codes by email or SMS.",
    ],
    links: [
      { href: "/community-guidelines", label: "Community Guidelines" },
      { href: "/platform-disclaimer", label: "Platform Disclaimer" },
    ],
  },
  {
    id: "ip",
    title: "DMCA, Trademarks, and Repeat Infringer Rules",
    summary:
      "MasseurMatch publishes a formal DMCA process, designates a DMCA contact channel, and reserves the right to act quickly on substantiated intellectual property complaints.",
    highlights: [
      "DMCA notices must include specific information such as the copyrighted work, the allegedly infringing URL, and a signed good-faith statement.",
      "The package distinguishes DMCA requests from general legal requests so each can be handled through the proper channel.",
      "Trademark and copyright complaints may lead to removal or other enforcement measures.",
      "Repeat intellectual property violations can lead to account termination.",
    ],
    mergedNotes: [
      "The imported Legal Hub material strengthens this section by adding an explicit repeat-infringer policy based on multiple substantiated violations inside a rolling twelve-month window.",
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility, Marketing Consent, and SMS Rules",
    summary:
      "The legal package pairs accessibility commitments with the consent language required for email and SMS programs.",
    highlights: [
      "The stated accessibility target is WCAG 2.1 AA, with a process for reporting barriers and tracking remediation.",
      "Marketing email rules include sender identification, unsubscribe handling, and truthful subject lines.",
      "Marketing SMS requires express written consent, while transactional messages follow a different rule set.",
      "Users must have a clear way to opt out, including STOP and HELP style flows for text messaging where applicable.",
    ],
    mergedNotes: [
      "This section merges the March 2026 consent framework with the Legal Hub's SMS terms language and accessibility summary.",
    ],
    links: [
      { href: "/accessibility", label: "Accessibility Statement" },
    ],
  },
  {
    id: "disputes",
    title: "Governing Law, Disputes, and Formal Legal Process",
    summary:
      "The package sets Delaware law as the governing framework, requires a first attempt at informal resolution, and explains how arbitration, court exceptions, and formal legal process are handled.",
    highlights: [
      "Before formal proceedings, users must send a written complaint and allow a good-faith attempt at resolution.",
      "Many disputes are routed to binding individual arbitration, with class-action and jury-trial waivers in the package.",
      "Court access is preserved for certain emergency or intellectual-property disputes.",
      "Formal subpoenas, court orders, and law-enforcement requests must go through the legal process channel.",
    ],
    mergedNotes: [
      "The imported Legal Hub text adds a straightforward subpoena compliance policy and reiterates that legal requests should go to the legal contact mailbox.",
    ],
  },
];

export const LEGAL_SUPPLEMENTAL_NOTICES = [
  {
    title: "Advertiser policy",
    body: "Advertisers remain independent and are responsible for their own compliance, content, and business results.",
  },
  {
    title: "Anti-trafficking",
    body: "The platform maintains zero tolerance for trafficking, coercion, exploitation, or illegal services.",
  },
  {
    title: "Complaints and compliance",
    body: "Complaints may require supporting evidence and can result in removal, suspension, or escalation.",
  },
  {
    title: "Health data disclaimer",
    body: "The merged legal view does not treat the platform as a place for protected health information workflows.",
  },
  {
    title: "Phishing and scam notice",
    body: "The platform should never ask users for passwords or one-time codes by email or SMS.",
  },
  {
    title: "Repeat infringer policy",
    body: "Repeated substantiated IP violations can lead to account termination.",
  },
] as const;

export const LEGAL_CONTACT_MATRIX = [
  {
    matter: "Legal inquiries, subpoenas, law enforcement requests, cease and desist",
    email: "legal@masseurmatch.com",
    responseWindow: "5 business days",
  },
  {
    matter: "DMCA copyright takedowns and counter-notifications",
    email: "dmca@masseurmatch.com",
    responseWindow: "2 business days",
  },
  {
    matter: "Privacy rights requests, access, deletion, or correction",
    email: "privacy@masseurmatch.com",
    responseWindow: "45 days where legally applicable",
  },
  {
    matter: "Billing disputes, cancellations, and refund requests",
    email: "billing@masseurmatch.com",
    responseWindow: "3 business days",
  },
  {
    matter: "General support, content reports, accessibility, and account issues",
    email: "support@masseurmatch.com",
    responseWindow: "2 business days",
  },
] as const;

export const LEGAL_CONTACT_SUBJECTS = [
  "Legal inquiry",
  "Privacy request",
  "DMCA or copyright notice",
  "Billing, cancellation, or refund",
  "Content report or safety concern",
  "Accessibility issue",
  "General support",
] as const;
