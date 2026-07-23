export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  requireAdminSession,
  recordAuditLog,
} from "@/app/api/_lib/supabase-server";
import { parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { z } from "zod";

const updateSchema = z.object({
  updates: z.record(z.string(), z.any()),
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    const admin = await requireAdminSession(request);
    const { id } = await params;

    const body = await parseJsonBody(request, updateSchema);
    const { updates, reason } = body;

    const supabase = createSupabaseAdminClient();

    // Get the current profile for comparison
    const { data: currentProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !currentProfile) {
      throw new RouteError(404, "Profile not found");
    }

    // Update the profile
    const { error: updateError, data: updatedProfile } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw new RouteError(500, updateError.message);
    }

    // Log the admin action
    await recordAuditLog(
      admin.userId,
      "profile_edit",
      "profiles",
      id,
      {
        ...updates,
        reason,
      }
    );

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Profile update error:", error);
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
