import { NextResponse } from "next/server";
import { getRequestSession } from "@/mm/lib/request";
import { saveKeyword } from "@/mm/lib/mutations";
import { keywordSchema } from "@/mm/lib/validation";

export async function POST(request: Request) {
  const session = await getRequestSession(request);

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = keywordSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid keyword data." }, { status: 400 });
  }

  try {
    const keyword = await saveKeyword(parsed.data);
    return NextResponse.json({ ok: true, keyword });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save keyword.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
