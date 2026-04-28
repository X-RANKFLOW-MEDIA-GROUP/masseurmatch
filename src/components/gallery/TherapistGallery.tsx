'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Photo {
  url: string;
  alt: string;
}

interface TherapistGalleryProps {
  photos: Photo[];
  therapistName: string;
}

export function TherapistGallery({
  photos,
  therapistName
}: TherapistGalleryProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="bg-slate-100 rounded-lg p-8 text-center">
        <p className="text-slate-600">No photos available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
        {photos.slice(0, 12).map((photo, index) => (
          <button
            key={index}
            onClick={() => setSelectedPhotoIndex(index)}
            className="relative aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
          >
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              className="object-cover"
            />
          </button>
        ))}
        {photos.length > 12 && (
          <div className="relative aspect-square rounded-lg bg-slate-300 flex items-center justify-center">
            <span className="text-white font-semibold">+{photos.length - 12}</span>
          </div>
        )}
      </div>

      {/* Light box Modal */}
      {selectedPhotoIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl">
            {/* Main Image */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <Image
                src={photos[selectedPhotoIndex].url}
                alt={photos[selectedPhotoIndex].alt}
                fill
                className="object-contain"
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPhotoIndex(
                  selectedPhotoIndex === 0 ? photos.length - 1 : selectedPhotoIndex - 1
                )}
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <span className="text-white text-sm">
                {selectedPhotoIndex + 1} / {photos.length}
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPhotoIndex(
                  selectedPhotoIndex === photos.length - 1 ? 0 : selectedPhotoIndex + 1
                )}
                className="text-white hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-4 right-4 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
