import { NextResponse } from "next/server";
import { applyTherapistAdminAction } from "@/mm/lib/mutations";
import { getRequestSession } from "@/mm/lib/request";
import { adminTherapistActionSchema } from "@/mm/lib/validation";

export async function POST(request: Request) {
  const session = await getRequestSession(request);

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = adminTherapistActionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid therapist action." }, { status: 400 });
  }

  try {
    await applyTherapistAdminAction(parsed.data.therapistId, parsed.data.action);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update therapist.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
