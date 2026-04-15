'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, MapPin, Star, Zap } from 'lucide-react';
import type { ExploreProvider } from '@/app/_lib/explore';

const FACE_FOCUS_OBJECT_POSITION = '50% 18%';

function formatCurrency(value: number | null) {
  if (typeof value !== 'number') {
    return 'Request';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function CompactTherapistCard({ provider }: { provider: ExploreProvider }) {
  return (
    <Link href={provider.profilePath}>
      <article className="group relative overflow-hidden rounded-xl border border-slate-200 shadow-md transition-all duration-300 hover:shadow-xl hover:border-orange-300 bg-white flex flex-col h-full">
        {/* Image Section */}
        <div className="relative aspect-[3/4] overflow-hidden bg-slate-200">
          <Image
            src={provider.photoUrl}
            alt={provider.name}
            fill
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ objectPosition: FACE_FOCUS_OBJECT_POSITION }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1">
            {provider.verifiedStatus !== 'directory' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-500/90 text-white backdrop-blur-sm border border-emerald-400/50">
                <CheckCircle2 className="h-3 w-3" />
                {provider.verifiedStatus === 'elite' ? 'Elite' : 'Verified'}
              </span>
            )}
            {provider.featured && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-orange-500/90 text-white backdrop-blur-sm border border-orange-400/50">
                <Zap className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>

          {/* Availability Status - Bottom Right */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <span className={`h-2.5 w-2.5 rounded-full ${provider.availableNow ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-xs font-semibold text-white backdrop-blur-sm bg-black/40 px-2 py-1 rounded-full">
              {provider.availableNow ? 'Available' : 'Book'}
            </span>
          </div>

          {/* Reviews Badge - Top Right */}
          {provider.reviewCount > 0 && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-yellow-500/90 text-white backdrop-blur-sm border border-yellow-400/50">
                <Star className="h-3 w-3" />
                {provider.reviewCount}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col gap-2 p-3">
          {/* Name */}
          <div>
            <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
              {provider.name}
            </h3>
            <p className="text-xs text-slate-600 line-clamp-1">{provider.specialty}</p>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <MapPin className="h-3 w-3 text-orange-500 flex-shrink-0" />
            <span className="line-clamp-1">{provider.neighborhood}</span>
          </div>

          {/* Service Modes */}
          {(provider.incall || provider.outcall) && (
            <div className="flex flex-wrap gap-1">
              {provider.incall && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
                  Incall
                </span>
              )}
              {provider.outcall && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                  Outcall
                </span>
              )}
            </div>
          )}

          {/* Traveling/Visiting Status */}
          {provider.offerText && (
            <p className="text-xs text-emerald-700 font-medium line-clamp-1">
              ✓ {provider.offerText}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price Section */}
          <div className="border-t border-slate-200 pt-2">
            <p className="text-xs text-slate-500 font-medium">Starting</p>
            <p className="font-semibold text-lg text-slate-900">
              {formatCurrency(provider.priceFrom)}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
