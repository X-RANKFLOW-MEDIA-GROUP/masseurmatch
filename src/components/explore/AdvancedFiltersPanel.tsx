'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import type { ExploreFilters } from '@/app/_lib/explore';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export interface FilterState {
  availability: string[];
  travelStatus: string[];
  verification: string[];
  priceRange: [number, number];
  rating: number | null;
  hasPhotos: boolean;
  serviceModes: string[];
}

interface AdvancedFiltersProps {
  filters?: ExploreFilters;
  onFilterChange?: (filters: ExploreFilters) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onApplyFilters?: (filters: FilterState) => void;
  defaultFilters?: FilterState;
}

const AVAILABILITY_OPTIONS = [
  { id: 'available_now', label: 'Available Now' },
  { id: 'open_soon', label: 'Open Soon (Next 24hrs)' },
  { id: 'fully_booked', label: 'Fully Booked' },
];

const TRAVEL_OPTIONS = [
  { id: 'in_clinic', label: 'In-Clinic' },
  { id: 'traveling', label: 'Traveling' },
  { id: 'visiting', label: 'Visiting Clients' },
];

const VERIFICATION_OPTIONS = [
  { id: 'verified', label: 'Active' },
  { id: 'pending', label: 'Pending Review' },
  { id: 'unverified', label: 'Not Yet Reviewed' },
];

const SERVICE_MODE_OPTIONS = [
  { id: 'incall', label: 'In-Call' },
  { id: 'outcall', label: 'Out-Call' },
  { id: 'travel', label: 'Travel' },
];

const DEFAULT_LEGACY_FILTERS: FilterState = {
  availability: [],
  travelStatus: [],
  verification: [],
  priceRange: [20, 500],
  rating: null,
  hasPhotos: false,
  serviceModes: [],
};

const EXPLORE_FILTER_OPTIONS: Array<{ key: keyof Pick<ExploreFilters, 'available' | 'verified' | 'featured' | 'offers' | 'incall' | 'outcall'>; label: string }> = [
  { key: 'available', label: 'Available Now' },
  { key: 'verified', label: 'Active' },
  { key: 'featured', label: 'Featured' },
  { key: 'offers', label: 'Offers' },
  { key: 'incall', label: 'In-Call' },
  { key: 'outcall', label: 'Out-Call' },
];

function toggleArrayValue(values: string[], id: string) {
  return values.includes(id) ? values.filter((item) => item !== id) : [...values, id];
}

