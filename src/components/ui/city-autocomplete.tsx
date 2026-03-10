import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { US_CITIES } from "@/data/cities";

interface CityOption {
  name: string;
  stateCode: string;
  label: string;
}

const CITY_OPTIONS: CityOption[] = US_CITIES.map((c) => ({
  name: c.name,
  stateCode: c.stateCode,
  label: `${c.name}, ${c.stateCode}`,
}));

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onCitySelect?: (city: { name: string; stateCode: string }) => void;
  placeholder?: string;
  className?: string;
}

export const CityAutocomplete = ({
  value,
  onChange,
  onCitySelect,
  placeholder = "Start typing a city...",
  className,
}: CityAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<CityOption[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length > 0) {
      const q = value.toLowerCase();
      setFiltered(CITY_OPTIONS.filter((c) => c.label.toLowerCase().includes(q)).slice(0, 10));
    } else {
      setFiltered(CITY_OPTIONS.slice(0, 10));
    }
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-md border border-border bg-popover shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((city) => (
            <button
              key={city.label}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 transition-colors"
              onClick={() => {
                onChange(city.name);
                onCitySelect?.({ name: city.name, stateCode: city.stateCode });
                setOpen(false);
              }}
            >
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
              {city.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
