export const dynamic = "force-dynamic";

import { z } from "zod";
import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";

const upgradeSchema = z.object({
  subscription_tier: z.enum(["free", "standard", "pro", "elite"]),
  reason: z.string().max(500).optional(),
  discount_percent: z.number().min(0).max(100).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminSession(request);
    const { id } = await params;
    const body = await parseJsonBody(request, upgradeSchema);
    const adminClient = createSupabaseAdminClient();

    const discountPayload = body.discount_percent !== undefined
      ? {
          admin_discount: {
            percent: body.discount_percent,
            applied_by: admin.userId,
            applied_at: new Date().toISOString(),
            reason: body.reason || "Admin override",
          },
        }
      : undefined;

    const { data, error } = await adminClient
      .from("profiles")
      .update({
        subscription_tier: body.subscription_tier,
        ...(discountPayload ? { regular_discounts: discountPayload } : {}),
      })
      .eq("id", id)
      .select("id, display_name, full_name, subscription_tier, regular_discounts")
      .single();

    if (error) {
      return json({ ok: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return json({ ok: false, error: "Profile not found." }, { status: 404 });
    }

    await recordAuditLog(admin.userId, "profile_upgrade", "profile", id, {
      new_tier: body.subscription_tier,
      discount_percent: body.discount_percent,
      reason: body.reason,
    });

    return json({ ok: true, profile: data });
  } catch (err) {
    return errorResponse(err);
  }
}