function InlineExploreFilters({
  filters,
  onFilterChange,
}: {
  filters: ExploreFilters;
  onFilterChange: (filters: ExploreFilters) => void;
}) {
  const activeFilterCount = EXPLORE_FILTER_OPTIONS.reduce(
    (total, option) => total + (filters[option.key] ? 1 : 0),
    0,
  );

  return (
    <div className="space-y-6 rounded-[28px] border border-border-subtle bg-white/82 p-5 shadow-[inset_0_1px_0_rgb(255_255_255/_0.92)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Advanced Filters</p>
          <h3 className="mt-1 text-lg font-semibold text-text-primary">Refine your match</h3>
        </div>
        {activeFilterCount > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onFilterChange({
                ...filters,
                available: false,
                verified: false,
                featured: false,
                offers: false,
                incall: false,
                outcall: false,
              })
            }
            className="text-brand-secondary hover:text-brand-primary"
          >
            Clear
          </Button>
        ) : null}
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted">Radius</h4>
          <span className="text-sm font-semibold text-brand-secondary">{filters.radius} mi</span>
        </div>
        <div className="mt-4">
          <Slider
            value={[filters.radius]}
            min={5}
            max={100}
            step={5}
            onValueChange={(value) => onFilterChange({ ...filters, radius: value[0] ?? filters.radius })}
          />
        </div>
      </section>

      <section className="grid gap-3">
        {EXPLORE_FILTER_OPTIONS.map((option) => (
          <label
            key={option.key}
            className="flex items-center justify-between rounded-[20px] border border-border-subtle bg-white/78 px-4 py-3 text-sm text-text-secondary shadow-[inset_0_1px_0_rgb(255_255_255/_0.92)]"
          >
            <span>{option.label}</span>
            <Checkbox
              checked={filters[option.key]}
              onCheckedChange={(checked) => onFilterChange({ ...filters, [option.key]: Boolean(checked) })}
            />
          </label>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted">Starting Price</h4>
          <span className="text-sm font-semibold text-brand-secondary">
            ${filters.priceMin} - ${filters.priceMax}
          </span>
        </div>
        <div className="mt-4">
          <Slider
            value={[filters.priceMin, filters.priceMax]}
            min={0}
            max={300}
            step={5}
            onValueChange={(value) =>
              onFilterChange({
                ...filters,
                priceMin: Math.min(value[0] ?? 0, value[1] ?? 300),
                priceMax: Math.max(value[0] ?? 0, value[1] ?? 300),
              })
            }
          />
        </div>
      </section>
    </div>
  );
}

export function AdvancedFiltersPanel({
  filters: exploreFilters,
  onFilterChange,
  isOpen = false,
  onClose = () => undefined,
  onApplyFilters = () => undefined,
  defaultFilters,
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters || DEFAULT_LEGACY_FILTERS);

  if (exploreFilters && onFilterChange) {
    return <InlineExploreFilters filters={exploreFilters} onFilterChange={onFilterChange} />;
  }

  const handleReset = () => {
    setFilters(DEFAULT_LEGACY_FILTERS);
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const activeFilterCount =
    filters.availability.length +
    filters.travelStatus.length +
    filters.verification.length +
    filters.serviceModes.length +
    (filters.rating ? 1 : 0) +
    (filters.hasPhotos ? 1 : 0);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:w-96">
        <SheetHeader>
          <div className="flex w-full items-center justify-between">
            <SheetTitle>Advanced Filters</SheetTitle>
            {activeFilterCount > 0 ? (
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-orange-600 hover:text-orange-700">
                Clear All
              </Button>
            ) : null}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="mb-3 font-semibold text-slate-900">Availability</h3>
            <div className="space-y-2">
              {AVAILABILITY_OPTIONS.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-center gap-3">
                  <Checkbox
                    checked={filters.availability.includes(option.id)}
                    onCheckedChange={() =>
                      setFilters((prev) => ({ ...prev, availability: toggleArrayValue(prev.availability, option.id) }))
                    }
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-slate-900">Travel Status</h3>
            <div className="space-y-2">
              {TRAVEL_OPTIONS.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-center gap-3">
                  <Checkbox
                    checked={filters.travelStatus.includes(option.id)}
                    onCheckedChange={() =>
                      setFilters((prev) => ({ ...prev, travelStatus: toggleArrayValue(prev.travelStatus, option.id) }))
                    }
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-slate-900">Verification</h3>
            <div className="space-y-2">
              {VERIFICATION_OPTIONS.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-center gap-3">
                  <Checkbox
                    checked={filters.verification.includes(option.id)}
                    onCheckedChange={() =>
                      setFilters((prev) => ({ ...prev, verification: toggleArrayValue(prev.verification, option.id) }))
                    }
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-slate-900">Service Mode</h3>
            <div className="space-y-2">
              {SERVICE_MODE_OPTIONS.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-center gap-3">
                  <Checkbox
                    checked={filters.serviceModes.includes(option.id)}
                    onCheckedChange={() =>
                      setFilters((prev) => ({ ...prev, serviceModes: toggleArrayValue(prev.serviceModes, option.id) }))
                    }
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-slate-900">
              Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </h3>
            <Slider
              min={0}
              max={500}
              step={5}
              value={filters.priceRange}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, priceRange: [value[0] ?? 0, value[1] ?? 500] }))
              }
              className="w-full"
            />
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-slate-900">Minimum Rating</h3>
            <div className="flex gap-2">
              {[null, 3, 4, 4.5, 5].map((rating) => (
                <Button
                  key={rating === null ? 'all' : rating}
                  variant={filters.rating === rating ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters((prev) => ({ ...prev, rating }))}
                  className={filters.rating === rating ? 'bg-orange-600' : ''}
                >
                  {rating === null ? (
                    'All'
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      {rating}
                      <Star className="h-3.5 w-3.5 fill-current" />
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex cursor-pointer items-center gap-3">
              <Checkbox
                checked={filters.hasPhotos}
                onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, hasPhotos: Boolean(checked) }))}
              />
              <span className="text-sm text-slate-700">Has at least 3 photos</span>
            </label>
          </div>
        </div>

        <div className="mt-8 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleApply} className="flex-1 bg-orange-600 hover:bg-orange-700">
            Apply Filters
            {activeFilterCount > 0 ? (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-orange-600">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
