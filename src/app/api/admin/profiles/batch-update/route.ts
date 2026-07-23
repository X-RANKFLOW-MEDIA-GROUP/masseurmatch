export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  requireAdminSession,
  recordAuditLog,
} from "@/app/api/_lib/supabase-server";
import { parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { z } from "zod";

const batchUpdateSchema = z.object({
  updates: z.record(z.string(), z.any()),
  reason: z.string().min(1),
  actionType: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const admin = await requireAdminSession(request);

    const body = await parseJsonBody(request, batchUpdateSchema);
    const { updates, reason, actionType } = body;

    const supabase = createSupabaseAdminClient();
    const updatedProfiles: any[] = [];

    // Process each profile update
    for (const [profileId, updateData] of Object.entries(updates)) {
      const { error: updateError, data } = await supabase
        .from("profiles")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId)
        .select()
        .single();

      if (updateError) {
        console.error(`Error updating profile ${profileId}:`, updateError);
        continue;
      }

      if (data) {
        updatedProfiles.push(data);

        // Log the admin action
        await recordAuditLog(
          admin.userId,
          actionType || "batch_edit",
          "profiles",
          profileId,
          {
            ...updateData,
            reason,
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      profiles: updatedProfiles,
      updated_count: updatedProfiles.length,
    });
  } catch (error) {
    console.error("Batch update error:", error);
    if (error instanceof RouteError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
