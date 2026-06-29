import { Crown } from "lucide-react";
import { IconMapPin, IconShield, IconSpark } from "@/components/icons";
import type { ProfileViewModel } from "./profile-utils";

export function ProfileHeader({ profile }: { profile: ProfileViewModel }) {
  return (
    <div className="rounded-[24px] border border-white/5 bg-[#101C2B]/90 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#94A3B8]">
        {profile.isVerified && <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-300"><IconShield size={16} />Verified</span>}
        {profile.isFeatured && <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-amber-300"><IconSpark size={16} />Featured</span>}
        {profile.isPremium && <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-blue-200"><Crown className="h-4 w-4" />Premium</span>}
      </div>
      <h1 className="mt-5 font-display text-[clamp(34px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.04em] text-[#F8FAFC]">
        {profile.name} Massage Therapist in {profile.city}, {profile.state}
      </h1>
      <p className="mt-4 max-w-3xl font-sans text-lg leading-8 text-[#94A3B8]">{profile.headline}</p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#94A3B8]">
        <span className="inline-flex items-center gap-2"><IconMapPin size={16} className="text-[#3B82F6]" />{profile.neighborhood}, {profile.city}, {profile.state}, {profile.country}</span>
        <span>Last active: {profile.lastActiveAt}</span>
        <span>Response: {profile.responseTime}</span>
        <span>Member since: {profile.memberSince}</span>
        <span>{profile.yearsExperience}</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {profile.languages.map((language) => <span key={language} className="rounded-full border border-white/5 bg-white/[0.04] px-3 py-1 text-sm text-[#CBD5E1]">{language}</span>)}
      </div>
    </div>
  );
}
