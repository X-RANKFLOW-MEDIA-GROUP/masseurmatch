"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Photo gallery with a lightweight lightbox. Server data passes the image URLs;
// interaction (open / next / prev) is handled here.
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

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            className={`group relative overflow-hidden rounded-2xl border border-[#efe3d8] bg-[#f3e9df] ${
              index === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-[4/3]" : "aspect-square"
            }`}
          >
            <Image
              src={src}
              alt={`${name} — gallery photo ${index + 1}`}
              fill
              sizes="(min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          role="dialog"
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
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                aria-label="Previous photo"
                className="absolute left-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md sm:left-6"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                aria-label="Next photo"
                className="absolute right-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md sm:right-6"
              >
                <ChevronRight className="h-6 w-6" strokeWidth={2.25} />
              </button>
            </>
          )}
          <div
            className="relative h-[78vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
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
