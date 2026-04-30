"use client";

import Link from "next/link";
import type { PublicTherapist } from "@/app/_lib/directory";

const SERVICE_ICONS: Record<string, string> = {
  swedish: "🤲",
  "deep tissue": "💪",
  sports: "🏃",
  relaxing: "✨",
  therapeutic: "🧠",
  couples: "👥",
  hot: "🔥",
  stone: "🪨",
  aromatherapy: "🌸",
  thai: "🧘",
  shiatsu: "🎎",
  reflexology: "🦶",
};

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  swedish: "Classic full-body relaxation with long, flowing strokes and light pressure.",
  "deep tissue": "Targets chronic muscle tension and knots with firm, focused pressure.",
  sports: "Pre or post-activity work to improve performance and reduce injury risk.",
  relaxing: "Gentle full-body session focused on stress relief and calm.",
  therapeutic: "Blended modalities tailored to your specific physical concerns.",
  couples: "Side-by-side session for two. Incall only with advance notice.",
  "hot stone": "Heated volcanic stones for deep relaxation and muscle tension release.",
  aromatherapy: "Essential oils combined with massage for enhanced relaxation.",
  thai: "Traditional stretching and pressure point work without oils.",
  shiatsu: "Japanese technique using finger pressure on energy meridians.",
  reflexology: "Focused foot massage targeting pressure points.",
};

interface Props {
  profile: PublicTherapist;
}

export function PremiumProfileServices({ profile }: Props) {
  const city = profile.city?.toLowerCase() || "";
  const specialties = profile.specialties || ["Swedish", "Deep Tissue", "Sports", "Relaxing", "Therapeutic"];
  
  // Get service cards from specialties
  const serviceCards = specialties.slice(0, 6).map((specialty) => {
    const key = specialty.toLowerCase();
    const icon = SERVICE_ICONS[key] || "💆";
    const desc = SERVICE_DESCRIPTIONS[key] || `Professional ${specialty.toLowerCase()} massage tailored to your needs.`;
    const isFeatured = key === "swedish" || key === "deep tissue";
    
    return {
      name: specialty,
      icon,
      desc,
      isFeatured,
      href: city ? `/${city}/${key.replace(/\s+/g, "-")}-massage` : `/search?q=${encodeURIComponent(specialty)}`,
    };
  });

  // Service tags
  const tags = [
    profile.lgbtq_affirming && "LGBTQ+ Affirming",
    profile.outcall_price && "Outcall Available",
    profile.incall_price && "Incall Available",
    "Same Day Booking",
    "Hotel Sessions",
    profile.city && profile.neighborhood_name && profile.neighborhood_name,
  ].filter(Boolean);

  return (
    <section className="pp-section pp-fade-in" id="services">
      <div className="pp-section-header">
        <h2 className="pp-section-title">Services</h2>
      </div>

      <div className="pp-services-grid">
        {serviceCards.map((service) => (
          <Link
            key={service.name}
            href={service.href}
            className={`pp-service-card ${service.isFeatured ? "featured" : ""}`}
          >
            <div className="pp-service-icon">{service.icon}</div>
            <div className="pp-service-name">{service.name}</div>
            <div className="pp-service-desc">{service.desc}</div>
          </Link>
        ))}
      </div>

      {/* Service Tags */}
      <div className="flex flex-wrap gap-2 mt-6">
        {tags.map((tag) => (
          <span
            key={tag as string}
            className="px-4 py-2 rounded-full border border-[var(--glass-border)] bg-[var(--cream-dim)] text-[var(--cream-soft)] text-xs transition hover:bg-[rgba(30,75,143,0.3)] hover:border-[rgba(30,75,143,0.5)] hover:text-[#7ab3ff]"
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}
