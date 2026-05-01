import type { PublicTherapist, ProfileFaqItem } from "@/app/_lib/directory";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

function normalizeFaqItems(value: unknown): ProfileFaqItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is ProfileFaqItem =>
      typeof item === "object" && item !== null &&
      typeof (item as ProfileFaqItem).question === "string" &&
      typeof (item as ProfileFaqItem).answer === "string",
  );
}

/** Build default FAQ items when the therapist hasn't provided custom ones. */
function defaultFaq(profile: PublicTherapist): ProfileFaqItem[] {
  const city = profile.city || "your area";
  const neighborhood = profile.neighborhood_name || profile.primary_area;
  const startingAt = profile.incall_price ?? profile.outcall_price;
  const radiusMiles = profile.outcall_radius_miles;

  return [
    {
      question: `What massage services do you offer in ${city}?`,
      answer: `I offer ${(profile.specialties || []).join(", ") || "deep tissue, Swedish, sports massage,"} and customized sessions tailored to your needs.`,
    },
    {
      question: "Do you provide mobile massage services?",
      answer: radiusMiles
        ? `Yes, I offer mobile massage within ${radiusMiles} miles of ${city}.`
        : `Yes, I offer mobile massage in and around ${city}.`,
    },
    {
      question: "How much does a massage cost?",
      answer: startingAt
        ? `Sessions start at $${startingAt}, depending on duration and service type.`
        : "Pricing depends on duration and service type. Contact me for current rates.",
    },
    {
      question: "Are same-day appointments available?",
      answer: "Yes, availability depends on schedule and current bookings.",
    },
    {
      question: "What areas do you serve?",
      answer: neighborhood
        ? `I serve ${neighborhood}, ${city}, and surrounding areas.`
        : `I serve ${city} and surrounding areas.`,
    },
    {
      question: "Do you travel to other cities?",
      answer: Array.isArray(profile.travel_schedule) && profile.travel_schedule.length > 0
        ? "Yes, I regularly travel and accept bookings in listed travel locations."
        : "Contact me to discuss travel availability.",
    },
    {
      question: "What areas do you cover for outcall?",
      answer: radiusMiles
        ? `Outcall services are available within a ${radiusMiles} mile radius.`
        : "Outcall services are available in the listed service areas.",
    },
  ];
}

interface Props {
  profile: PublicTherapist;
}

export function ProfileFaq({ profile }: Props) {
  const custom = normalizeFaqItems(profile.custom_faq);
  const items = custom.length > 0 ? custom : defaultFaq(profile);

  return (
    <section id="faq" className="profile-panel scroll-mt-24 p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-foreground">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="mt-4">
        {items.map((item, i) => (
          <AccordionItem key={`faq-${i}`} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-foreground">{item.question}</AccordionTrigger>
            <AccordionContent className="text-sm leading-6 text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
