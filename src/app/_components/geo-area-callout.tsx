"use client";

import { useRouter } from "next/navigation";
import { LocateFixed, MapPin } from "lucide-react";

import { withSearchParams } from "@/app/_lib/request";
import { Button } from "@/components/ui/button";
import { type CityData } from "@/data/cities";
import { useGeolocation } from "@/hooks/useGeolocation";
import { cn } from "@/lib/utils";

type GeoAreaCalloutProps = {
  className?: string;
  navigateToSearch?: boolean;
  onResolved?: (city: CityData) => void;
  source?: string;
  tone?: "default" | "inverse";
  compact?: boolean;
};

export function GeoAreaCallout({
  className,
  navigateToSearch = false,
  onResolved,
  source = "geolocation",
  tone = "default",
  compact = false,
}: GeoAreaCalloutProps) {
  const router = useRouter();
  const { city, loading, error, requestLocation, status } = useGeolocation({ autoLocate: true });

  const isInverse = tone === "inverse";
  const cityLabel = city ? `${city.name}, ${city.stateCode}` : null;

  const message = cityLabel
    ? `Location ready: ${cityLabel}.`
    : loading
      ? "Checking whether we already know your area..."
      : error
        ? error
        : "Use your location to start closer to your area.";

  const handleApply = async () => {
    const resolvedCity = city || (await requestLocation(true));

    if (!resolvedCity) {
      return;
    }

    onResolved?.(resolvedCity);

    if (navigateToSearch) {
      router.push(
        withSearchParams("/search", {
          city: resolvedCity.name,
          source,
        }),
      );
    }
  };

  return (
    <div
      className={cn(
        "rounded-[24px] border p-4 backdrop-blur-xl sm:p-5",
        isInverse
          ? "border-white/12 bg-white/[0.06] text-white shadow-[0_24px_60px_rgba(0,0,0,0.16)]"
          : "border-border-subtle bg-white/92 text-foreground shadow-[0_18px_40px_rgb(var(--color-brand-primary-rgb)/0.06)]",
        className,
      )}
    >
      <div className={cn("flex gap-3", compact ? "items-center justify-between" : "items-start justify-between")}>
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
              isInverse ? "border-white/12 bg-white/10 text-brand-soft" : "border-border bg-bg-subtle text-brand-secondary",
            )}
          >
            {city ? <MapPin className="h-5 w-5" /> : <LocateFixed className="h-5 w-5" />}
          </div>

          <div>
            <p className={cn("text-xs font-semibold uppercase tracking-[0.22em]", isInverse ? "text-white/55" : "text-text-muted")}>
              Nearby search
            </p>
            <p className={cn("mt-1 text-sm leading-6", isInverse ? "text-white/78" : "text-text-secondary")}>{message}</p>
          </div>
        </div>

        <Button
          type="button"
          variant={isInverse ? "glass" : city ? "secondary" : "outline"}
          className={cn("shrink-0 rounded-full px-5", compact ? "h-11" : "h-12")}
          disabled={status === "unsupported" || loading}
          onClick={() => void handleApply()}
        >
          {city ? `Use ${city.name}` : loading ? "Locating..." : "Use my location"}
        </Button>
      </div>
    </div>
  );
}
