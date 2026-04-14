'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  defaultFilters?: FilterState;
}

export interface FilterState {
  availability: string[];
  travelStatus: string[];
  verification: string[];
  priceRange: [number, number];
  rating: number | null;
  hasPhotos: boolean;
  serviceModes: string[];
}

const AVAILABILITY_OPTIONS = [
  { id: 'available_now', label: 'Available Now' },
  { id: 'open_soon', label: 'Open Soon (Next 24hrs)' },
  { id: 'fully_booked', label: 'Fully Booked' }
];

const TRAVEL_OPTIONS = [
  { id: 'in_clinic', label: 'In-Clinic' },
  { id: 'traveling', label: 'Traveling' },
  { id: 'visiting', label: 'Visiting Clients' }
];

const VERIFICATION_OPTIONS = [
  { id: 'verified', label: 'Verified', icon: '✓' },
  { id: 'pending', label: 'Pending Verification' },
  { id: 'unverified', label: 'Unverified' }
];

const SERVICE_MODE_OPTIONS = [
  { id: 'incall', label: 'In-Call' },
  { id: 'outcall', label: 'Out-Call' },
  { id: 'travel', label: 'Travel' }
];

export function AdvancedFiltersPanel({
  isOpen,
  onClose,
  onApplyFilters,
  defaultFilters
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(
    defaultFilters || {
      availability: [],
      travelStatus: [],
      verification: [],
      priceRange: [20, 500],
      rating: null,
      hasPhotos: false,
      serviceModes: []
    }
  );

  const handleAvailabilityToggle = (id: string) => {
    setFilters(prev => ({
      ...prev,
      availability: prev.availability.includes(id)
        ? prev.availability.filter(item => item !== id)
        : [...prev.availability, id]
    }));
  };

  const handleTravelToggle = (id: string) => {
    setFilters(prev => ({
      ...prev,
      travelStatus: prev.travelStatus.includes(id)
        ? prev.travelStatus.filter(item => item !== id)
        : [...prev.travelStatus, id]
    }));
  };

  const handleVerificationToggle = (id: string) => {
    setFilters(prev => ({
      ...prev,
      verification: prev.verification.includes(id)
        ? prev.verification.filter(item => item !== id)
        : [...prev.verification, id]
    }));
  };

  const handleServiceModeToggle = (id: string) => {
    setFilters(prev => ({
      ...prev,
      serviceModes: prev.serviceModes.includes(id)
        ? prev.serviceModes.filter(item => item !== id)
        : [...prev.serviceModes, id]
    }));
  };

  const handlePriceChange = (value: [number, number]) => {
    setFilters(prev => ({ ...prev, priceRange: value }));
  };

  const handleRatingChange = (rating: number | null) => {
    setFilters(prev => ({ ...prev, rating }));
  };

  const handleReset = () => {
    setFilters({
      availability: [],
      travelStatus: [],
      verification: [],
      priceRange: [20, 500],
      rating: null,
      hasPhotos: false,
      serviceModes: []
    });
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between w-full">
            <SheetTitle>Advanced Filters</SheetTitle>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-orange-600 hover:text-orange-700"
              >
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Availability */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Availability</h3>
            <div className="space-y-2">
              {AVAILABILITY_OPTIONS.map(option => (
                <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={filters.availability.includes(option.id)}
                    onChange={() => handleAvailabilityToggle(option.id)}
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Travel Status */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Travel Status</h3>
            <div className="space-y-2">
              {TRAVEL_OPTIONS.map(option => (
                <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={filters.travelStatus.includes(option.id)}
                    onChange={() => handleTravelToggle(option.id)}
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Verification Status */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Verification</h3>
            <div className="space-y-2">
              {VERIFICATION_OPTIONS.map(option => (
                <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={filters.verification.includes(option.id)}
                    onChange={() => handleVerificationToggle(option.id)}
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Service Mode */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Service Mode</h3>
            <div className="space-y-2">
              {SERVICE_MODE_OPTIONS.map(option => (
                <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={filters.serviceModes.includes(option.id)}
                    onChange={() => handleServiceModeToggle(option.id)}
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">
              Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </h3>
            <Slider
              min={0}
              max={500}
              step={5}
              value={filters.priceRange}
              onValueChange={handlePriceChange}
              className="w-full"
            />
          </div>

          {/* Minimum Rating */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Minimum Rating</h3>
            <div className="flex gap-2">
              {[null, 3, 4, 4.5, 5].map(rating => (
                <Button
                  key={rating === null ? 'all' : rating}
                  variant={filters.rating === rating ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRatingChange(rating)}
                  className={filters.rating === rating ? 'bg-orange-600' : ''}
                >
                  {rating === null ? 'All' : `${rating}★`}
                </Button>
              ))}
            </div>
          </div>

          {/* Has Photos */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={filters.hasPhotos}
                onChange={() => setFilters(prev => ({ ...prev, hasPhotos: !prev.hasPhotos }))}
              />
              <span className="text-sm text-slate-700">Has at least 3 photos</span>
            </label>
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex gap-2 mt-8">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            Apply Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-orange-600 text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
