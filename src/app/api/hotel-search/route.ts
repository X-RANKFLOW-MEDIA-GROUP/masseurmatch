import { NextResponse } from "next/server";
import { hotelSearchSchema } from "@/lib/hotel-search-schema";
import type { HotelSearchResult } from "@/types/hotel-search";
import { assertRateLimit } from "@/app/_lib/security";
import { RouteError } from "@/app/api/_lib/http";

export const runtime = "nodejs";

// DeepSeek ships an OpenAI-compatible Chat Completions API. We call it directly
// with fetch so the feature adds no new npm dependency.
const DEEPSEEK_BASE_URL =
  process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const SYSTEM_PROMPT = [
  "You are a travel concierge for MasseurMatch, helping LGBTQ+ travelers find",
  "well-located, parking-friendly hotels near a city's gay/arts district.",
  "Return ONLY a JSON object — no prose, no markdown fences. Use this shape:",
  "{",
  ' "city": string,',
  ' "gayArea": string,',
  ' "hotels": [{',
  ' "name": string, "address": string, "distanceToGayArea": string,',
  ' "onSiteParking": string, "clientParking": string, "pricePerNight": string,',
  ' "mobileKey": boolean, "breakfast": boolean, "notes": string, "whyRecommended": string',
  " }],",
  ' "streetMeterInfo": { "location": string, "rate": string, "hours": string, "freeWhen": string }',
  "}",
  "Provide 3-5 real, well-known hotels. Prefer properties with on-site or nearby",
  "parking. Keep onSiteParking as 'FREE' or a '$X/night' style string. If you are",
  "unsure of an exact figure, give a realistic estimate and say so in notes.",
].join(" ");

function buildUserPrompt(city: string, checkIn: string, checkOut: string): string {
  return [
    `Find hotels in ${city} for a stay from ${checkIn} to ${checkOut}.`,
    "Focus on the main gay/arts district. Include realistic on-site parking,",
    "nightly price ranges, mobile key availability, breakfast, and downtown",
    "street-meter parking info. Respond with the JSON object only.",
  ].join(" ");
}

function extractJson(content: string): unknown {
  // DeepSeek with json_object mode returns clean JSON, but strip stray fences
  // defensively in case the model wraps the payload.
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function POST(request: Request) {
  // This route proxies a paid LLM — rate-limit it tightly to prevent abuse/cost.
  try {
    assertRateLimit(request, "hotel-search", { limit: 8, windowMs: 60_000 });
  } catch (error) {
    if (error instanceof RouteError) {
      return NextResponse.json({ error: error.message, success: false }, { status: error.status });
    }
    throw error;
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body.", success: false },
      { status: 400 },
    );
  }

  const parsed = hotelSearchSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request.", success: false },
      { status: 400 },
    );
  }

  const { city, checkIn, checkOut } = parsed.data;

  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY not configured.", success: false },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(city, checkIn, checkOut) },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `DeepSeek request failed: ${res.status}`, success: false },
        { status: 502 },
      );
    }

    const completion = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Empty response from DeepSeek.", success: false },
        { status: 502 },
      );
    }

    let result: Partial<HotelSearchResult>;
    try {
      result = extractJson(content) as Partial<HotelSearchResult>;
    } catch {
      return NextResponse.json(
        { error: "Failed to parse hotel data.", success: false },
        { status: 502 },
      );
    }

    return NextResponse.json({
      city,
      checkIn,
      checkOut,
      gayArea: result.gayArea ?? "",
      hotels: Array.isArray(result.hotels) ? result.hotels : [],
      streetMeterInfo:
        result.streetMeterInfo ?? { location: "", rate: "", hours: "", freeWhen: "" },
      timestamp: new Date().toISOString(),
      success: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Hotel search failed.";
    return NextResponse.json(
      { error: message, success: false },
      { status: 502 },
    );
  }
}
