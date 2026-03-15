import { NextResponse } from "next/server";
import { getRequestSession } from "@/mm/lib/request";
import { saveCity } from "@/mm/lib/mutations";
import { citySchema } from "@/mm/lib/validation";

export async function POST(request: Request) {
  const session = await getRequestSession(request);

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = citySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid city data." }, { status: 400 });
  }

  try {
    const city = await saveCity(parsed.data);
    return NextResponse.json({ ok: true, city });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save city.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
