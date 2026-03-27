"use client";

import { MessageCircle, Phone } from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";
import { getPublicContactLinks, getPublicProfileName } from "@/app/_lib/public-profile";
import { useKnottyProfileAttribution } from "./useKnottyProfileAttribution";

interface Props {
  profile: PublicTherapist;
}

export function PremiumProfileCTA({ profile }: Props) {
  const name = getPublicProfileName(profile).split(" ")[0];
  const { callHref, smsHref } = getPublicContactLinks(profile.phone);
  const { trackContact } = useKnottyProfileAttribution({
    therapistId: profile.id,
    city: profile.city,
    neighborhood: profile.neighborhood_name || profile.primary_area,
  });

  return (
    <div className="pp-cta-final pp-fade-in" id="contact">
      {/* Orange line accent */}
      <div className="w-10 h-0.5 bg-[var(--orange)] rounded mx-auto mb-6" />
      
      <h2>Connect With {name}</h2>
      <p>Reach out directly to learn more about their services and availability</p>
      
      <div className="pp-cta-buttons">
        {smsHref && (
          <a
            href={smsHref}
            onClick={() => trackContact("knotty_text_clicked")}
            className="pp-btn pp-btn-primary"
          >
            <MessageCircle className="w-4 h-4" />
            Text
          </a>
        )}
        <a
          href={`https://wa.me/${profile.phone?.replace(/\D/g, "")}`}
          className="pp-btn pp-btn-wa"
        >
          <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 2C8.3 2 2 8.3 2 16c0 2.5.7 4.8 1.8 6.9L2 30l7.3-1.8C11.3 29.3 13.6 30 16 30c7.7 0 14-6.3 14-14S23.7 2 16 2zm7.6 19.4c-.3.9-1.7 1.7-2.4 1.8-.6.1-1.4.1-4.5-1.5-3.8-1.9-6.2-5.8-6.4-6.1-.2-.3-1.4-2-.1-3.9.4-.6.9-.9 1.3-.9h.9c.3 0 .6.2.8.7l1.1 2.7c.2.4.1.8-.1 1.1l-.5.7c-.2.3-.1.7.1 1 .4.6 1.2 1.5 2 2.2.9.7 1.9 1.2 2.5 1.4.4.1.8 0 1-.3l.6-.7c.3-.4.7-.5 1.1-.3l2.6 1.2c.5.2.7.6.5 1Z"/>
          </svg>
          WhatsApp
        </a>
        {callHref && (
          <a
            href={callHref}
            onClick={() => trackContact("knotty_call_clicked")}
            className="pp-btn pp-btn-outline"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
        )}
      </div>

      <p className="text-xs text-white/40 mt-6">
        MasseurMatch is a directory service. All transactions and services are arranged directly between you and the therapist.
      </p>
    </div>
  );
}
