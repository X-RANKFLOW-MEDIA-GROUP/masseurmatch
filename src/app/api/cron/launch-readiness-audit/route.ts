import { NextRequest, NextResponse } from "next/server";
import { generateLaunchReadinessReport, formatReadinessReport } from "@/lib/launch-readiness-audit";
import { getPublicTherapists } from "@/app/_lib/directory";
import { buildProfileViewModel } from "@/components/profile/profile-utils";
import { sendAuditReportEmail } from "@/lib/audit-report-email";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { items: therapists } = await getPublicTherapists({ page: 1, pageSize: 10000 });
    const profiles = therapists.map((t) => buildProfileViewModel(t));

    const report = generateLaunchReadinessReport(profiles);
    const formattedReport = formatReadinessReport(report);

    const adminEmail = process.env.ADMIN_EMAIL || "admin@masseurmatch.com";

    await sendAuditReportEmail(adminEmail, report, formattedReport);

    return NextResponse.json({
      success: true,
      message: "Launch readiness audit report generated and sent",
      summary: {
        totalProfiles: report.summary.totalProfiles,
        verifiedProfiles: report.summary.verifiedProfiles,
        indexableProfiles: report.summary.indexableProfiles,
        readinessPercentage: report.summary.readinessPercentage,
      },
    });
  } catch (error) {
    console.error("[Launch Readiness Audit] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate audit report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
