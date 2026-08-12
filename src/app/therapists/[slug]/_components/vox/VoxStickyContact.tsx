"use client";

import { MessageCircle } from "lucide-react";
import { trackConversion } from "@/lib/seo-tracking-config";

// Mobile-only sticky contact bar. Mirrors the primary contact actions from the
// hero so reaching out is always one tap away on small screens.
export function VoxStickyContact({
  name,
  startingPrice,
  phoneHref,
  profileId,
}: {
  name: string;
  startingPrice: string;
  phoneHref: string | null;
  profileId?: string;
}) {
  if (!phoneHref) return null;

  const handlePhoneClick = () => {
    if (profileId) {
      trackConversion("contact", profileId);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E5E5] bg-white/95 p-3 backdrop-blur-xl lg:hidden">
      <div className="flex items-center gap-2">
        <a
          href={phoneHref}
          onClick={handlePhoneClick}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#8B1E2D] font-semibold text-white shadow-[0_0_20px_rgba(139, 30, 45,0.35)]"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
          WhatsApp {name.split(" ")[0]}
        </a>
      </div>
      {startingPrice && startingPrice !== "Contact for rates" && (
        <p className="mt-1.5 text-center text-xs text-[#5a5147]">Sessions from {startingPrice}</p>
      )}
    </div>
  );
}
