"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InkReveal } from "@/components/motion/InkReveal";
import { SplitTextReveal } from "@/components/motion/SplitTextReveal";
import type { FaqItem } from "@/lib/marketing/home-data";

type Props = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: Props) {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 lg:mb-16">
          <InkReveal origin="left" duration={0.7}>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Common questions
            </p>
          </InkReveal>
          <SplitTextReveal
            text="Everything you need to know."
            tag="h2"
            wordMode
            charDelay={0.06}
            className="mt-3 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight"
          />
        </div>

        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={item.question} value={`item-${i}`}>
              <AccordionTrigger className="py-6 text-left font-display text-xl font-bold hover:no-underline lg:text-2xl [&[data-state=open]>svg]:rotate-180">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
