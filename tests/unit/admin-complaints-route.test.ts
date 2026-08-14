import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/app/api/_lib/supabase-server", () => mocks);

import { GET } from "@/app/api/admin/complaints/route";

describe("GET /api/admin/complaints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdminSession.mockResolvedValue({ userId: "admin-1", role: "admin" });
  });

  it("returns complaints with and without an explicitly fetched profile", async () => {
    const complaintRows = [
      {
        id: "complaint-with-profile",
        reporter_id: "reporter-1",
        reported_profile_id: "profile-1",
        category: "other",
        description: "Description",
        status: "pending",
        created_at: "2026-08-14T00:00:00.000Z",
        resolved_at: null,
        admin_notes: null,
      },
      {
        id: "complaint-without-profile",
        reporter_id: "reporter-2",
        reported_profile_id: "missing-profile",
        category: "other",
        description: "Description",
        status: "pending",
        created_at: "2026-08-13T00:00:00.000Z",
        resolved_at: null,
        admin_notes: null,
      },
    ];

    const complaintsQuery = {
      select: vi.fn(),
      order: vi.fn(),
      eq: vi.fn(),
      limit: vi.fn().mockResolvedValue({ data: complaintRows, error: null }),
    };
    complaintsQuery.select.mockReturnValue(complaintsQuery);
    complaintsQuery.order.mockReturnValue(complaintsQuery);
    complaintsQuery.eq.mockReturnValue(complaintsQuery);

    const profilesQuery = {
      select: vi.fn(),
      in: vi.fn().mockResolvedValue({
        data: [{ id: "profile-1", full_name: "Alex Smith", display_name: "Alex" }],
        error: null,
      }),
    };
    profilesQuery.select.mockReturnValue(profilesQuery);

    mocks.createSupabaseAdminClient.mockReturnValue({
      from: vi.fn((table: string) =>
        table === "complaints" ? complaintsQuery : profilesQuery,
      ),
    });

    const response = await GET(
      new NextRequest("http://localhost/api/admin/complaints?status=all"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(complaintsQuery.select).not.toHaveBeenCalledWith(
      expect.stringContaining("profiles!reported_profile_id"),
    );
    expect(profilesQuery.in).toHaveBeenCalledWith("id", [
      "profile-1",
      "missing-profile",
    ]);
    expect(body.complaints[0].profiles).toEqual({
      id: "profile-1",
      full_name: "Alex Smith",
      display_name: "Alex",
    });
    expect(body.complaints[1].profiles).toBeNull();
  });
});
