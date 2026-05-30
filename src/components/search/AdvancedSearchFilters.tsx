"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X, Star, DollarSign, Clock, MapPin, Award } from "lucide-react";

export type SearchFilters = {
  priceMin: number;
  priceMax: number;
  specialties: string[];
  minRating: number;
  verifiedOnly: boolean;
  availableNow: boolean;
  serviceMode: "all" | "in-person" | "mobile" | "virtual";
  distance: number;
  sortBy: "relevance" | "rating" | "price-low" | "price-high" | "distance";
};

const SPECIALTIES = [
  "Deep Tissue",
  "Swedish",
  "Sports Massage",
  "Thai Massage",
  "Hot Stone",
  "Prenatal",
  "Lymphatic Drainage",
  "Trigger Point",
  "Myofascial Release",
  "Reflexology",
  "Shiatsu",
  "Aromatherapy",
  "Couples Massage",
  "CBD Massage",
  "Cupping",
];

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onClear: () => void;
}

export function AdvancedSearchFilters({ filters, onChange, onClear }: AdvancedSearchFiltersProps) {
  const [open, setOpen] = useState(false);

  const activeFilterCount = [
    filters.priceMin > 0 || filters.priceMax < 500,
    filters.specialties.length > 0,
    filters.minRating > 0,
    filters.verifiedOnly,
    filters.availableNow,
    filters.serviceMode !== "all",
    filters.distance < 50,
  ].filter(Boolean).length;

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleSpecialty = (specialty: string) => {
    const current = filters.specialties;
    const updated = current.includes(specialty)
      ? current.filter((s) => s !== specialty)
      : [...current, specialty];
    updateFilter("specialties", updated);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Quick Filters */}
      <Select
        value={filters.sortBy}
        onValueChange={(value) => updateFilter("sortBy", value as SearchFilters["sortBy"])}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="relevance">Relevance</SelectItem>
          <SelectItem value="rating">Highest Rated</SelectItem>
          <SelectItem value="price-low">Price: Low to High</SelectItem>
          <SelectItem value="price-high">Price: High to Low</SelectItem>
          <SelectItem value="distance">Nearest</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant={filters.verifiedOnly ? "default" : "outline"}
        size="sm"
        onClick={() => updateFilter("verifiedOnly", !filters.verifiedOnly)}
        className="gap-1"
      >
        <Award className="h-3.5 w-3.5" />
        Active
      </Button>

      <Button
        variant={filters.availableNow ? "default" : "outline"}
        size="sm"
        onClick={() => updateFilter("availableNow", !filters.availableNow)}
        className="gap-1"
      >
        <Clock className="h-3.5 w-3.5" />
        Available Now
      </Button>

      {/* Advanced Filters Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filter Therapists</SheetTitle>
            <SheetDescription>Refine your search to find the perfect match</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <Accordion type="multiple" defaultValue={["price", "specialties", "rating"]} className="w-full">
              {/* Price Range */}
              <AccordionItem value="price">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Price Range
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-slate-500">Min</Label>
                      <Input
                        type="number"
                        value={filters.priceMin}
                        onChange={(e) => updateFilter("priceMin", Number(e.target.value))}
                        className="mt-1"
                        min={0}
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-slate-500">Max</Label>
                      <Input
                        type="number"
                        value={filters.priceMax}
                        onChange={(e) => updateFilter("priceMax", Number(e.target.value))}
                        className="mt-1"
                        min={0}
                      />
                    </div>
                  </div>
                  <Slider
                    value={[filters.priceMin, filters.priceMax]}
                    onValueChange={([min, max]) => {
                      updateFilter("priceMin", min);
                      updateFilter("priceMax", max);
                    }}
                    min={0}
                    max={500}
                    step={10}
                  />
                  <p className="text-center text-sm text-slate-500">
                    ${filters.priceMin} - ${filters.priceMax}/hr
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Specialties */}
              <AccordionItem value="specialties">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Specialties
                    {filters.specialties.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {filters.specialties.length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map((specialty) => (
                      <Button
                        key={specialty}
                        variant={filters.specialties.includes(specialty) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSpecialty(specialty)}
                        className="h-7 text-xs"
                      >
                        {specialty}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Rating */}
              <AccordionItem value="rating">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Minimum Rating
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="flex gap-2">
                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                      <Button
                        key={rating}
                        variant={filters.minRating === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter("minRating", rating)}
                        className="flex-1"
                      >
                        {rating === 0 ? "Any" : `${rating}+`}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Service Mode */}
              <AccordionItem value="service">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Service Type
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "All Types" },
                      { value: "in-person", label: "In-Person (Studio)" },
                      { value: "mobile", label: "Mobile (Outcall)" },
                      { value: "virtual", label: "Virtual Sessions" },
                    ].map((option) => (
                      <div key={option.value} className="flex items-center gap-2">
                        <Checkbox
                          id={option.value}
                          checked={filters.serviceMode === option.value}
                          onCheckedChange={() =>
                            updateFilter("serviceMode", option.value as SearchFilters["serviceMode"])
                          }
                        />
                        <Label htmlFor={option.value} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Distance */}
              <AccordionItem value="distance">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Distance
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <Slider
                    value={[filters.distance]}
                    onValueChange={([value]) => updateFilter("distance", value)}
                    min={1}
                    max={50}
                    step={1}
                  />
                  <p className="text-center text-sm text-slate-500">
                    Within {filters.distance} miles
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Actions */}
            <div className="flex gap-2 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
                className="flex-1"
              >
                Clear All
              </Button>
              <Button onClick={() => setOpen(false)} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Filter Badges */}
      {filters.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.specialties.map((specialty) => (
            <Badge key={specialty} variant="secondary" className="gap-1">
              {specialty}
              <button onClick={() => toggleSpecialty(specialty)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClear} className="text-slate-500">
          Clear all
        </Button>
      )}
    </div>
  );
}

export const defaultFilters: SearchFilters = {
  priceMin: 0,
  priceMax: 500,
  specialties: [],
  minRating: 0,
  verifiedOnly: false,
  availableNow: false,
  serviceMode: "all",
  distance: 50,
  sortBy: "relevance",
};
