import { NextResponse } from "next/server";
import { getCities, getPublicTherapists } from "@/mm/lib/directory";

type ChatRequest = {
  question?: string;
};

function pickAnswer(question: string, therapistCount: number, cities: string[]): string {
  const normalized = question.toLowerCase();

  if (normalized.includes("city") || normalized.includes("where")) {
    return `MasseurMatch currently focuses on ${cities.join(", ")}. City pages are built to compare therapists by modality, identity filters, and direct contact details.`;
  }

  if (normalized.includes("price") || normalized.includes("tier")) {
    return "Therapist profiles show pricing context directly on the listing. For providers, subscription tiers are Free, Pro, and Featured.";
  }

  if (normalized.includes("contact") || normalized.includes("reach")) {
    return "This is a directory-first platform. Visitors browse therapist profiles and use the listed email, phone, or website to reach providers directly.";
  }

  return `There are ${therapistCount} live therapist profiles in the directory right now. Try asking about cities, filters, therapist details, or how direct contact works.`;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ChatRequest;
  const question = payload.question?.trim();

  if (!question) {
    return NextResponse.json({ error: "Ask a question to start the chat." }, { status: 400 });
  }

  const [cities, therapists] = await Promise.all([getCities(), getPublicTherapists()]);
  return NextResponse.json({
    answer: pickAnswer(
      question,
      therapists.length,
      cities.map((city) => city.name),
    ),
  });
}
