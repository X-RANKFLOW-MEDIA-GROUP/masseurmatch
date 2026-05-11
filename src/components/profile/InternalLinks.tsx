import Link from "next/link";
import type { PublicTherapist } from "@/app/_lib/directory";
import type { ProfileViewModel } from "./profile-utils";
import { buildProfileViewModel } from "./profile-utils";

export function InternalLinks({ profile, relatedProfiles = [] }: { profile: ProfileViewModel; relatedProfiles?: PublicTherapist[] }) {
  const links = [{ href: `/${profile.citySlug}`, label: `${profile.city} massage therapists` }, { href: `/massage/${profile.serviceSlug}`, label: `${profile.services[0] || "Massage"} services` }, ...profile.nearbyCities.map((city) => ({ href: `/${city.slug}`, label: `${city.name} massage therapists` }))];
  const related = relatedProfiles.map((item) => buildProfileViewModel(item)).filter((item) => item.id !== profile.id).slice(0, 3);
  return <section className="rounded-[24px] border border-white/5 bg-[#101C2B]/90 p-7 shadow-2xl backdrop-blur-xl"><h2 className="font-display text-[28px] font-bold tracking-[-0.03em] text-white">Browse Related Profiles</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{links.map((link) => <Link key={link.href} href={link.href} className="rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-[#F8FAFC] transition-all hover:-translate-y-0.5 hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/10">{link.label}</Link>)}</div>{related.length > 0 && <div className="mt-6 grid gap-3 md:grid-cols-3">{related.map((item) => <Link key={item.id} href={`/therapists/${item.slug}`} className="rounded-3xl border border-[#3B82F6]/15 bg-[#3B82F6]/[0.06] p-4 transition-all hover:-translate-y-0.5"><span className="block font-display text-lg font-semibold text-white">{item.name}</span><span className="mt-1 block text-sm text-[#94A3B8]">{item.headline}</span><span className="mt-3 block text-xs text-[#64748B]">{item.city}, {item.state}</span></Link>)}</div>}</section>;
}
