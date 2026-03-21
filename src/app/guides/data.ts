export type GuideArticle = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  publishedAt: string;
  readMinutes: number;
  cityLinks: string[];
  sessionLinks: string[];
  body: string[];
};

export const GUIDES: GuideArticle[] = [
  {
    slug: "incall-vs-outcall-dallas",
    title: "Incall vs Outcall in Dallas | What Works Best by Neighborhood | MasseurMatch",
    description: "Understand when incall or outcall is the better fit in Dallas based on neighborhood access, timing, and privacy preferences.",
    h1: "Incall vs Outcall in Dallas: What Works Best",
    publishedAt: "2026-03-20",
    readMinutes: 7,
    cityLinks: ["/cities/dallas-tx", "/cities/plano-tx", "/cities/irving-tx"],
    sessionLinks: ["/cities/dallas-tx/incall", "/cities/dallas-tx/outcall"],
    body: [
      "Dallas demand is split between users who prefer a controlled studio environment and users who prioritize convenience at home or hotel. Incall usually gives better setup consistency, while outcall can reduce transit friction and save time during travel-heavy schedules.",
      "If your priority is predictable setup, choose incall and compare therapist profiles that clearly describe treatment space and session structure. If your priority is convenience, choose outcall and confirm neighborhood coverage before contacting providers.",
      "For airport and hotel corridors like Love Field and DFW Airport, outcall and mobile intent are usually stronger. For repeat maintenance in stable routines, incall often becomes more efficient over time.",
    ],
  },
  {
    slug: "how-to-choose-a-male-massage-therapist-in-dallas",
    title: "How to Choose a Male Massage Therapist in Dallas | MasseurMatch",
    description: "A practical framework for choosing a male therapist in Dallas using trust signals, service fit, and neighborhood relevance.",
    h1: "How to Choose a Male Massage Therapist in Dallas",
    publishedAt: "2026-03-20",
    readMinutes: 8,
    cityLinks: ["/cities/dallas-tx", "/cities/addison-tx", "/cities/richardson-tx"],
    sessionLinks: ["/cities/dallas-tx/outcall", "/cities/dallas-tx/hotel"],
    body: [
      "Start by deciding session intent: pain relief, recovery, mobility, or general restoration. Then shortlist providers who clearly present specialties, session format, and direct-contact expectations.",
      "Trust signals matter. Look for complete bios, visible pricing ranges, neighborhood context, and profile consistency across photos and service claims. These elements usually indicate stronger communication and fewer mismatches.",
      "Finally, choose by location relevance. Dallas users who search by Oak Lawn, Uptown, or Medical District often convert better when neighborhood context is explicit in profile and page structure.",
    ],
  },
  {
    slug: "deep-tissue-vs-swedish-massage-for-men",
    title: "Deep Tissue vs Swedish Massage for Men | MasseurMatch Guide",
    description: "Compare deep tissue and Swedish options for men and decide which style fits your body goals and recovery needs.",
    h1: "Deep Tissue vs Swedish Massage for Men",
    publishedAt: "2026-03-20",
    readMinutes: 6,
    cityLinks: ["/cities/dallas-tx", "/cities/fort-worth-tx", "/cities/plano-tx"],
    sessionLinks: ["/cities/dallas-tx/deep-tissue", "/cities/dallas-tx/swedish"],
    body: [
      "Deep tissue is usually better for focused pressure, muscular tension, and recovery-driven sessions. Swedish is usually better for full-body relaxation, circulation support, and lower-pressure maintenance.",
      "Choose deep tissue when you have specific tension patterns and want targeted work. Choose Swedish when your primary goal is overall reset and stress reduction.",
      "In Dallas, many users start with service pages first, then refine by neighborhood and session format after they identify style preference.",
    ],
  },
  {
    slug: "hotel-massage-in-dallas-what-to-know",
    title: "Hotel Massage in Dallas: What to Know Before Booking | MasseurMatch",
    description: "A short playbook for hotel massage in Dallas covering safety, communication, timing, and local route selection.",
    h1: "Hotel Massage in Dallas: What to Know",
    publishedAt: "2026-03-20",
    readMinutes: 6,
    cityLinks: ["/cities/dallas-tx", "/cities/irving-tx", "/cities/addison-tx"],
    sessionLinks: ["/cities/dallas-tx/hotel", "/cities/dallas-tx/mobile"],
    body: [
      "Hotel sessions work best when expectations are explicit before arrival. Confirm timing window, parking or check-in logistics, and whether your therapist provides outcall to your exact location.",
      "Use pages tied to DFW Airport and Love Field if your search starts from travel corridors. These routes are designed to reduce friction for airport-adjacent intent.",
      "Keep communication direct and practical: service style, duration, and starting rate. Clear pre-session alignment usually improves outcomes on both sides.",
    ],
  },
  {
    slug: "oak-lawn-male-massage-guide",
    title: "Oak Lawn Male Massage Guide | Neighborhood Intent Playbook | MasseurMatch",
    description: "Neighborhood-first guide to finding male massage options in Oak Lawn with stronger trust and service relevance.",
    h1: "Oak Lawn Male Massage Guide",
    publishedAt: "2026-03-20",
    readMinutes: 5,
    cityLinks: ["/cities/dallas-tx", "/cities/plano-tx", "/cities/richardson-tx"],
    sessionLinks: ["/cities/dallas-tx/oak-lawn", "/cities/dallas-tx/gay-massage"],
    body: [
      "Oak Lawn is one of the strongest Dallas micro-areas for location-led discovery. Users often search neighborhood-first, then filter by service and session type.",
      "Use neighborhood pages to narrow by proximity, then review profile trust indicators and visible pricing before contacting therapists.",
      "For wider options, branch into city-level service pages and nearby DFW support routes like Plano and Richardson.",
    ],
  },
];

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
