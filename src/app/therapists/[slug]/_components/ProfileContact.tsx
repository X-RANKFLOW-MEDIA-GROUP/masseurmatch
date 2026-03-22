"use client";

import { MessageCircleMore, MessageSquare, Phone } from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";
import { getPublicContactLinks } from "@/app/_lib/public-profile";
import { useKnottyProfileAttribution } from "./useKnottyProfileAttribution";

interface Props {
  profile: PublicTherapist;
}

export function ProfileContact({ profile }: Props) {
  const { callHref, whatsappHref, smsHref } = getPublicContactLinks(profile.phone);
  const neighborhood = profile.neighborhood_name || profile.primary_area || null;
  const { trackContact } = useKnottyProfileAttribution({
    therapistId: profile.id,
    city: profile.city,
    neighborhood,
  });

  if (!callHref && !whatsappHref && !smsHref) return null;

  return (
    <section id="contact" className="profile-panel scroll-mt-24 p-6 md:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
        Direct contact
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-foreground">Reach out on the channel you prefer</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        No marketplace checkout. Message the therapist directly to confirm fit, availability, location, and
        final session details.
      </p>

      {profile.phone ? (
        <div className="profile-panel-soft mt-4 rounded-[1.5rem] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Contact line
          </p>
          <p className="mt-1 text-base font-semibold text-foreground">{profile.phone}</p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3">
        {smsHref ? (
          <a
            href={smsHref}
            onClick={() => trackContact("knotty_text_clicked")}
            className="profile-card-cta w-full rounded-[1.25rem] px-5 py-3.5 text-sm font-semibold"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Text now
          </a>
        ) : null}
        {callHref ? (
          <a
            href={callHref}
            onClick={() => trackContact("knotty_call_clicked")}
            className="profile-cta-secondary w-full rounded-[1.25rem] px-5 py-3.5 text-sm font-semibold"
          >
            <Phone className="mr-2 h-4 w-4" />
            Call
          </a>
        ) : null}
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackContact("knotty_whatsapp_clicked")}
            className="profile-cta-secondary w-full rounded-[1.25rem] px-5 py-3.5 text-sm font-semibold"
          >
            <MessageCircleMore className="mr-2 h-4 w-4" />
            WhatsApp
          </a>
        ) : null}
      </div>
    </section>
  );
}
