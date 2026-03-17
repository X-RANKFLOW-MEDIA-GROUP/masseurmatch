"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { City } from "@/mm/types";

function distanceToCity(city: City, latitude: number, longitude: number): number {
  const deltaLat = city.latitude - latitude;
  const deltaLng = city.longitude - longitude;
  return Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
}

export function NearMeRedirect({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("Checking your location...");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const [nearest] = [...cities].sort(
          (left, right) =>
            distanceToCity(left, position.coords.latitude, position.coords.longitude) -
            distanceToCity(right, position.coords.latitude, position.coords.longitude),
        );

        setMessage(`Sending you to ${nearest.name}...`);
        router.replace(`/${nearest.slug}`);
      },
      () => {
        setMessage("Location access is unavailable. Try Dallas, Houston, or Austin instead.");
      },
    );
  }, [cities, router]);

  return <p className="text-base leading-8 text-muted-foreground">{message}</p>;
}
