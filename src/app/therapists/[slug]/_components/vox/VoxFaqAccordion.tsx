"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ProfileFaqItem } from "@/app/_lib/directory";

// Warm-themed FAQ accordion. Uses real, profile-derived questions only.
export function VoxFaqAccordion({ items }: { items: ProfileFaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[#E5E5E5] overflow-hidden rounded-3xl border border-[#E5E5E5] bg-white">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.question} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-7"
            >
              <span itemProp="name" className="text-base font-semibold text-[#111111]">
                {item.question}
              </span>
              <ChevronDown
                className={`h-5 w-5 flex-shrink-0 text-[#8B1E2D] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                strokeWidth={2.5}
              />
            </button>
            {isOpen && (
              <div
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
                className="px-5 pb-6 sm:px-7"
              >
                <p itemProp="text" className="text-[15px] leading-7 text-[#5a5147]">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
