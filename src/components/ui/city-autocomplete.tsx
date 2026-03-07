import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const SUPPORTED_CITIES = [
  "Los Angeles", "New York", "Miami", "San Francisco", "Chicago", "Seattle",
  "Houston", "Dallas", "Austin", "San Diego", "Phoenix", "Denver",
  "Las Vegas", "Atlanta", "Boston", "Portland", "Nashville", "Orlando",
  "Tampa", "Charlotte", "Minneapolis", "San Antonio", "Philadelphia",
  "Washington DC", "Detroit", "Salt Lake City", "Honolulu", "New Orleans",
];

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CityAutocomplete = ({
  value,
  onChange,
  placeholder = "Start typing a city...",
  className,
}: CityAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length > 0) {
      const q = value.toLowerCase();
      setFiltered(SUPPORTED_CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 8));
    } else {
      setFiltered(SUPPORTED_CITIES.slice(0, 8));
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
              key={city}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 transition-colors"
              onClick={() => {
                onChange(city);
                setOpen(false);
              }}
            >
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
