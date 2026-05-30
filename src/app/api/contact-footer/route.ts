import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().trim(),
  message: z.string().min(10).max(2000).trim(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    // Log for MVP — swap for Supabase insert or email send when ready
    console.log("[contact-footer]", data);

    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ ok: false, errors: err.flatten().fieldErrors }, { status: 422 });
    }
    return Response.json({ ok: false, message: "Unexpected error" }, { status: 500 });
  }
}
