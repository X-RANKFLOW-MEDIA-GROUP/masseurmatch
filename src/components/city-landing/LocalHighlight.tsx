import { MapPinned } from "lucide-react";
import type { City } from "@/data/provider-cities";

type LocalHighlightProps = {
  city: City;
};

/**
 * Dynamic local-presence band. Title interpolates the city name; copy stays
 * generic and makes no promises about results or guarantees.
 */
export function LocalHighlight({ city }: LocalHighlightProps) {
  return (
    <section aria-labelledby="local-highlight-heading" className="bg-[#111111]">
      <div className="page-shell py-20 sm:py-24">
        <div className="mx-auto max-w-3xl text-center text-white">
          <span className="inline-flex items-center justify-center rounded-2xl bg-white/10 p-3 text-white">
            <MapPinned className="size-6" strokeWidth={2.25} aria-hidden="true" />
          </span>
          <h2
            id="local-highlight-heading"
            className="mt-6 text-2xl font-bold tracking-tight sm:text-[2rem]"
          >
            Build Your Professional Presence in {city.name}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            MasseurMatch helps independent massage and bodywork professionals
            create an online presence and become easier to find through a
            dedicated local directory.
          </p>
        </div>
      </div>
    </section>
  );
}
