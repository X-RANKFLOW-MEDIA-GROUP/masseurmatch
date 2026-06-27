export const dynamic = "force-dynamic";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { readdirSync } from "fs";
import { requireAdminClient, recordAuditLog } from "@/app/api/_lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { client: supabase, session: admin } = await requireAdminClient(request as unknown as Request);

    // Get all migration files from supabase/migrations
    const migrationsDir = join(process.cwd(), "supabase", "migrations");
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith(".sql"))
      .sort();

    console.log(`[Migrations] Found ${migrationFiles.length} migration files`);

    let executed = 0;
    let skipped = 0;
    let errors = 0;
    const results: { file: string; status: "success" | "skipped" | "error"; message?: string }[] = [];

    // Execute each migration
    for (const file of migrationFiles) {
      try {
        const filePath = join(migrationsDir, file);
        const sqlContent = readFileSync(filePath, "utf-8");

        if (!sqlContent.trim()) {
          skipped++;
          results.push({ file, status: "skipped", message: "Empty file" });
          continue;
        }

        // Execute the SQL
        const { error } = await (supabase as any).rpc("exec_sql", {
          sql: sqlContent,
        });

        if (error) {
          // Ignore "already exists" errors
          if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
            skipped++;
            results.push({ file, status: "skipped", message: "Already exists" });
          } else {
            errors++;
            results.push({ file, status: "error", message: error.message });
            console.error(`[Migrations] Error in ${file}: ${error.message}`);
          }
        } else {
          executed++;
          results.push({ file, status: "success" });
          console.log(`[Migrations] ✓ ${file}`);
        }
      } catch (error) {
        errors++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        results.push({ file, status: "error", message: errorMsg });
        console.error(`[Migrations] Failed ${file}: ${errorMsg}`);
      }
    }

    await recordAuditLog(admin.userId, "run_migrations", "system", undefined, {
      total: migrationFiles.length,
      executed,
      skipped,
      errors,
    });

    return NextResponse.json({
      success: errors === 0,
      summary: {
        total: migrationFiles.length,
        executed,
        skipped,
        errors,
      },
      results,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Migrations] Fatal error:", errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
