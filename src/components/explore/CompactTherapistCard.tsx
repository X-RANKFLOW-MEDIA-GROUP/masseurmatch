'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import type { ExploreProvider } from '@/app/_lib/explore';

function formatCurrency(value: number | null) {
  if (typeof value !== 'number') return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDistance(miles: number | null) {
  if (typeof miles !== 'number') return null;
  return `${miles.toFixed(1)} mi`;
}

interface CompactTherapistCardProps {
  provider: ExploreProvider;
  onOpen?: (provider: ExploreProvider) => void;
}

export function CompactTherapistCard({
  provider,
  onOpen,
}: CompactTherapistCardProps) {
  const priceLabel = formatCurrency(provider.priceFrom);
  const distanceLabel = formatDistance(provider.distance);
  const isVerified = provider.verifiedStatus !== 'directory';
  const isElite = provider.verifiedStatus === 'elite';

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-black/10"
      itemScope
      itemType="https://schema.org/Person"
    >
      <Link
        href={provider.profilePath}
        onClick={() => onOpen?.(provider)}
        className="flex flex-col flex-1"
        aria-label={`${provider.name}${priceLabel ? `, from ${priceLabel}` : ''}${distanceLabel ? `, ${distanceLabel} away` : ''}`}
      >
        {/* Photo */}
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
          <Image
            src={provider.photoUrl}
            alt={`${provider.name} – massage therapist`}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            itemProp="image"
          />

          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Verification badge */}
          {isVerified && (
            <div className="absolute left-3 top-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 backdrop-blur-sm">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {isElite ? 'Elite' : 'Active'}
              </span>
            </div>
          )}

          {/* Review count */}
          {provider.reviewCount > 0 && (
            <div className="absolute right-3 top-3">
              <span className="inline-flex items-center gap-0.5 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                ★ {provider.reviewCount}
              </span>
            </div>
          )}

          {/* Name overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3
              className="font-['Georgia',serif] text-lg font-normal leading-tight text-white drop-shadow-sm"
              itemProp="name"
            >
              {provider.name}
            </h3>
            {provider.specialty && (
              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-white/65">
                {provider.specialty}
              </p>
            )}
          </div>
        </div>

        {/* Rate + status + distance */}
        <div className="flex items-center justify-between px-3.5 py-3">
          {/* Price */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400">From</p>
            <p className="text-base font-semibold text-neutral-900" itemProp="priceRange">
              {priceLabel ?? 'Contact'}
            </p>
          </div>

          {/* Status + distance */}
          <div className="flex flex-col items-end gap-0.5 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    provider.availableNow ? 'bg-emerald-400' : 'bg-neutral-300'
                  }`}
                />
              </span>
              {provider.availableNow ? 'Available now' : 'Book today'}
            </div>
            {distanceLabel && (
              <span className="text-[11px] text-neutral-400">{distanceLabel}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
