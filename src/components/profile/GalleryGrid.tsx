import Image from "next/image";
import type { ProfileViewModel } from "./profile-utils";

export function GalleryGrid({ profile }: { profile: ProfileViewModel }) {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{profile.galleryImages.map((image, index) => <a key={`${image}-${index}`} href={image} className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/5 bg-[#0B1622] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]" aria-label={`Open gallery image ${index + 1} for ${profile.name}`}><Image src={image} alt={`${profile.name} massage service gallery image in ${profile.city}`} fill sizes="(min-width: 1024px) 280px, 50vw" loading={index === 0 ? "eager" : "lazy"} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" /></a>)}</div>;
}
