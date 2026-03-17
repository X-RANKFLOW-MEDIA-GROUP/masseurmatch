import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit, sanitizeOptionalText, sanitizeStringArray, sanitizeText } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getProfileByUserId, recordAuditLog, updateProfileByUserId } from "@/app/_lib/store";
import { proProfileSchema } from "@/app/_lib/validation";

export async function GET(request: Request) {
  try {
    const session = requireRequestSession(request);
    const profile = await getProfileByUserId(session.userId);

    return json({
      ok: true,
      profile,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-profile", { limit: 20, windowMs: 60_000 });

    const session = requireRequestSession(request);
    const profile = await getProfileByUserId(session.userId);

    if (!profile) {
      throw new RouteError(404, "Profile not found.");
    }

    const body = await parseJsonBody(request, proProfileSchema);
    const nextProfile = await updateProfileByUserId(session.userId, {
      display_name: sanitizeText(body.displayName),
      bio: sanitizeText(body.bio),
      city: sanitizeText(body.city),
      state: sanitizeOptionalText(body.state),
      phone: sanitizeOptionalText(body.phone),
      specialties: sanitizeStringArray(body.specialties),
      incall_price: body.incallPrice ?? null,
      outcall_price: body.outcallPrice ?? null,
      status: profile.status === "active" ? "pending_approval" : profile.status,
      is_active: profile.status === "active" ? false : profile.is_active,
    });

    await recordAuditLog(session.userId, "provider.profile.update", "profile", profile.id, {
      fields: ["display_name", "bio", "city", "state", "phone", "specialties", "incall_price", "outcall_price"],
    });

    return json({
      ok: true,
      profile: nextProfile,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
