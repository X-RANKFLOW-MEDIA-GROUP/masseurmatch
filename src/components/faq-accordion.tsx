/**
 * FAQAccordion: Display FAQ items as accessible accordion
 * Pairs with FAQSchemaProvider for both visual + SEO benefits
 */

"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { type FAQItem, getCityFAQ } from "@/lib/seo/faq-schema";

interface FAQAccordionProps {
  city?: string;
  items?: FAQItem[];
  className?: string;
  showLinks?: boolean;
}

export function FAQAccordion({
  city,
  items,
  className,
  showLinks = true,
}: FAQAccordionProps) {
  // Use provided items or fetch from city
  const faqItems = items || (city ? getCityFAQ(city) : []);

  if (faqItems.length === 0) {
    return null;
  }

  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      className={cn("w-full space-y-3", className)}
    >
      {faqItems.map((item, index) => (
        <FAQAccordionItem key={index} item={item} showLink={showLinks} />
      ))}
    </AccordionPrimitive.Root>
  );
}

interface FAQAccordionItemProps {
  item: FAQItem;
  showLink?: boolean;
}

function FAQAccordionItem({ item, showLink = true }: FAQAccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      value={`item-${item.question.slice(0, 20)}`}
      className={cn(
        "border border-[#E8E8E8] rounded-md overflow-hidden",
        "transition-colors duration-200",
        "data-[state=open]:border-[#D9D9D9] data-[state=open]:bg-[#FAFAFA]"
      )}
    >
      <AccordionPrimitive.Trigger
        className={cn(
          "flex w-full items-center justify-between",
          "px-5 py-4",
          "text-left text-base font-medium text-[#111111]",
          "hover:bg-[#F7F7F7] transition-colors",
          "group"
        )}
      >
        <span>{item.question}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-[#6F6F6F] flex-shrink-0 ml-4",
            "transition-transform duration-200",
            "group-data-[state=open]:rotate-180"
          )}
          strokeWidth={2.25}
        />
      </AccordionPrimitive.Trigger>

      <AccordionPrimitive.Content
        className={cn(
          "overflow-hidden px-5 pb-4 pt-0",
          "data-[state=closed]:animate-accordion-up",
          "data-[state=open]:animate-accordion-down"
        )}
      >
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-[#6F6F6F]">
            {item.answer}
          </p>

          {showLink && item.linkText && item.linkHref && (
            <a
              href={item.linkHref}
              className={cn(
                "inline-flex items-center gap-2",
                "text-sm font-medium text-[#8B1E2D]",
                "hover:text-[#6E1521] transition-colors",
                "underline underline-offset-2"
              )}
            >
              {item.linkText}
              <span className="text-xs">→</span>
            </a>
          )}
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}

/**
 * Minimal FAQList: Display FAQs as simple list (no accordion)
 * Good for footer or dense layouts
 */
export function FAQList({
  city,
  items,
  className,
}: Omit<FAQAccordionProps, "showLinks">) {
  const faqItems = items || (city ? getCityFAQ(city) : []);

  if (faqItems.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {faqItems.map((item, index) => (
        <div key={index} className="space-y-2">
          <h3 className="text-base font-semibold text-[#111111]">
            {item.question}
          </h3>
          <p className="text-sm leading-relaxed text-[#6F6F6F]">
            {item.answer}
          </p>
        </div>
      ))}
    </div>
  );
}
