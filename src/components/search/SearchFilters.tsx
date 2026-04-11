"use client";

import { useMemo } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export type AdvancedSearchState = {
  query: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  radiusMiles: number;
  verifiedOnly: boolean;
  specialties: string[];
  languages: string[];
};

type SearchFiltersProps = {
  value: AdvancedSearchState;
  onChange: (next: AdvancedSearchState) => void;
};

const SPECIALTY_OPTIONS = ["Deep Tissue", "Sports", "Swedish", "Thai", "Relaxation", "Lymphatic"];
const LANGUAGE_OPTIONS = ["English", "Spanish", "Portuguese", "French", "Italian"];

export function SearchFilters({ value, onChange }: SearchFiltersProps) {
  const priceLabel = useMemo(() => `$${value.minPrice} - $${value.maxPrice >= 200 ? "200+" : value.maxPrice}`, [value]);

  const toggleArray = (key: "specialties" | "languages", option: string) => {
    const hasOption = value[key].includes(option);
    const next = hasOption ? value[key].filter((entry) => entry !== option) : [...value[key], option];
    onChange({ ...value, [key]: next });
  };

  return (
    <section className="space-y-6 rounded-2xl border border-border bg-card p-5">
      <div className="space-y-2">
        <Label htmlFor="query">Keyword search</Label>
        <Input
          id="query"
          placeholder="Technique, neighborhood, or therapist"
          value={value.query}
          onChange={(event) => onChange({ ...value, query: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Price range ({priceLabel})</Label>
        <Slider
          value={[value.minPrice, value.maxPrice]}
          min={30}
          max={220}
          step={5}
          onValueChange={(range) => {
            const [minPrice = 30, maxPrice = 200] = range;
            onChange({ ...value, minPrice, maxPrice });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="minRating">Minimum rating</Label>
        <Input
          id="minRating"
          type="number"
          min={0}
          max={5}
          step={0.5}
          value={value.minRating}
          onChange={(event) => onChange({ ...value, minRating: Number(event.target.value || 0) })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="radiusMiles">Location radius (miles)</Label>
        <Input
          id="radiusMiles"
          type="number"
          min={1}
          max={100}
          value={value.radiusMiles}
          onChange={(event) => onChange({ ...value, radiusMiles: Number(event.target.value || 25) })}
        />
      </div>

      <div className="space-y-3">
        <Label>Specialties</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {SPECIALTY_OPTIONS.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={value.specialties.includes(option)}
                onCheckedChange={() => toggleArray("specialties", option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Languages</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {LANGUAGE_OPTIONS.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <Checkbox checked={value.languages.includes(option)} onCheckedChange={() => toggleArray("languages", option)} />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={value.verifiedOnly}
          onCheckedChange={(checked) => onChange({ ...value, verifiedOnly: checked === true })}
        />
        <span>Verified therapists only</span>
      </label>
    </section>
  );
}
