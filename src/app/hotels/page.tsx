import type { Metadata } from "next";
import { HotelSearchWidget } from "@/components/hotel-search/HotelSearchWidget";

export const metadata: Metadata = {
  title: "Find Hotels | MasseurMatch",
  description:
    "Parking-friendly hotels near a city's gay & arts district, for travelers.",
};

export default function HotelsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Find a hotel</h1>
      <HotelSearchWidget />
    </div>
  );
}
