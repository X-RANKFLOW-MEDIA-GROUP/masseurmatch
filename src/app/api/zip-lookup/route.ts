import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get("zip")?.replace(/\D/g, "").slice(0, 5);

  if (!zip || zip.length !== 5) {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) return NextResponse.json(null);

    const data = await res.json() as {
      places?: Array<{ "place name": string; "state abbreviation": string; state: string }>;
    };

    const place = data.places?.[0];
    if (!place) return NextResponse.json(null);

    return NextResponse.json({
      city: place["place name"],
      state: place["state"],
      stateAbbr: place["state abbreviation"],
    });
  } catch {
    return NextResponse.json(null);
  }
}
