"use client";

import Image from "next/image";
import type { PublicTherapist, ProfilePhoto } from "@/app/_lib/directory";
import { getPublicProfileName } from "@/app/_lib/public-profile";

interface Props {
  profile: PublicTherapist;
  photos: ProfilePhoto[];
}

export function PremiumProfileGallery({ profile, photos }: Props) {
  const name = getPublicProfileName(profile);
  const city = profile.city || "the area";

  const demoPhotos: string[] = Array.isArray((profile as any).gallery_photos)
    ? (profile as any).gallery_photos
    : [];

  const images = photos.length > 0
    ? photos.slice(0, 24).map((p) => p.storage_path)
    : demoPhotos.length > 0
      ? demoPhotos.slice(0, 24)
      : [profile.avatar_url].filter(Boolean) as string[];

  if (images.length === 0) {
    // Show placeholder with gradient
    return (
      <div className="pp-gallery-grid">
        <div className="pp-gallery-item" style={{ gridColumn: "span 2", gridRow: "span 2" }}>
          <div 
            className="w-full h-full min-h-[200px]" 
            style={{ background: "linear-gradient(160deg, #1a3d6e 0%, #0d2444 100%)" }}
          />
        </div>
        <div className="pp-gallery-item">
          <div className="w-full h-full" style={{ background: "linear-gradient(160deg, #1f2f50 0%, #0d2035 100%)" }} />
        </div>
        <div className="pp-gallery-item">
          <div className="w-full h-full" style={{ background: "linear-gradient(160deg, #162840 0%, #0b1e38 100%)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="pp-gallery-grid">
      {images.map((src, i) => (
        <div 
          key={`gallery-${i}`} 
          className="pp-gallery-item"
          style={i === 0 ? { gridColumn: "span 2", gridRow: "span 2", borderRadius: "var(--radius)" } : {}}
        >
          <Image
            src={src}
            alt={`${name} - massage therapist in ${city} - photo ${i + 1}`}
            width={640}
            height={i === 0 ? 800 : 640}
            className="pp-gallery-photo"
          />
          {i === 0 && <span className="pp-gallery-tag">New</span>}
        </div>
      ))}
    </div>
  );
}
