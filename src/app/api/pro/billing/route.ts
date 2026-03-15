import { NextResponse } from "next/server";
import { updateSubscriptionTier } from "@/mm/lib/mutations";
import { getRequestSession } from "@/mm/lib/request";
import { billingSchema } from "@/mm/lib/validation";

export async function POST(request: Request) {
  const session = await getRequestSession(request);

  if (!session || session.role !== "therapist") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = billingSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please choose a valid tier." }, { status: 400 });
  }

  try {
    await updateSubscriptionTier(session.id, parsed.data.tier);
    return NextResponse.json({
      message: `Subscription updated to ${parsed.data.tier}.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update billing.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
