"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Mail, MessageSquare, Phone } from "lucide-react";
import Image from "next/image";
import type { PublicTherapist } from "@/app/_lib/directory";
import {
  getPublicContactLinks,
  getPublicProfileName,
} from "@/app/_lib/public-profile";
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

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [0, 1]);
  const y = useTransform(scrollY, [0, 200], [20, 0]);

  if (!callHref && !whatsappHref && !smsHref) return null;

  const displayName = getPublicProfileName(profile);
  const avatarSrc =
    profile.avatar_url ||
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop";

  return (
    <motion.div
      style={{ opacity, y }}
      className="fixed bottom-0 left-0 w-full z-50 pointer-events-none pb-4 px-4 sm:pb-6"
    >
      <div className="container mx-auto max-w-4xl pointer-events-auto">
        {/* Glassmorphic Floating Pill */}
        <div className="bg-white/85 backdrop-blur-xl border border-slate-200/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-3 sm:p-4 flex items-center justify-between gap-4">
          {/* Left: Therapist Identity */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden bg-slate-100">
              <Image
                src={avatarSrc}
                alt={displayName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-sm font-medium text-slate-900 leading-none">
                {displayName}
              </span>
            </div>
          </div>

          {/* Right: Direct-Line Actions */}
          <div className="flex items-center w-full sm:w-auto gap-2 sm:gap-3 justify-between sm:justify-end">
            {/* SMS — highest-conversion channel */}
            {smsHref && (
              <a
                href={smsHref}
                onClick={() => trackContact("knotty_text_clicked")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-12 px-6 bg-slate-950 text-white hover:bg-slate-800 transition-colors active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="font-sans text-sm font-semibold tracking-wide">Text</span>
              </a>
            )}

            {/* Call */}
            {callHref && (
              <a
                href={callHref}
                onClick={() => trackContact("knotty_call_clicked")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-12 px-6 bg-slate-50 border border-slate-200 text-slate-900 hover:bg-slate-100 transition-colors active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span className="font-sans text-sm font-semibold tracking-wide">Call</span>
              </a>
            )}

            {/* WhatsApp — icon-only on wider screens */}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackContact("knotty_whatsapp_clicked")}
                className="hidden md:flex items-center justify-center h-12 w-12 bg-transparent text-slate-400 hover:text-slate-900 transition-colors"
                aria-label="WhatsApp"
              >
                <Mail className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
