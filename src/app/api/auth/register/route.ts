import { NextResponse } from "next/server";
import { createTherapistUser } from "@/mm/lib/mutations";
import { setSessionCookie } from "@/mm/lib/session";
import { registerSchema } from "@/mm/lib/validation";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete the required fields." }, { status: 400 });
  }

  try {
    const user = await createTherapistUser(parsed.data);
    const response = NextResponse.json({ ok: true });
    await setSessionCookie(response, user);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
