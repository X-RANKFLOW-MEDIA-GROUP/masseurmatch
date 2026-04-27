'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, GitCompareArrows, MapPin, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ExploreProvider } from '@/app/_lib/explore';

const FACE_FOCUS_OBJECT_POSITION = '50% 18%';

function formatCurrency(value: number | null) {
  if (typeof value !== 'number') {
    return 'Contact for pricing';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

interface CompactTherapistCardProps {
  provider: ExploreProvider;
  selectedForCompare?: boolean;
  onToggleCompare?: () => void;
  onOpen?: (provider: ExploreProvider) => void;
}

export function CompactTherapistCard({
  provider,
  selectedForCompare = false,
  onToggleCompare,
  onOpen,
}: CompactTherapistCardProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-[0_18px_44px_rgba(15,23,42,0.14)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        <Image
          src={provider.photoUrl}
          alt={`${provider.name} profile photo`}
          fill
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          style={{ objectPosition: FACE_FOCUS_OBJECT_POSITION }}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

        <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {provider.verifiedStatus !== 'directory' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/50 bg-emerald-500/90 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                <CheckCircle2 className="h-3 w-3" />
                {provider.verifiedStatus === 'elite' ? 'Elite' : 'Verified'}
              </span>
            )}
            {provider.featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-orange-200/50 bg-orange-500/90 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                <Zap className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>

          {provider.reviewCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-yellow-300/50 bg-yellow-500/90 px-2 py-1 text-[11px] font-semibold text-white">
              <Star className="h-3 w-3" />
              {provider.reviewCount}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="line-clamp-1 text-lg font-semibold text-white drop-shadow">{provider.name}</h3>
          <p className="line-clamp-1 text-xs text-white/80">{provider.specialty}</p>
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/30 px-2 py-1 text-[11px] text-white/90 backdrop-blur-sm">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{provider.neighborhood}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="flex flex-wrap gap-1.5">
          {provider.incall ? <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-medium text-orange-700">Incall</span> : null}
          {provider.outcall ? <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">Outcall</span> : null}
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${provider.availableNow ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            {provider.availableNow ? 'Available now' : 'Limited availability'}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">Starting at</p>
          <p className="text-base font-semibold text-slate-900">{formatCurrency(provider.priceFrom)}</p>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Button asChild size="sm" className="rounded-full" onClick={() => onOpen?.(provider)}>
            <Link href={provider.profilePath}>View profile</Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={selectedForCompare ? 'default' : 'outline'}
            className="rounded-full"
            onClick={onToggleCompare}
            aria-pressed={selectedForCompare}
          >
            <GitCompareArrows className="h-3.5 w-3.5" />
            {selectedForCompare ? 'Added' : 'Compare'}
          </Button>
        </div>
      </div>
    </article>
  );
}
