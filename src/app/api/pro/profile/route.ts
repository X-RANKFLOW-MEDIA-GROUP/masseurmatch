import { NextResponse } from "next/server";
import { completeTherapistOnboarding, updateTherapistProfile } from "@/mm/lib/mutations";
import { getRequestSession } from "@/mm/lib/request";
import { onboardingSchema, profileUpdateSchema } from "@/mm/lib/validation";

export async function POST(request: Request) {
  const session = await getRequestSession(request);

  if (!session || session.role !== "therapist") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();

  try {
    if (payload.mode === "onboard") {
      const parsed = onboardingSchema.safeParse(payload);

      if (!parsed.success) {
        return NextResponse.json({ error: "Please complete every onboarding step." }, { status: 400 });
      }

      const therapist = await completeTherapistOnboarding(session.id, parsed.data);
      return NextResponse.json({ ok: true, therapist });
    }

    const parsed = profileUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please complete the profile fields correctly." }, { status: 400 });
    }

    const therapist = await updateTherapistProfile(session.id, parsed.data);
    return NextResponse.json({ ok: true, therapist });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
