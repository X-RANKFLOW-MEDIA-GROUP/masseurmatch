"use client";

import { useId, useMemo } from "react";

import { US_CITIES } from "@/data/cities";
import { Input } from "@/components/ui/input";

type CityAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onCitySelect?: (city: { name: string; stateCode: string }) => void;
  placeholder?: string;
  className?: string;
};

export function CityAutocomplete({ value, onChange, onCitySelect, placeholder = "Search city...", className }: CityAutocompleteProps) {
  const listId = useId();

  const options = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return US_CITIES.slice(0, 20);
    return US_CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(q) ||
        city.stateCode.toLowerCase() === q ||
        `${city.name}, ${city.stateCode}`.toLowerCase().includes(q),
    ).slice(0, 20);
  }, [value]);

  return (
    <div className={className}>
      <Input
        list={listId}
        value={value}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw);
          const match = US_CITIES.find(
            (c) => `${c.name}, ${c.stateCode}` === raw,
          );
          if (match && onCitySelect) {
            onCitySelect({ name: match.name, stateCode: match.stateCode });
          }
        }}
        placeholder={placeholder}
      />
      <datalist id={listId}>
        {options.map((city) => (
          <option key={`${city.slug}-${city.stateCode}`} value={`${city.name}, ${city.stateCode}`} />
        ))}
      </datalist>
    </div>
  );
}
