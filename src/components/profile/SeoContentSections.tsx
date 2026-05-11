import { AvailabilityCard } from "./AvailabilityCard";
import { GalleryGrid } from "./GalleryGrid";
import { PricingCard } from "./PricingCard";
import { ProfileStats } from "./ProfileStats";
import { ServiceTags } from "./ServiceTags";
import type { ProfileViewModel } from "./profile-utils";
import { contactHref } from "./profile-utils";

function Card({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return <section id={id} className="rounded-[24px] border border-white/5 bg-[#101C2B]/90 p-7 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-[3px]"><h2 className="font-display text-[28px] font-bold tracking-[-0.03em] text-[#F8FAFC]">{title}</h2><div className="mt-5 font-sans text-base leading-7 text-[#94A3B8]">{children}</div></section>;
}

export function SeoContentSections({ profile }: { profile: ProfileViewModel }) {
  const contactMethods = [
    ["Phone", contactHref("phone", profile.phone)],
    ["WhatsApp", contactHref("whatsapp", profile.whatsapp)],
    ["Telegram", contactHref("telegram", profile.telegram)],
    ["Email", contactHref("email", profile.email)],
    ["Website", contactHref("website", profile.website)],
    ["Instagram", contactHref("instagram", profile.instagram)],
  ].filter(([, href]) => Boolean(href));
  return <div className="space-y-8">
    <Card id="summary" title="Profile Summary"><ProfileStats profile={profile} /></Card>
    <Card id="about" title={`About ${profile.name}`}><p>{profile.bio}</p></Card>
    <Card id="services" title="Services"><div className="space-y-6"><ServiceTags title="Services" values={profile.services} /><ServiceTags title="Specialties" values={profile.specialties} /><ServiceTags title="Massage types" values={profile.massageTypes} /></div></Card>
    <Card id="seo-services" title={`Massage Services in ${profile.city}`}><p>{profile.name} offers {profile.services.join(", ").toLowerCase()} in {profile.city}, {profile.state}, with specialties including {profile.specialties.join(", ").toLowerCase()}. This profile is built for clients comparing professional massage services, availability, pricing, incall options, outcall travel, and trust details before making contact.</p></Card>
    <Card id="pricing" title="Pricing"><PricingCard profile={profile} />{profile.sessionDurationOptions.length > 0 && <p className="mt-5 text-sm text-[#94A3B8]">Session duration options: {profile.sessionDurationOptions.join(", ")}.</p>}</Card>
    <Card id="incall-outcall" title="Incall and Outcall Availability"><AvailabilityCard profile={profile} /><p className="mt-5">Service area: {profile.serviceArea}. Neighborhood: {profile.neighborhood}. Travel radius: {profile.travelRadius}.</p></Card>
    <Card id="availability" title="Availability"><AvailabilityCard profile={profile} /></Card>
    <Card id="service-areas" title="Service Areas"><p>{profile.name} serves {profile.neighborhood}, {profile.city}, {profile.state}, and {profile.serviceAreas.join(", ")}.</p>{profile.nearbyCities.length > 0 && <p className="mt-3 text-sm text-[#64748B]">Nearby cities: {profile.nearbyCities.map((city) => city.name).join(", ")}.</p>}</Card>
    <Card id="gallery" title="Gallery"><GalleryGrid profile={profile} /></Card>
    <Card id="contact" title={`Contact ${profile.name}`}><p>Preferred contact method: {profile.preferredContactMethod}. Only contact methods published by the profile are shown below.</p><div className="mt-4 flex flex-wrap gap-3">{contactMethods.map(([label, href]) => <a key={label} href={href || "#"} className="rounded-2xl border border-[#3B82F6]/25 bg-[#3B82F6]/10 px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]">{label}</a>)}</div></Card>
    <Card id="trust" title="Trust and Profile Details"><dl className="grid gap-3 md:grid-cols-2"><div><dt className="text-[#64748B]">Verified</dt><dd className="text-white">{profile.isVerified ? "Yes" : "Not listed"}</dd></div><div><dt className="text-[#64748B]">Premium</dt><dd className="text-white">{profile.isPremium ? "Yes" : "Not listed"}</dd></div><div><dt className="text-[#64748B]">Featured</dt><dd className="text-white">{profile.isFeatured ? "Yes" : "Not listed"}</dd></div><div><dt className="text-[#64748B]">Background checked</dt><dd className="text-white">{profile.backgroundChecked ? "Yes" : "Not listed"}</dd></div><div><dt className="text-[#64748B]">Member since</dt><dd className="text-white">{profile.memberSince}</dd></div><div><dt className="text-[#64748B]">Response time</dt><dd className="text-white">{profile.responseTime}</dd></div><div><dt className="text-[#64748B]">Last active</dt><dd className="text-white">{profile.lastActiveAt}</dd></div><div><dt className="text-[#64748B]">Profile status</dt><dd className="text-white">{profile.profileStatus}</dd></div></dl></Card>
  </div>;
}
