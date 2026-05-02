import { errorResponse, json, RouteError } from "@/app/api/_lib/http";

type ReverseGeocodePayload = {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    [key: string]: string | undefined;
  };
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const lat = Number(url.searchParams.get("lat"));
    const lng = Number(url.searchParams.get("lng"));

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new RouteError(400, "lat and lng are required.");
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          accept: "application/json",
          "user-agent": "MasseurMatch/1.0 (reverse geocode)",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new RouteError(502, "Reverse geocoding is temporarily unavailable.");
    }

    const payload = (await response.json()) as ReverseGeocodePayload;
    const address = payload.address || {};
    const isoState = address["ISO3166-2-lvl4"];
    const stateCode = typeof isoState === "string" ? isoState.split("-").pop() || null : null;

    return json({
      ok: true,
      city: address.city || address.town || address.village || address.municipality || address.county || null,
      stateCode,
      state: address.state || null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}