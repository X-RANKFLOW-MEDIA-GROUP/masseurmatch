import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { readdirSync } from "fs";
import { requireAdminSession } from "@/app/api/_lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession(request as unknown as Request);

    const cookieStore = await cookies();
    
    // Create Supabase client with service role key (admin)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore errors in set
            }
          },
        },
      }
    );

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
        const { error } = await supabase.rpc("exec_sql", {
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
