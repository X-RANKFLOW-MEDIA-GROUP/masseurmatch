import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getProfileByUserId, recordAuditLog } from "@/app/_lib/store";
import { completeText, hasAnyLlmKey } from "@/lib/ai/llm";
import { z } from "zod";

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

    if (!hasAnyLlmKey()) {
      await recordAuditLog(session.userId, "provider.content.flagged", "profile", profile.id, {
        reason: "AI moderation unavailable — queued for manual review",
      });

      return json({
        ok: true,
        state: "pending" as const,
        message: "Content queued for manual review.",
      });
    }

    const system = [
      "You are a content moderator for MasseurMatch, a professional massage therapy directory.",
      "Analyze the therapist biography and check for:",
      "1. Sexually explicit language or offers of sexual services.",
      "2. Offers of illegal services.",
      "3. Direct contact info (phone numbers, emails, social handles) meant to bypass the platform.",
      "Respond ONLY with a JSON object in this exact format:",
      '{"status": "SAFE" or "UNSAFE", "confidence": number_0_to_100, "reason": "brief justification if UNSAFE, empty string if SAFE"}',
    ].join("\n");

    const result = await completeText({
      system,
      user: `Biography: "${body.bio}"`,
      json: true,
      temperature: 0,
      maxTokens: 200,
      timeoutMs: 5000,
    });

    let aiDecision: AiDecision;
    try {
      if (!result) throw new Error("No AI response");
      const cleaned = result.text
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "")
        .trim();
      aiDecision = JSON.parse(cleaned) as AiDecision;

      if (!["SAFE", "UNSAFE"].includes(aiDecision.status)) {
        throw new Error("Invalid AI response status");
      }
    } catch {
      aiDecision = {
        status: "UNSAFE",
        confidence: 0,
        reason: "Automated analysis failed — queued for manual review.",
      };
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
