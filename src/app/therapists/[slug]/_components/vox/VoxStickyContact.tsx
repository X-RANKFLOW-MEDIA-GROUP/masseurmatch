"use client";

import { MessageCircle, Phone } from "lucide-react";

// Mobile-only sticky contact bar. Mirrors the primary contact actions from the
// hero so reaching out is always one tap away on small screens.
export function VoxStickyContact({
  name,
  startingPrice,
  phoneHref,
  whatsappHref,
}: {
  name: string;
  startingPrice: string;
  phoneHref: string | null;
  whatsappHref: string | null;
}) {
  const primary = phoneHref || whatsappHref;
  if (!primary) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E5E5] bg-white/95 p-3 backdrop-blur-xl lg:hidden">
      <div className="flex items-center gap-2">
        {phoneHref && (
          <a
            href={phoneHref}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#8B1E2D] font-semibold text-[#1a0a00] shadow-[0_0_20px_rgba(139, 30, 45,0.35)]"
          >
            <Phone className="h-4 w-4" strokeWidth={2.5} />
            Text {name.split(" ")[0]}
          </a>
        )}
        {whatsappHref && (
          <a
            href={whatsappHref}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#1A1A1A] px-5 font-semibold text-white"
            aria-label={`WhatsApp ${name}`}
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
            WhatsApp
          </a>
        )}
      </div>
      {startingPrice && startingPrice !== "Contact for rates" && (
        <p className="mt-1.5 text-center text-xs text-[#5a5147]">Sessions from {startingPrice}</p>
      )}
    </div>
  );
}
