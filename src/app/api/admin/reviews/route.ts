import { NextResponse } from "next/server";
import { applyReviewAdminAction } from "@/mm/lib/mutations";
import { getRequestSession } from "@/mm/lib/request";
import { adminReviewActionSchema } from "@/mm/lib/validation";

export async function POST(request: Request) {
  const session = await getRequestSession(request);

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = adminReviewActionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review action." }, { status: 400 });
  }

  try {
    await applyReviewAdminAction(parsed.data.reviewId, parsed.data.action);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update review.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
