"use client";

import type { PublicTherapist } from "@/app/_lib/directory";
import { getPublicProfileName } from "@/app/_lib/public-profile";

interface Props {
  profile: PublicTherapist;
}

export function PremiumProfilePricing({ profile }: Props) {
  const name = getPublicProfileName(profile).split(" ")[0];
  const incallBase = profile.incall_price || 120;
  const outcallBase = profile.outcall_price || 160;
  const validPrices = [profile.incall_price, profile.outcall_price].filter((p): p is number => typeof p === "number" && p > 0);
  const basePrice = validPrices.length > 0 ? Math.min(...validPrices) : incallBase;
  const extendedPrice = Math.round(basePrice * 1.5);

  const rateCards = [
    {
      duration: "60 minutes",
      price: basePrice,
      description: "Spa-quality bodywork, tailored to you — blending techniques for optimal relief.",
      discount: "Best for first visit",
    },
    {
      duration: "90 minutes",
      price: extendedPrice,
      description: "Extended session for deeper therapeutic work, full-body recovery, and complete stress release.",
      discount: "Best value",
    },
  ];

  if (profile.incall_price && profile.outcall_price) {
    rateCards.push({
      duration: "60 min outcall",
      price: outcallBase,
      description: "Professional mobile session at your home or hotel with full setup included.",
      discount: "",
    });
    rateCards.push({
      duration: "90 min outcall",
      price: Math.round(outcallBase * 1.5),
      description: "Extended mobile session for comprehensive therapeutic bodywork.",
      discount: "",
    });
  }

  const paymentMethods = ["Cash", "Venmo", "Zelle", "Visa / MC", "Apple Pay"];

  return (
    <section className="pp-fade-in" id="pricing">
      <div className="pp-sec-label">Rates & Pricing</div>
      <div className="pp-sec-title">{name}&apos;s Massage Sessions</div>
      <div className="pp-rates-grid">
        {rateCards.map((card) => (
          <div key={card.duration} className="pp-rate-card">
            <div className="pp-rate-duration">{card.duration}</div>
            <div className="pp-rate-price"><sup>$</sup>{card.price}</div>
            <div className="pp-rate-name">{card.description}</div>
            {card.discount && <span className="pp-rate-discount">{card.discount}</span>}
          </div>
        ))}
      </div>
      <div style={{ marginTop: "16px", fontSize: "13px", color: "#3a4f6a" }}>
        Discounts available for <strong>repeat clients</strong>. Ask {name} for details.
      </div>
      <div className="pp-payment-methods">
        {paymentMethods.map((method) => (
          <span key={method} className="pp-pay-chip">{method}</span>
        ))}
      </div>
    </section>
  );
}
