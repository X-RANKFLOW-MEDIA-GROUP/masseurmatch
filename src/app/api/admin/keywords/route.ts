import { z } from "zod";

import {
  readContentStore,
  writeContentStore,
  type StoredKeyword,
} from "@/app/api/_lib/content-store";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { requireAdminSession, recordAuditLog } from "@/app/api/_lib/supabase-server";
import { slugify } from "@/app/api/_lib/text";

const keywordSchema = z.object({
  slug: z.string().min(1).optional(),
  term: z.string().min(2),
  city: z.string().min(1).optional().nullable(),
  intent: z.string().min(1).optional().nullable(),
  isActive: z.boolean().optional(),
});

async function saveKeyword(input: z.infer<typeof keywordSchema>): Promise<StoredKeyword> {
  const store = await readContentStore();
  const slug = slugify(input.slug || input.term);

  if (!slug) {
    throw new RouteError(400, "A valid keyword slug or term is required.");
  }

  const keyword: StoredKeyword = {
    slug,
    term: input.term.trim(),
    city: input.city?.trim() || null,
    intent: input.intent?.trim() || null,
    isActive: input.isActive ?? true,
    updatedAt: new Date().toISOString(),
  };

  const nextKeywords = store.keywords.filter((candidate) => candidate.slug !== slug);
  nextKeywords.unshift(keyword);

  await writeContentStore({
    ...store,
    keywords: nextKeywords,
  });

  return keyword;
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    const body = await parseJsonBody(request, keywordSchema);
    const keyword = await saveKeyword(body);

    await recordAuditLog(admin.userId, "save_keyword", "keyword", keyword.slug, {
      term: keyword.term,
      city: keyword.city,
    });

    return json({
      ok: true,
      keyword,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
