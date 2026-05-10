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
  const { callHref, smsHref, whatsappHref } = getPublicContactLinks(profile.phone, profile.whatsapp_number, profile.id);
  const { trackContact } = useKnottyProfileAttribution({
    therapistId: profile.id,
    city: profile.city,
    neighborhood: profile.neighborhood_name || profile.primary_area || null,
  });

  return (
    <div className="pp-cta-final pp-fade-in" id="contact">
      <div className="w-10 h-0.5 bg-[var(--orange)] rounded mx-auto mb-6" />
      <h2>Connect With {name}</h2>
      <p>Reach out directly to learn more about their services and availability</p>

      <div className="pp-cta-buttons">
        {smsHref && (
          <a href={smsHref} onClick={() => trackContact("knotty_text_clicked")} className="pp-btn pp-btn-primary">
            <MessageCircle className="w-4 h-4" />
            Text
          </a>
        )}
        {whatsappHref && (
          <a href={whatsappHref} onClick={() => trackContact("knotty_whatsapp_clicked")} className="pp-btn pp-btn-wa">
            WhatsApp
          </a>
        )}
        {callHref && (
          <a href={callHref} onClick={() => trackContact("knotty_call_clicked")} className="pp-btn pp-btn-outline">
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
