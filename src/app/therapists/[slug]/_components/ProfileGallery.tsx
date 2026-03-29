import Image from "next/image";
import type { PublicTherapist } from "@/app/_lib/directory";
import type { ProfilePhoto } from "@/app/_lib/directory";
import { getPublicProfileName } from "@/app/_lib/public-profile";
import { galleryLimit } from "./galleryLimit";

interface Props {
  profile: PublicTherapist;
  photos: ProfilePhoto[];
}

export function ProfileGallery({ profile, photos }: Props) {
  const limit = galleryLimit(profile._tier);
  const name = getPublicProfileName(profile);
  const city = profile.city || "US";

  const images = photos.length > 0
    ? photos.slice(0, limit).map((p) => p.storage_path)
    : [profile.avatar_url].filter(Boolean) as string[];

  if (images.length === 0) return null;

  return (
    <section id="gallery" className="profile-panel scroll-mt-24 p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-foreground">Gallery</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {profile._tier === "elite" ? "Up to 12 photos" : profile._tier === "pro" ? "Up to 9 photos" : "Up to 5 photos"}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((src, i) => (
          <div key={`gallery-${i}`} className="profile-panel-soft overflow-hidden rounded-[1.5rem]">
            <Image
              src={src}
              alt={`${name} — ${city} Massage Therapist photo ${i + 1}`}
              width={640}
              height={640}
              className="h-64 w-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
