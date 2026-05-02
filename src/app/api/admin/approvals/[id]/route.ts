import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({
            name,
            value,
          }));
        },
        setAll() {},
      },
    }
  );

  try {
    const { id } = await params;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        display_name,
        email,
        phone,
        city,
        neighborhood_name,
        bio,
        specialties,
        incall_price,
        outcall_price,
        status,
        created_at,
        submitted_at,
        reviewed_at,
        reviewed_by,
        admin_notes,
        is_verified_identity,
        is_verified_phone,
        completion_percentage
      `
      )
      .eq("id", id)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { ok: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    // Fetch photos
    const { data: photos } = await supabase
      .from("profile_photos")
      .select("url")
      .eq("profile_id", id)
      .order("sort_order", { ascending: true });

    // Fetch documents
    const { data: documents } = await supabase
      .from("profile_documents")
      .select("url, type")
      .eq("profile_id", id);

    return NextResponse.json({
      ok: true,
      profile: {
        ...profile,
        profile_completion: profile.completion_percentage || 0,
        photo_urls: photos?.map((p) => p.url) || [],
        document_urls: documents?.map((d) => d.url) || [],
      },
    });
  } catch (error) {
    console.error("[api/admin/approvals/[id]] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({
            name,
            value,
          }));
        },
        setAll() {},
      },
    }
  );

  try {
    const { id } = await params;
    const { action, notes } = (await request.json()) as {
      action: "approve" | "reject" | "changes_requested";
      notes: string;
    };

    const statusMap = {
      approve: "approved",
      reject: "rejected",
      changes_requested: "changes_requested",
    };

    const { error } = await supabase
      .from("profiles")
      .update({
        status: statusMap[action],
        admin_notes: notes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: "admin", // In production, use actual admin user ID
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    // Emit event for notifications (optional)
    if (action === "approve") {
      console.log(`[api/admin/approvals] Profile ${id} approved`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/approvals/[id] POST] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update profile status" },
      { status: 500 }
    );
  }
}

