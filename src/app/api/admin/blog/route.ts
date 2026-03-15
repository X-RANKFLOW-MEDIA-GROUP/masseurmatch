import { NextResponse } from "next/server";
import { getRequestSession } from "@/mm/lib/request";
import { deleteBlogPost, saveBlogPost } from "@/mm/lib/mutations";
import { blogSchema } from "@/mm/lib/validation";

export async function POST(request: Request) {
  const session = await getRequestSession(request);

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = blogSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid blog post." }, { status: 400 });
  }

  try {
    const post = await saveBlogPost(parsed.data);
    return NextResponse.json({ ok: true, post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save blog post.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await getRequestSession(request);

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing blog post id." }, { status: 400 });
  }

  await deleteBlogPost(id);
  return NextResponse.json({ ok: true });
}
