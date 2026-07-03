import { Crown } from "lucide-react";
import { IconMapPin } from "@/components/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ProfileViewModel } from "./profile-utils";

export function ProfileHeader({ profile }: { profile: ProfileViewModel }) {
  return (
    <div className="rounded-[24px] border border-white/5 bg-[#101C2B]/90 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex flex-wrap items-center gap-2">
        {profile.isVerified && <StatusBadge type="photo-reviewed" size="sm" />}
        {profile.isFeatured && <StatusBadge type="featured" size="sm" />}
        {profile.isPremium && <StatusBadge type="elite" size="sm" />}
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
