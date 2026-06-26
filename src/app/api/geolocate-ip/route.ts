import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";

    if (!ip || ip === "127.0.0.1" || ip === "::1") {
      return NextResponse.json({ city: null, neighborhood: null, lat: null, lng: null });
    }

    const res = await fetch(`https://ip-api.com/json/${ip}?fields=city,lat,lon,status`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error("ip-api request failed");

    const data = (await res.json()) as {
      status: string;
      city?: string;
      lat?: number;
      lon?: number;
    };

    if (data.status !== "success") {
      return NextResponse.json({ city: null, neighborhood: null, lat: null, lng: null });
    }

    return NextResponse.json({
      city: data.city ?? null,
      neighborhood: null,
      lat: data.lat ?? null,
      lng: data.lon ?? null,
    });
  } catch {
    return NextResponse.json({ city: null, neighborhood: null, lat: null, lng: null });
  }
}
