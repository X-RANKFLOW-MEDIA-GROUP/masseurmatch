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
      question: `How much does a session with ${name} cost in ${city}?`,
      answer: `${profile.incall_price ? `Incall sessions start at $${profile.incall_price} for 60 minutes.` : ""} ${profile.outcall_price ? `Outcall sessions start at $${profile.outcall_price} for 60 minutes plus a travel fee based on your neighborhood.` : ""} Deep tissue and specialty sessions are slightly higher. Contact ${name} directly for detailed pricing.`
    },
    {
      question: `Does ${name} offer outcall massage in ${city}?`,
      answer: profile.outcall_price 
        ? `Yes. Outcall is available across ${profile.neighborhood_name || city} and surrounding neighborhoods. The travel fee is calculated based on your location.`
        : `${name} currently focuses on incall sessions at their location. Contact them directly to inquire about outcall availability.`
    },
    {
      question: `Is ${name} a licensed and certified massage therapist?`,
      answer: `${name} is a professional massage therapist${profile.years_experience ? ` with ${profile.years_experience}+ years of experience` : ""}. Documentation is available upon request.`
    },
    {
      question: `How do I book a session with ${name}?`,
      answer: `Booking is done directly via SMS, WhatsApp, or phone call using the contact buttons on this page. Same-day sessions are available most weekdays. Check the availability table above for open slots.`
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
