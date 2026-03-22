import { NextResponse } from "next/server";
import { z } from "zod";

const swipeSchema = z.object({
  provider_id: z.string().min(1),
  action: z.enum(["like", "skip", "save"]),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = swipeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid swipe payload.",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    provider_id: parsed.data.provider_id,
    action: parsed.data.action,
    received_at: new Date().toISOString(),
  });
}
