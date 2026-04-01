"use client";

import { useState } from "react";
import type { PublicTherapist, ProfileFaqItem } from "@/app/_lib/directory";
import { getPublicProfileName } from "@/app/_lib/public-profile";

interface Props {
  profile: PublicTherapist;
}

export function PremiumProfileFaq({ profile }: Props) {
  const faqItems = (profile.custom_faq || []) as ProfileFaqItem[];
  const name = getPublicProfileName(profile).split(" ")[0];
  const city = profile.city || "the area";
  
  // Generate default FAQ items if none provided
  const defaultFaqs: ProfileFaqItem[] = [
    {
      question: `What are ${name}'s rates in ${city}?`,
      answer: `${profile.incall_price ? `Incall sessions start at $${profile.incall_price} for 60 minutes.` : ""} ${profile.outcall_price ? `Outcall sessions start at $${profile.outcall_price} for 60 minutes plus travel fees based on location.` : ""} Contact ${name} directly for detailed pricing and custom session rates.`
    },
    {
      question: `Does ${name} offer outcall massage in ${city}?`,
      answer: profile.outcall_price 
        ? `Yes. Outcall is available throughout ${profile.neighborhood_name || city} and surrounding areas. Travel fees apply based on location.`
        : `${name} currently focuses on incall sessions. Contact them directly to inquire about potential outcall availability.`
    },
    {
      question: `What specialties does ${name} offer?`,
      answer: `${name} specializes in ${profile.specialties?.join(", ") || "various massage techniques"}. Each session is customized to your specific needs and preferences. Contact ${name} to discuss which services would be best for you.`
    },
    {
      question: `How do I reach out to ${name}?`,
      answer: `Use the contact buttons on this page to text, call, or message on WhatsApp. You can also ask Knotty AI questions about their services and availability. ${name} handles all communication directly.`
    },
  ];
  
  const faqs = faqItems.length > 0 ? faqItems : defaultFaqs;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="pp-faq-list">
      {faqs.map((item, i) => (
        <div key={i} className={`pp-faq-item ${openIndex === i ? "open" : ""}`}>
          <button className="pp-faq-q" onClick={() => toggle(i)}>
            {item.question}
            <span className="pp-faq-icon">+</span>
          </button>
          <div className="pp-faq-a">
            <div className="pp-faq-a-inner">{item.answer}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
