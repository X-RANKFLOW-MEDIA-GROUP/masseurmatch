export const dynamic = "force-dynamic";

import { z } from "zod";

import { assertRateLimit } from "@/app/_lib/security";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";

const rowSchema = z.object({
  phone: z.string().trim().min(7).max(40),
  name: z.string().trim().max(160).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  state: z.string().trim().max(80).optional().nullable(),
  timezone: z.string().trim().max(80).optional().nullable(),
  profileUrl: z.string().trim().max(1000).optional().nullable(),
  textMessage: z.string().trim().max(4000).optional().nullable(),
});

const bodySchema = z.object({
  rows: z.array(rowSchema).min(1).max(250),
  duplicateMode: z.enum(["skip", "update"]).default("skip"),
  source: z.string().trim().max(120).default("admin_csv"),
});

type DbClient = ReturnType<typeof createSupabaseAdminClient> & {
  from: (table: string) => any;
};

function normalizeUsPhone(input: string) {
  const raw = input.trim();
  if (raw.startsWith("+")) {
    const digits = raw.slice(1).replace(/\D/g, "");
    if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
    return null;
  }

  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return null;
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    assertRateLimit(request, "admin-messaging-import", { limit: 30, windowMs: 60_000 });
    const body = await parseJsonBody(request, bodySchema);
    const db = createSupabaseAdminClient() as DbClient;

    const normalized = body.rows.map((row, index) => ({
      index,
      row,
      phone: normalizeUsPhone(row.phone),
    }));

    const invalid = normalized.filter((item) => !item.phone);
    const valid = normalized.filter((item): item is typeof item & { phone: string } => Boolean(item.phone));

    const uniqueByPhone = new Map<string, (typeof valid)[number]>();
    let duplicatesInsideFile = 0;
    for (const item of valid) {
      if (uniqueByPhone.has(item.phone)) duplicatesInsideFile += 1;
      uniqueByPhone.set(item.phone, item);
    }
    const deduped = [...uniqueByPhone.values()];

    const phones = deduped.map((item) => item.phone);
    const { data: existingRows, error: existingError } = phones.length
      ? await db.from("messaging_contacts").select("id,phone_e164,opted_out").in("phone_e164", phones)
      : { data: [], error: null };
    if (existingError) throw new RouteError(500, existingError.message);

    const existing = new Map<string, { id: string; opted_out: boolean }>(
      (existingRows || []).map((row: { id: string; phone_e164: string; opted_out: boolean }) => [
        row.phone_e164,
        { id: row.id, opted_out: row.opted_out },
      ] as const),
    );

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let protectedOptOuts = 0;
    const errors: Array<{ row: number; phone: string; error: string }> = [];

    for (const item of deduped) {
      const current = existing.get(item.phone);
      if (current && body.duplicateMode === "skip") {
        skipped += 1;
        continue;
      }

      const metadata = item.row.textMessage
        ? { imported_text_message: item.row.textMessage }
        : {};

      if (current) {
        if (current.opted_out) protectedOptOuts += 1;
        const patch = {
          name: item.row.name || null,
          city: item.row.city || null,
          state: item.row.state || null,
          timezone: item.row.timezone || "America/Chicago",
          profile_url: item.row.profileUrl || null,
          source: body.source,
          metadata,
        };
        const { error } = await db.from("messaging_contacts").update(patch).eq("id", current.id);
        if (error) {
          errors.push({ row: item.index + 2, phone: item.phone, error: error.message });
        } else {
          updated += 1;
        }
        continue;
      }

      const { error } = await db.from("messaging_contacts").insert({
        phone_e164: item.phone,
        name: item.row.name || null,
        city: item.row.city || null,
        state: item.row.state || null,
        timezone: item.row.timezone || "America/Chicago",
        profile_url: item.row.profileUrl || null,
        source: body.source,
        metadata,
      });
      if (error) {
        errors.push({ row: item.index + 2, phone: item.phone, error: error.message });
      } else {
        inserted += 1;
      }
    }

    await recordAuditLog(
      admin.userId,
      "admin_messaging_contacts_imported",
      "messaging_contacts",
      undefined,
      {
        received: body.rows.length,
        inserted,
        updated,
        skipped,
        invalid: invalid.length,
        duplicatesInsideFile,
        protectedOptOuts,
        errors: errors.length,
        duplicateMode: body.duplicateMode,
        source: body.source,
      },
    );

    return json({
      ok: true,
      received: body.rows.length,
      inserted,
      updated,
      skipped,
      invalid: invalid.map((item) => ({ row: item.index + 2, phone: item.row.phone })),
      duplicatesInsideFile,
      protectedOptOuts,
      errors,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
