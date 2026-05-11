import { AlertTriangle, ExternalLink, Heart, Mail, MessageCircle, Phone, Send, Share2 } from "lucide-react";
import type { ProfileViewModel } from "./profile-utils";
import { contactHref } from "./profile-utils";

function ContactButton({ label, href, icon: Icon, primary = false }: { label: string; href: string | null; icon: typeof Phone; primary?: boolean }) {
  if (!href) return null;
  return <a href={href} className={primary ? "inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] px-5 font-display text-base font-semibold text-[#F8FAFC] shadow-[0_16px_50px_rgba(59,130,246,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(59,130,246,0.35)] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#071018]" : "inline-flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-[#F8FAFC] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"} aria-label={label}><Icon className="h-4 w-4" />{label}</a>;
}

export function StickyContactCard({ profile }: { profile: ProfileViewModel }) {
  const primaryHref = contactHref(profile.preferredContactMethod.toLowerCase().includes("whatsapp") ? "whatsapp" : profile.preferredContactMethod.toLowerCase().includes("email") ? "email" : "phone", profile.preferredContactMethod.toLowerCase().includes("whatsapp") ? profile.whatsapp : profile.preferredContactMethod.toLowerCase().includes("email") ? profile.email : profile.phone) || contactHref("phone", profile.phone) || contactHref("whatsapp", profile.whatsapp) || contactHref("email", profile.email);
  return (
    <aside className="sticky top-[100px] hidden self-start rounded-[24px] border border-white/5 bg-[#101C2B]/90 p-7 shadow-2xl backdrop-blur-xl lg:block" aria-label={`Contact ${profile.name}`}>
      <div className="flex items-start justify-between gap-4">
        <div><p className="font-sans text-sm text-[#94A3B8]">Starting at</p><p className="mt-1 font-display text-4xl font-bold tracking-[-0.04em] text-[#F8FAFC]">{profile.startingPrice}</p><p className="mt-1 text-xs uppercase tracking-[0.24em] text-[#64748B]">{profile.currency}</p></div>
        <div className="rounded-2xl border border-[#3B82F6]/20 bg-[#3B82F6]/10 px-3 py-2 text-right text-xs text-blue-100">{profile.preferredContactMethod}<br />preferred</div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-[#CBD5E1]"><div className="rounded-2xl bg-white/[0.04] p-3"><span className="block text-[#64748B]">Incall</span>{profile.incallAvailable ? profile.incallPrice : "Not listed"}</div><div className="rounded-2xl bg-white/[0.04] p-3"><span className="block text-[#64748B]">Outcall</span>{profile.outcallAvailable ? profile.outcallPrice : "Not listed"}</div></div>
      <p className="mt-4 text-sm leading-6 text-[#94A3B8]">Serving {profile.city}, {profile.state}. Travel radius: {profile.travelRadius}.</p>
      <div className="mt-6 space-y-3">
        <ContactButton label={`Contact ${profile.name}`} href={primaryHref} icon={MessageCircle} primary />
        <div className="grid grid-cols-2 gap-3">
          <ContactButton label="Call" href={contactHref("phone", profile.phone)} icon={Phone} />
          <ContactButton label="WhatsApp" href={contactHref("whatsapp", profile.whatsapp)} icon={MessageCircle} />
          <ContactButton label="Telegram" href={contactHref("telegram", profile.telegram)} icon={Send} />
          <ContactButton label="Email" href={contactHref("email", profile.email)} icon={Mail} />
          <ContactButton label="Website" href={contactHref("website", profile.website)} icon={ExternalLink} />
          <ContactButton label="Instagram" href={contactHref("instagram", profile.instagram)} icon={ExternalLink} />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2"><button className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs text-[#94A3B8]" aria-label="Save profile"><Heart className="mx-auto mb-1 h-4 w-4" />Save</button><button className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs text-[#94A3B8]" aria-label="Share profile"><Share2 className="mx-auto mb-1 h-4 w-4" />Share</button><button className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs text-[#94A3B8]" aria-label="Report profile"><AlertTriangle className="mx-auto mb-1 h-4 w-4" />Report</button></div>
    </aside>
  );
}

export function MobileContactCTA({ profile }: { profile: ProfileViewModel }) {
  const href = contactHref("phone", profile.phone) || contactHref("whatsapp", profile.whatsapp) || contactHref("email", profile.email);
  if (!href) return null;
  return <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#071018]/90 p-3 backdrop-blur-xl lg:hidden"><a href={href} className="flex h-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] font-display font-semibold text-white shadow-[0_12px_40px_rgba(59,130,246,0.35)]">Contact {profile.name} · {profile.startingPrice}</a></div>;
}
