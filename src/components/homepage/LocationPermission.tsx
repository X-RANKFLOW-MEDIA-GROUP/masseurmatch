import { MapPin, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

type LocationPermissionProps = {
  onAllowLocation: () => void;
  onSearchManually: () => void;
  visible: boolean;
};

export function LocationPermission({
  onAllowLocation,
  onSearchManually,
  visible,
}: LocationPermissionProps) {
  if (!visible) return null;

  return (
    <section className="page-shell py-6">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-[28px] border border-border-subtle bg-white/80 p-6 text-center shadow-[0_12px_30px_rgb(var(--color-brand-primary-rgb)/0.05)] backdrop-blur-lg sm:flex-row sm:text-left">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-brand-primary/10">
          <MapPin className="h-5 w-5 text-brand-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-brand-primary">
            Enable location for better results
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Allow GPS access to see therapists near you, or search by city.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onAllowLocation}
            variant="default"
            size="sm"
            className="rounded-full px-5"
          >
            <MapPin className="mr-1.5 h-3.5 w-3.5" />
            Allow location
          </Button>
          <Button
            onClick={onSearchManually}
            variant="outline"
            size="sm"
            className="rounded-full px-5"
          >
            <Search className="mr-1.5 h-3.5 w-3.5" />
            Search manually
          </Button>
        </div>
      </div>
    </section>
  );
}
