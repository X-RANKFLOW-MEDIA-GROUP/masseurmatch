import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { envAny } from "@/app/api/_lib/env";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getProfileByUserId, recordAuditLog } from "@/app/_lib/store";
import { z } from "zod";

const GEMINI_MODEL = "gemini-1.5-flash";

const moderateContentSchema = z.object({
  bio: z.string().min(1).max(5000),
});

interface AiDecision {
  status: "SAFE" | "UNSAFE";
  confidence: number;
  reason: string;
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-moderate-content", { limit: 10, windowMs: 60_000 });

    const session = requireRequestSession(request);
    const profile = await getProfileByUserId(session.userId);

    if (!profile) {
      return errorResponse(new Error("Profile not found."));
    }

    const body = await parseJsonBody(request, moderateContentSchema);
    const apiKey = envAny(["GEMINI_API_KEY", "GOOGLE_API_KEY"], "");

    if (!apiKey) {
      await recordAuditLog(session.userId, "provider.content.flagged", "profile", profile.id, {
        reason: "AI moderation unavailable — queued for manual review",
      });

      return json({
        ok: true,
        state: "pending" as const,
        message: "Content queued for manual review.",
      });
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel(
      {
        model: GEMINI_MODEL,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
      },
      { timeout: 5000 },
    );

    const prompt = [
      "You are a content moderator for MasseurMatch, a professional massage therapy directory.",
      "Analyze the following therapist biography and check for:",
      "1. Sexually explicit language or offers of sexual services.",
      "2. Offers of illegal services.",
      "3. Direct contact info (phone numbers, emails, social handles) meant to bypass the platform.",
      "",
      `Biography: "${body.bio}"`,
      "",
      "Respond ONLY with a JSON object in this exact format:",
      '{"status": "SAFE" or "UNSAFE", "confidence": number_0_to_100, "reason": "brief justification if UNSAFE, empty string if SAFE"}',
    ].join("\n");

    let aiDecision: AiDecision;
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      aiDecision = JSON.parse(text) as AiDecision;

      if (!["SAFE", "UNSAFE"].includes(aiDecision.status)) {
        throw new Error("Invalid AI response status");
      }
    } catch {
      aiDecision = { status: "UNSAFE", confidence: 0, reason: "Automated analysis failed — queued for manual review." };
    }

    await recordAuditLog(session.userId, "provider.content.moderated", "profile", profile.id, {
      aiStatus: aiDecision.status,
      aiConfidence: aiDecision.confidence,
      aiReason: aiDecision.reason,
    });

    if (aiDecision.status === "SAFE") {
      return json({
        ok: true,
        state: "approved" as const,
        message: "Content approved by AI moderation.",
      });
    }

    return json({
      ok: true,
      state: "flagged" as const,
      message: "Content held for manual review.",
      reason: aiDecision.reason,
      confidence: aiDecision.confidence,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
