"use client";

import type { PublicTherapist } from "@/app/_lib/directory";
import { getPublicContactLinks } from "@/app/_lib/public-profile";
import { useKnottyProfileAttribution } from "./useKnottyProfileAttribution";

interface Props {
  profile: PublicTherapist;
}

export function ProfileStickyFooter({ profile }: Props) {
  const { callHref, whatsappHref, smsHref } = getPublicContactLinks(profile.phone);
  const neighborhood = profile.neighborhood_name || profile.primary_area || null;
  const { trackContact } = useKnottyProfileAttribution({
    therapistId: profile.id,
    city: profile.city,
    neighborhood,
  });

  if (!callHref && !whatsappHref && !smsHref) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/12 bg-brand-primary/92 p-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-4xl gap-2">
        {smsHref && (
          <a
            href={smsHref}
            onClick={() => trackContact("knotty_text_clicked")}
            className="profile-card-cta flex-1 rounded-[1rem] px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em]"
          >
            Text Now
          </a>
        )}
        {callHref && (
          <a
            href={callHref}
            onClick={() => trackContact("knotty_call_clicked")}
            className="flex-1 rounded-[1rem] border border-white/14 bg-white/10 px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-white backdrop-blur"
          >
            Call
          </a>
        )}
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackContact("knotty_whatsapp_clicked")}
            className="flex-1 rounded-[1rem] border border-white/14 bg-white/10 px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-white backdrop-blur"
          >
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
