"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Gallery thumbnails preserve the full uploaded photo instead of cropping it.
// The neutral frame keeps mixed portrait/landscape uploads visually consistent.
export function VoxGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState<number | null>(null);
  const photos = images.slice(0, 9);
  if (photos.length === 0) return null;

  const close = () => setActive(null);
  const step = (dir: number) =>
    setActive((current) => {
      if (current === null) return current;
      return (current + dir + photos.length) % photos.length;
    });

  const gridColumns =
    photos.length === 1
      ? "mx-auto max-w-3xl grid-cols-1"
      : photos.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-2 sm:grid-cols-3";

  const tileRatio = photos.length === 1 ? "aspect-[4/3]" : "aspect-square";

  return (
    <>
      <div className={`grid gap-3 ${gridColumns}`}>
        {photos.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            className={`group relative overflow-hidden rounded-2xl border border-[#efe3d8] bg-[#f3e9df] ${tileRatio}`}
          >
            <Image
              src={src}
              alt={`${name} — gallery photo ${index + 1}`}
              fill
              sizes={
                photos.length === 1
                  ? "(min-width: 1024px) 768px, 100vw"
                  : "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 50vw"
              }
              className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name} gallery`}
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md"
          >
            <X className="h-5 w-5" strokeWidth={2.25} />
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous photo"
                className="absolute left-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md sm:left-6"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  step(1);
                }}
                aria-label="Next photo"
                className="absolute right-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md sm:right-6"
              >
                <ChevronRight className="h-6 w-6" strokeWidth={2.25} />
              </button>
            </>
          )}
          <div
            className="relative h-[78vh] w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={photos[active]}
              alt={`${name} — gallery photo ${active + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
