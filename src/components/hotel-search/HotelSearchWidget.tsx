"use client";

import { useState } from "react";
import {
  Calendar,
  Car,
  Coffee,
  Hotel,
  KeyRound,
  Loader2,
  MapPin,
  ParkingMeter,
  Search,
} from "lucide-react";
import { useHotelSearch } from "@/hooks/useHotelSearch";

// Self-contained widget: no dependency on a specific UI component library.
// Plain Tailwind classes + lucide icons. Swap the orange-600 accent for your
// brand token if you prefer (e.g. text-primary / bg-primary).

export function HotelSearchWidget() {
  const { data, loading, error, search } = useHotelSearch();
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await search(city, checkIn, checkOut);
    } catch {
      // surfaced via the `error` state below
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          <Hotel className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Find hotels</h2>
          <p className="text-sm text-gray-500">
            Parking-friendly stays near a city&apos;s gay &amp; arts district.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            City
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="e.g. Indianapolis"
              required
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Check in
          </label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Check out
          </label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search
              </>
            )}
          </button>
        </div>
      </form>

      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {data ? (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold text-gray-900">{data.city}</h3>
            {data.gayArea ? (
              <span className="rounded-full bg-orange-600 px-3 py-1 text-xs font-medium text-white">
                {data.gayArea}
              </span>
            ) : null}
          </div>

          {data.streetMeterInfo?.rate ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <ParkingMeter className="h-4 w-4 text-orange-600" />
                Street meters
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {data.streetMeterInfo.rate}
                {data.streetMeterInfo.hours ? ` · ${data.streetMeterInfo.hours}` : ""}
              </p>
              {data.streetMeterInfo.freeWhen ? (
                <p className="mt-1 text-sm font-medium text-green-600">
                  Free: {data.streetMeterInfo.freeWhen}
                </p>
              ) : null}
            </div>
          ) : null}

          {data.hotels.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="font-medium text-gray-900">No hotels returned</p>
              <p className="mt-1 text-sm text-gray-500">
                Try a major city name, or adjust your dates.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.hotels.map((hotel, index) => (
                <article
                  key={`${hotel.name}-${index}`}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{hotel.name}</h4>
                      <p className="text-sm text-gray-500">{hotel.address}</p>
                    </div>
                    {hotel.pricePerNight ? (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {hotel.pricePerNight}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <Detail icon={<Car className="h-4 w-4" />} label="Parking" value={hotel.onSiteParking || "—"} />
                    <Detail icon={<MapPin className="h-4 w-4" />} label="To district" value={hotel.distanceToGayArea || "—"} />
                    <Detail
                      icon={<KeyRound className="h-4 w-4" />}
                      label="Mobile key"
                      value={hotel.mobileKey ? "Yes" : "No"}
                    />
                    <Detail
                      icon={<Coffee className="h-4 w-4" />}
                      label="Breakfast"
                      value={hotel.breakfast ? "Yes" : "No"}
                    />
                  </div>

                  {hotel.whyRecommended ? (
                    <p className="mt-4 text-sm leading-6 text-gray-600">{hotel.whyRecommended}</p>
                  ) : null}
                  {hotel.notes ? (
                    <p className="mt-2 text-xs text-gray-400">{hotel.notes}</p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
        <span className="text-orange-600">{icon}</span>
        {label}
      </div>
      <p className="mt-1 text-gray-900">{value}</p>
    </div>
  );
}
