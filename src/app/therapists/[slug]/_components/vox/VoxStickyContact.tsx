"use client";

import { Mail, MessageCircle, MessageSquare, Phone } from "lucide-react";
import { trackConversion } from "@/lib/seo-tracking-config";

// Mobile-only sticky contact bar. Mirrors the contact actions from the hero so
// reaching out is always one tap away on small screens. The first available
// method renders as the labeled primary button; the rest collapse to icons.
export function VoxStickyContact({
  name,
  startingPrice,
  callHref,
  smsHref,
  whatsappHref,
  emailHref,
  profileId,
}: {
  name: string;
  startingPrice: string;
  callHref: string | null;
  smsHref: string | null;
  whatsappHref: string | null;
  emailHref: string | null;
  profileId?: string;
}) {
  const firstName = name.split(" ")[0];

  const track = (conversion: "contact" | "email") => () => {
    if (profileId) {
      trackConversion(conversion, profileId);
    }
  };

  const actions = [
    callHref && { key: "call", href: callHref, label: `Call ${firstName}`, Icon: Phone, onClick: track("contact") },
    smsHref && { key: "sms", href: smsHref, label: `Text ${firstName}`, Icon: MessageSquare, onClick: track("contact") },
    whatsappHref && { key: "whatsapp", href: whatsappHref, label: `WhatsApp ${firstName}`, Icon: MessageCircle, onClick: track("contact") },
    emailHref && { key: "email", href: emailHref, label: `Email ${firstName}`, Icon: Mail, onClick: track("email") },
  ].filter(Boolean) as Array<{
    key: string;
    href: string;
    label: string;
    Icon: typeof Phone;
    onClick: () => void;
  }>;

  if (actions.length === 0) return null;

  const [primary, ...secondary] = actions;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E5E5] bg-white/95 p-3 backdrop-blur-xl lg:hidden">
      <div className="flex items-center gap-2">
        <a
          href={primary.href}
          onClick={primary.onClick}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#8B1E2D] font-semibold text-white shadow-[0_0_20px_rgba(139,30,45,0.35)]"
        >
          <primary.Icon className="h-4 w-4" strokeWidth={2.5} />
          {primary.label}
        </a>
        {secondary.map(({ key, href, label, Icon, onClick }) => (
          <a
            key={key}
            href={href}
            onClick={onClick}
            aria-label={label}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D9D9D9] bg-white text-[#8B1E2D]"
          >
            <Icon className="h-4 w-4" strokeWidth={2.5} />
          </a>
        ))}
      </div>
      {startingPrice && startingPrice !== "Contact for rates" && (
        <p className="mt-1.5 text-center text-xs text-[#5a5147]">Sessions from {startingPrice}</p>
      )}
    </div>
  );
}
