import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo/SEOHead";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { CursorGlow } from "@/components/animations/CursorGlow";
import { TextReveal } from "@/components/animations/TextReveal";
import { US_CITIES, type CityData } from "@/data/cities";
import { Search, MapPin, ChevronRight, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/components/animations/variants";

const CityDirectory = () => {
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Group cities by state
  const grouped = useMemo(() => {
    const map = new Map<string, CityData[]>();
    for (const city of US_CITIES) {
      const existing = map.get(city.state) || [];
      existing.push(city);
      map.set(city.state, existing);
    }
    // Sort states alphabetically
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, []);

  // Unique states for filter chips
  const states = useMemo(() => grouped.map(([state, cities]) => ({ state, code: cities[0].stateCode, count: cities.length })), [grouped]);

  // Filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return grouped
      .map(([state, cities]) => {
        if (selectedState && state !== selectedState) return null;
        const matchedCities = cities.filter(
          (c) => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q) || c.stateCode.toLowerCase().includes(q)
        );
        if (matchedCities.length === 0) return null;
        return [state, matchedCities] as [string, CityData[]];
      })
      .filter(Boolean) as [string, CityData[]][];
  }, [grouped, search, selectedState]);

  const totalCities = filtered.reduce((sum, [, cities]) => sum + cities.length, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Massage Therapist Directory — Cities",
    description: "Browse massage therapists in 200+ US cities",
    numberOfItems: US_CITIES.length,
    itemListElement: US_CITIES.slice(0, 50).map((city, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://masseurmatch.lovable.app/${city.slug}`,
      name: `Massage Therapists in ${city.name}, ${city.stateCode}`,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Browse Massage Therapists by City — MasseurMatch Directory"
        description="Find male massage therapists in 200+ US cities. Browse our city directory organized by state to discover professionals near you."
        path="/cities"
        jsonLd={jsonLd}
      />
      <CursorGlow />
      <ScrollProgress />
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-12 border-b border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4"
          >
            City Directory
          </motion.p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
            <TextReveal text="Find Therapists Near You" delay={0.1} />
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground max-w-xl text-lg mb-8"
          >
            Browse {US_CITIES.length}+ cities across the United States. Every city page lists local massage therapists you can contact directly.
          </motion.p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search cities or states…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-border"
              aria-label="Search cities or states"
            />
          </div>
        </div>
      </section>

      {/* State filter chips */}
      <section className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex gap-1.5 py-3 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedState(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !selectedState
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              All States ({US_CITIES.length})
            </button>
            {states.map(({ state, code, count }) => (
              <button
                key={state}
                onClick={() => setSelectedState(selectedState === state ? null : state)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedState === state
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {code} ({count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results summary */}
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-4 max-w-6xl">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{totalCities}</span> cities
            {selectedState ? ` in ${selectedState}` : ""}
            {search ? ` matching "${search}"` : ""}
          </p>
        </div>
      </section>

      {/* City grid grouped by state */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-6xl space-y-10">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No cities found</h3>
              <p className="text-muted-foreground text-sm">
                Try a different search term or clear your filters.
              </p>
            </div>
          ) : (
            filtered.map(([state, cities], gi) => (
              <motion.div
                key={state}
                custom={gi}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
              >
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold">{state}</h2>
                  <Badge variant="outline" className="text-xs">
                    {cities.length} {cities.length === 1 ? "city" : "cities"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {cities.map((city) => (
                    <Link
                      key={city.slug}
                      to={`/${city.slug}`}
                      className="group flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-foreground/20 hover:bg-secondary/40 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {city.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{city.stateCode}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-foreground/50 shrink-0 transition-colors" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CityDirectory;
