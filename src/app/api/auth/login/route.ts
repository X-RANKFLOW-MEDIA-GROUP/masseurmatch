import { NextResponse } from "next/server";
import { getUserByEmail } from "@/mm/lib/directory";
import { verifyPassword } from "@/mm/lib/security";
import { setSessionCookie } from "@/mm/lib/session";
import { loginSchema } from "@/mm/lib/validation";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email and password." }, { status: 400 });
  }

  const user = await getUserByEmail(parsed.data.email);

  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, role: user.role });
  await setSessionCookie(response, {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  });
  return response;
}
