import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/mm/lib/validation";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = forgotPasswordSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  return NextResponse.json({
    message: "If the address exists in the system, reset instructions are now available for that account.",
  });
}
