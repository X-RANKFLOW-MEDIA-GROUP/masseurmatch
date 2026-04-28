export type Modality = { slug: string; label: string };

export const MODALITIES: Modality[] = [
  { slug: "gay-massage", label: "Gay Massage" },
  { slug: "gay-massage-therapist", label: "Gay Massage Therapists" },
  { slug: "lgbt-friendly-massage", label: "LGBT Friendly Massage" },
  { slug: "male-massage", label: "Male Massage" },
  { slug: "male-massage-therapist", label: "Male Massage Therapists" },
  { slug: "deep-tissue-massage", label: "Deep Tissue Massage" },
  { slug: "swedish-massage", label: "Swedish Massage" },
  { slug: "sports-massage", label: "Sports Massage" },
  { slug: "therapeutic-massage", label: "Therapeutic Massage" },
  { slug: "relaxation-massage", label: "Relaxation Massage" },
  { slug: "mobile-massage", label: "Mobile Massage" },
  { slug: "incall-massage", label: "Incall Massage" },
  { slug: "outcall-massage", label: "Outcall Massage" },
  { slug: "available-now", label: "Available Now Massage Therapists" },
];

export const MODALITY_BY_SLUG = new Map(MODALITIES.map((m) => [m.slug, m]));
