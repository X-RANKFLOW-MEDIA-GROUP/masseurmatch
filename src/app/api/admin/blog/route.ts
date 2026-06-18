export const dynamic = "force-dynamic";
import { z } from "zod";

import {
  readContentStore,
  writeContentStore,
  type StoredBlogPost,
} from "@/app/api/_lib/content-store";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { requireAdminSession, recordAuditLog } from "@/app/api/_lib/supabase-server";
import { slugify } from "@/app/api/_lib/text";
import type { BlogBlock } from "@/app/blog/posts";

const blogBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("paragraph"),
    text: z.string().min(1),
  }),
  z.object({
    type: z.literal("heading"),
    text: z.string().min(1),
  }),
  z.object({
    type: z.literal("list"),
    items: z.array(z.string().min(1)).min(1),
  }),
]);

const blogSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(3),
  excerpt: z.string().min(10),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  author: z.string().min(2).optional(),
  blocks: z.array(blogBlockSchema).min(1),
});

const deleteBlogSchema = z.object({
  slug: z.string().min(1),
});

type BlogInput = {
  slug?: string;
  title: string;
  excerpt: string;
  publishedAt?: string;
  author?: string;
  blocks: BlogBlock[];
};

async function saveBlogPost(input: BlogInput): Promise<StoredBlogPost> {
  const store = await readContentStore();
  const slug = slugify(input.slug || input.title);

  if (!slug) {
    throw new RouteError(400, "A valid slug or title is required.");
  }

  const post: StoredBlogPost = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    publishedAt: input.publishedAt || new Date().toISOString().slice(0, 10),
    author: input.author?.trim() || "MasseurMatch Editorial",
    blocks: input.blocks,
    updatedAt: new Date().toISOString(),
  };

  const nextPosts = store.blogPosts.filter((candidate) => candidate.slug !== slug);
  nextPosts.unshift(post);

  await writeContentStore({
    ...store,
    blogPosts: nextPosts,
  });

  return post;
}

async function deleteBlogPost(slug: string) {
  const store = await readContentStore();
  const nextPosts = store.blogPosts.filter((candidate) => candidate.slug !== slug);

  if (nextPosts.length === store.blogPosts.length) {
    throw new RouteError(404, "Blog post not found.");
  }

  await writeContentStore({
    ...store,
    blogPosts: nextPosts,
  });

  return {
    slug,
  };
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    const body = (await parseJsonBody(request, blogSchema)) as BlogInput;
    const post = await saveBlogPost(body);

    await recordAuditLog(admin.userId, "save_blog_post", "blog", post.slug, {
      title: post.title,
    });

    return json({
      ok: true,
      post,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    const body = await parseJsonBody(request, deleteBlogSchema);
    const result = await deleteBlogPost(body.slug);

    await recordAuditLog(admin.userId, "delete_blog_post", "blog", result.slug);

    return json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
