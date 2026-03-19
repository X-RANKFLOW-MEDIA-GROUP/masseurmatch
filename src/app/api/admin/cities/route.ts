import { z } from "zod";

import {
  readContentStore,
  writeContentStore,
  type StoredCity,
} from "@/app/api/_lib/content-store";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { requireAdminSession, recordAuditLog } from "@/app/api/_lib/supabase-server";
import { slugify } from "@/app/api/_lib/text";

const citySchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(2),
  state: z.string().min(2),
  stateCode: z.string().min(2).max(3),
  intro: z.string().min(10),
});

async function saveCity(input: z.infer<typeof citySchema>): Promise<StoredCity> {
  const store = await readContentStore();
  const slug = slugify(input.slug || input.name);

  if (!slug) {
    throw new RouteError(400, "A valid city slug or name is required.");
  }

  const city: StoredCity = {
    slug,
    name: input.name.trim(),
    state: input.state.trim(),
    stateCode: input.stateCode.trim().toUpperCase(),
    intro: input.intro.trim(),
    updatedAt: new Date().toISOString(),
  };

  const nextCities = store.cities.filter((candidate) => candidate.slug !== slug);
  nextCities.unshift(city);

  await writeContentStore({
    ...store,
    cities: nextCities,
  });

  return city;
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    const body = await parseJsonBody(request, citySchema);
    const city = await saveCity(body);

    await recordAuditLog(admin.userId, "save_city", "city", city.slug, {
      name: city.name,
      stateCode: city.stateCode,
    });

    return json({
      ok: true,
      city,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
