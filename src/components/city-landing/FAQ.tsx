import { ChevronDown } from "lucide-react";

export type FaqItem = {
  question: string;
  answer: string;
};

/**
 * Reusable, city-agnostic FAQ content. Exported so the same set can be fed into
 * JSON-LD or reused elsewhere. Answers avoid promising any results.
 */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Is a credit card required for the trial?",
    answer:
      "No. As long as this offer remains active, you can start your free trial without entering any credit card details.",
  },
  {
    question: "How long is the free trial?",
    answer: "The free trial lasts 14 days.",
  },
  {
    question: "Does MasseurMatch guarantee clients or bookings?",
    answer:
      "No. MasseurMatch is a directory platform and does not guarantee clients, leads, bookings, income or any results. It helps make your profile easier to find.",
  },
  {
    question: "Can I edit my profile after publishing?",
    answer:
      "Yes. You can update your services, photos, rates and other details at any time from your provider dashboard.",
  },
  {
    question: "Who is responsible for verifying professional licensing requirements?",
    answer:
      "You are. As an independent provider, you are responsible for verifying and meeting any licensing and legal requirements that apply to your services in your area.",
  },
  {
    question: "What types of services are prohibited?",
    answer:
      "Sexual services, erotic services, escorting, solicitation and any illegal activity are strictly prohibited on the platform.",
  },
];

type FAQProps = {
  items?: FaqItem[];
};

/**
 * FAQ accordion built on native <details>/<summary> — fully keyboard
 * accessible with visible focus, and no client-side JavaScript required.
 */
export function FAQ({ items = FAQ_ITEMS }: FAQProps) {
  return (
    <section aria-labelledby="faq-heading" className="bg-[#F7F7F7]">
      <div className="page-shell py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            FAQ
          </span>
          <h2
            id="faq-heading"
            className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[2rem]"
          >
            Frequently asked questions
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {items.map(({ question, answer }) => (
            <details
              key={question}
              className="group rounded-2xl border border-border bg-background px-6 [&_summary]:list-none"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-left text-base font-semibold text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 rounded-2xl">
                {question}
                <ChevronDown
                  className="size-5 shrink-0 text-accent transition-transform duration-200 group-open:rotate-180"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
