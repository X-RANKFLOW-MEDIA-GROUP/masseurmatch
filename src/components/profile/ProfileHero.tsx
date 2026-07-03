import Image from "next/image";
import { Camera } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ProfileViewModel } from "./profile-utils";
import { ProfileHeader } from "./ProfileHeader";

export function ProfileHero({ profile }: { profile: ProfileViewModel }) {
  const thumbs = profile.galleryImages.filter((image) => image !== profile.coverPhotoUrl).slice(0, 4);
  return (
    <section className="space-y-6" aria-label={`${profile.name} profile overview`}>
      <div className="overflow-hidden rounded-[28px] border border-white/5 bg-[#0B1622] shadow-2xl">
        <div className="grid gap-2 lg:grid-cols-[1fr_132px]">
          <div className="relative aspect-[16/8] min-h-[280px] overflow-hidden bg-[#0B1622]">
            <Image src={profile.coverPhotoUrl} alt={`${profile.name} professional massage services in ${profile.city}, ${profile.state}`} fill priority sizes="(min-width: 1024px) 900px, 100vw" className="object-cover transition-transform duration-500 hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071018]/90 via-[#071018]/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-3xl border-2 border-white/15 bg-[#101C2B] shadow-2xl sm:h-32 sm:w-32">
                  <Image src={profile.profilePhotoUrl} alt={`${profile.name} massage therapist in ${profile.city}, ${profile.state}`} fill priority sizes="128px" className="object-cover" />
                </div>
                <div className="hidden sm:block">
                  <div className="flex flex-wrap gap-2">
                    {profile.isVerified && <StatusBadge type="photo-reviewed" size="sm" />}
                    {profile.isFeatured && <StatusBadge type="featured" size="sm" />}
                    {profile.isPremium && <StatusBadge type="elite" size="sm" />}
                  </div>
                  <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-white">{profile.city}, {profile.state}</p>
                </div>
              </div>
              <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm text-white backdrop-blur md:inline-flex"><Camera className="h-4 w-4" />{profile.galleryImages.length} photos</span>
            </div>
          </div>
          <div className="hidden grid-rows-4 gap-2 p-2 lg:grid">
            {thumbs.map((image, index) => (
              <div key={image} className="relative overflow-hidden rounded-2xl bg-[#101C2B]">
                <Image src={image} alt={`${profile.name} massage service gallery image in ${profile.city}`} fill sizes="132px" className="object-cover transition-transform duration-500 hover:scale-[1.03]" loading="lazy" />
                {index === thumbs.length - 1 && <div className="absolute inset-0 grid place-items-center bg-[#071018]/35 text-sm font-semibold text-white">View gallery</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <ProfileHeader profile={profile} />
    </section>
  );
}
