"use client";

import { useMemo } from "react";

import { US_CITIES } from "@/data/cities";
import { Input } from "@/components/ui/input";

type CityAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function CityAutocomplete({ value, onChange, placeholder = "City", className }: CityAutocompleteProps) {
  const options = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return US_CITIES.slice(0, 8).map((city) => city.name);
    return US_CITIES.filter((city) => city.name.toLowerCase().includes(q)).slice(0, 8).map((city) => city.name);
  }, [value]);

  return (
    <div className={className}>
      <Input list="city-autocomplete-options" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      <datalist id="city-autocomplete-options">
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </div>
  );
}
