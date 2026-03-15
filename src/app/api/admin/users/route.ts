import { NextResponse } from "next/server";
import { getRequestSession } from "@/mm/lib/request";
import { updateUserRole } from "@/mm/lib/mutations";
import { adminUserActionSchema } from "@/mm/lib/validation";

export async function POST(request: Request) {
  const session = await getRequestSession(request);

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = adminUserActionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid user update." }, { status: 400 });
  }

  try {
    await updateUserRole(parsed.data.userId, parsed.data.role);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update user role.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
