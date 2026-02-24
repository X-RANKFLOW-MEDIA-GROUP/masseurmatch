import { useState, useRef, useEffect } from "react";
import { MapPin, Navigation, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Zipcode → city mapping for common US zips
const ZIP_TO_CITY: Record<string, string> = {
  "90001": "Los Angeles", "90002": "Los Angeles", "90003": "Los Angeles", "90004": "Los Angeles", "90005": "Los Angeles",
  "90006": "Los Angeles", "90007": "Los Angeles", "90008": "Los Angeles", "90010": "Los Angeles", "90012": "Los Angeles",
  "90013": "Los Angeles", "90015": "Los Angeles", "90017": "Los Angeles", "90019": "Los Angeles", "90020": "Los Angeles",
  "90024": "Los Angeles", "90025": "Los Angeles", "90028": "Los Angeles", "90034": "Los Angeles", "90036": "Los Angeles",
  "90038": "Los Angeles", "90046": "Los Angeles", "90048": "Los Angeles", "90049": "Los Angeles", "90064": "Los Angeles",
  "90069": "Los Angeles", "90077": "Los Angeles", "90210": "Los Angeles", "90291": "Los Angeles", "90292": "Los Angeles",
  "90401": "Los Angeles", "90402": "Los Angeles", "91601": "Los Angeles", "91602": "Los Angeles",
  "10001": "New York", "10002": "New York", "10003": "New York", "10004": "New York", "10005": "New York",
  "10006": "New York", "10007": "New York", "10010": "New York", "10011": "New York", "10012": "New York",
  "10013": "New York", "10014": "New York", "10016": "New York", "10017": "New York", "10018": "New York",
  "10019": "New York", "10020": "New York", "10021": "New York", "10022": "New York", "10023": "New York",
  "10024": "New York", "10025": "New York", "10026": "New York", "10027": "New York", "10028": "New York",
  "10029": "New York", "10030": "New York", "10031": "New York", "10032": "New York", "10033": "New York",
  "10034": "New York", "10035": "New York", "10036": "New York", "10037": "New York", "10038": "New York",
  "10128": "New York", "11201": "New York", "11211": "New York", "11215": "New York", "11217": "New York",
  "33101": "Miami", "33109": "Miami", "33125": "Miami", "33126": "Miami", "33127": "Miami",
  "33128": "Miami", "33129": "Miami", "33130": "Miami", "33131": "Miami", "33132": "Miami",
  "33133": "Miami", "33134": "Miami", "33135": "Miami", "33136": "Miami", "33137": "Miami",
  "33138": "Miami", "33139": "Miami", "33140": "Miami", "33141": "Miami", "33142": "Miami",
  "94102": "San Francisco", "94103": "San Francisco", "94104": "San Francisco", "94105": "San Francisco",
  "94107": "San Francisco", "94108": "San Francisco", "94109": "San Francisco", "94110": "San Francisco",
  "94111": "San Francisco", "94112": "San Francisco", "94114": "San Francisco", "94115": "San Francisco",
  "94116": "San Francisco", "94117": "San Francisco", "94118": "San Francisco", "94121": "San Francisco",
  "94122": "San Francisco", "94123": "San Francisco", "94124": "San Francisco", "94127": "San Francisco",
  "94131": "San Francisco", "94132": "San Francisco", "94133": "San Francisco", "94134": "San Francisco",
  "60601": "Chicago", "60602": "Chicago", "60603": "Chicago", "60604": "Chicago", "60605": "Chicago",
  "60606": "Chicago", "60607": "Chicago", "60608": "Chicago", "60609": "Chicago", "60610": "Chicago",
  "60611": "Chicago", "60612": "Chicago", "60613": "Chicago", "60614": "Chicago", "60615": "Chicago",
  "60616": "Chicago", "60617": "Chicago", "60618": "Chicago", "60619": "Chicago", "60620": "Chicago",
  "60621": "Chicago", "60622": "Chicago", "60623": "Chicago", "60624": "Chicago", "60625": "Chicago",
  "60626": "Chicago", "60628": "Chicago", "60629": "Chicago", "60630": "Chicago", "60631": "Chicago",
  "98101": "Seattle", "98102": "Seattle", "98103": "Seattle", "98104": "Seattle", "98105": "Seattle",
  "98106": "Seattle", "98107": "Seattle", "98108": "Seattle", "98109": "Seattle", "98112": "Seattle",
  "98115": "Seattle", "98116": "Seattle", "98117": "Seattle", "98118": "Seattle", "98119": "Seattle",
  "98121": "Seattle", "98122": "Seattle", "98125": "Seattle", "98126": "Seattle", "98133": "Seattle",
  "98134": "Seattle", "98136": "Seattle", "98144": "Seattle", "98199": "Seattle",
};

// Reverse geocode coords to nearest city
const CITY_COORDS: { city: string; lat: number; lng: number }[] = [
  { city: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { city: "New York", lat: 40.7128, lng: -74.006 },
  { city: "Miami", lat: 25.7617, lng: -80.1918 },
  { city: "San Francisco", lat: 37.7749, lng: -122.4194 },
  { city: "Chicago", lat: 41.8781, lng: -87.6298 },
  { city: "Seattle", lat: 47.6062, lng: -122.3321 },
];

function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestCity(lat: number, lng: number): string | null {
  let closest: { city: string; dist: number } | null = null;
  for (const c of CITY_COORDS) {
    const d = distanceMiles(lat, lng, c.lat, c.lng);
    if (!closest || d < closest.dist) closest = { city: c.city, dist: d };
  }
  return closest && closest.dist < 100 ? closest.city : null;
}

function resolveLocation(input: string, availableCities: string[]): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Check if it's a zipcode
  if (/^\d{5}$/.test(trimmed)) {
    const city = ZIP_TO_CITY[trimmed];
    if (city) return city;
    return null;
  }

  // Try exact city match (case-insensitive)
  const match = availableCities.find(
    (c) => c.toLowerCase() === trimmed.toLowerCase()
  );
  if (match) return match;

  // Partial match
  const partial = availableCities.find(
    (c) => c.toLowerCase().includes(trimmed.toLowerCase()) || trimmed.toLowerCase().includes(c.toLowerCase())
  );
  return partial || null;
}

interface LocationPickerProps {
  availableCities: string[];
  selectedCity: string;
  onCityChange: (city: string) => void;
}

export function LocationPicker({ availableCities, selectedCity, onCityChange }: LocationPickerProps) {
  const [locationInput, setLocationInput] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [detectedCity, setDetectedCity] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = selectedCity === "all"
    ? ""
    : availableCities.find(c => c.toLowerCase().replace(/\s/g, "-") === selectedCity) || detectedCity || "";

  useEffect(() => {
    if (displayValue) setLocationInput(displayValue);
  }, [displayValue]);

  const handleGeolocate = async () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported");
      return;
    }

    setGeoLoading(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const city = nearestCity(pos.coords.latitude, pos.coords.longitude);
        setGeoLoading(false);
        if (city) {
          setDetectedCity(city);
          setLocationInput(city);
          onCityChange(city.toLowerCase().replace(/\s/g, "-"));
          setOpen(false);
        } else {
          setGeoError("No therapists found near your location yet");
        }
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location access denied. Enter manually.");
        } else {
          setGeoError("Unable to detect location. Enter manually.");
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const handleSubmitLocation = () => {
    const resolved = resolveLocation(locationInput, availableCities);
    if (resolved) {
      setDetectedCity(resolved);
      setLocationInput(resolved);
      onCityChange(resolved.toLowerCase().replace(/\s/g, "-"));
      setGeoError("");
      setOpen(false);
    } else if (locationInput.trim()) {
      setGeoError(`No therapists found for "${locationInput}". Try a major city.`);
    }
  };

  const handleClear = () => {
    setLocationInput("");
    setDetectedCity("");
    setGeoError("");
    onCityChange("all");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmitLocation();
    }
  };

  // Filter city suggestions
  const suggestions = locationInput.trim().length >= 2
    ? availableCities.filter(c =>
        c.toLowerCase().includes(locationInput.toLowerCase()) &&
        c.toLowerCase() !== locationInput.toLowerCase()
      )
    : [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 w-full h-9 px-3 rounded-md border border-border bg-secondary text-sm text-left transition-colors hover:bg-secondary/80"
          onClick={() => setOpen(true)}
        >
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className={`flex-1 truncate ${displayValue ? "text-foreground" : "text-muted-foreground"}`}>
            {displayValue || "City, zip, or use GPS"}
          </span>
          {selectedCity !== "all" && (
            <X
              className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 space-y-3">
          {/* GPS button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 justify-start"
            onClick={handleGeolocate}
            disabled={geoLoading}
          >
            {geoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {geoLoading ? "Detecting location..." : "Use my current location"}
          </Button>

          {/* Manual input */}
          <div className="relative">
            <Input
              ref={inputRef}
              placeholder="Enter city, zipcode, or address"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setGeoError("");
              }}
              onKeyDown={handleKeyDown}
              className="bg-background border-border pr-16"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs px-2"
              onClick={handleSubmitLocation}
            >
              Search
            </Button>
          </div>

          {/* Error */}
          {geoError && (
            <p className="text-xs text-destructive">{geoError}</p>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-t border-border pt-2">
              <p className="text-xs text-muted-foreground mb-1.5">Suggestions</p>
              {suggestions.map((city) => (
                <button
                  key={city}
                  className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-secondary transition-colors flex items-center gap-2"
                  onClick={() => {
                    setLocationInput(city);
                    setDetectedCity(city);
                    onCityChange(city.toLowerCase().replace(/\s/g, "-"));
                    setGeoError("");
                    setOpen(false);
                  }}
                >
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  {city}
                </button>
              ))}
            </div>
          )}

          {/* Quick city links */}
          {!locationInput.trim() && availableCities.length > 0 && (
            <div className="border-t border-border pt-2">
              <p className="text-xs text-muted-foreground mb-1.5">Popular cities</p>
              <div className="flex flex-wrap gap-1.5">
                {availableCities.slice(0, 8).map((city) => (
                  <button
                    key={city}
                    className="px-2.5 py-1 text-xs rounded-full border border-border hover:bg-secondary transition-colors"
                    onClick={() => {
                      setLocationInput(city);
                      setDetectedCity(city);
                      onCityChange(city.toLowerCase().replace(/\s/g, "-"));
                      setOpen(false);
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
