import { useEffect, useState } from "react";

import { US_CITIES, type CityData } from "@/data/cities";

export function useGeolocation() {
  const [city, setCity] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompted, setPrompted] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    setCity((previous) => previous || US_CITIES[0] || null);
    setLoading(false);
  }, []);

  const requestLocation = async () => {
    setPrompted(true);
    setDenied(false);
    return city;
  };

  return {
    city,
    loading,
    prompted,
    denied,
    requestLocation,
    setCity,
  };
}
