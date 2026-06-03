import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import type { ProfileFaqItem } from "@/app/_lib/directory";

export function ProfileQandA({ items, name }: { items: ProfileFaqItem[]; name: string }) {
  if (!items.length) return null;

  return (
    <section
      id="faq"
      className="rounded-[24px] border border-white/5 bg-[#101C2B]/90 p-7 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3B82F6]/12 text-[#60A5FA]">
          <MessageCircleQuestion className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <div>
          <h2 className="font-display text-[28px] font-bold tracking-[-0.03em] text-[#F8FAFC]">
            Questions &amp; Answers
          </h2>
          <p className="font-sans text-sm text-[#64748B]">
            Common questions about {name}, answered from this profile.
          </p>
        </div>
      </div>

      <div className="mt-6 divide-y divide-white/5 border-t border-white/5">
        {items.map((item) => (
          <details key={item.question} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-sans text-base font-semibold text-[#F8FAFC] transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
              <span itemProp="name">{item.question}</span>
              <ChevronDown
                className="h-5 w-5 shrink-0 text-[#64748B] transition-transform duration-300 group-open:rotate-180"
                strokeWidth={2.25}
              />
            </summary>
            <p className="pb-5 pr-9 font-sans text-base leading-7 text-[#94A3B8]">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
