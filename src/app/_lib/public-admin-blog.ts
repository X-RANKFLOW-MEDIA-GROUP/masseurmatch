import "server-only";

import { readContentStore, type StoredBlogPost } from "@/app/api/_lib/content-store";
import type { BlogPost, BlogSection } from "@/app/_lib/blog-data";

const EDITORIAL_AUTHOR = {
  name: "MasseurMatch Editorial",
  title: "Wellness & Inclusivity Editor",
  bio: "The MasseurMatch editorial team produces evidence-based wellness content for LGBTQ+-inclusive audiences.",
};

export type PublicAdminBlogListItem = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
};

export async function getPublicAdminBlogPosts(): Promise<StoredBlogPost[]> {
  const store = await readContentStore();
  return [...store.blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPublicAdminBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = await getPublicAdminBlogPosts();
  const post = posts.find((candidate) => candidate.slug === slug);
  return post ? mapStoredPost(post) : null;
}

export function toPublicAdminBlogListItem(post: StoredBlogPost): PublicAdminBlogListItem {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: "MasseurMatch News",
    date: formatDate(post.publishedAt),
    readTime: `${estimateReadTime(post)} min read`,
  };
}

function mapStoredPost(post: StoredBlogPost): BlogPost {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.blocks.map(mapBlock),
    category: "MasseurMatch News",
    tags: ["MasseurMatch", "wellness"],
    author: {
      ...EDITORIAL_AUTHOR,
      name: post.author || EDITORIAL_AUTHOR.name,
    },
    publishedAt: normalizeDate(post.publishedAt),
    updatedAt: post.updatedAt || normalizeDate(post.publishedAt),
    readTimeMinutes: estimateReadTime(post),
  };
}

function mapBlock(block: StoredBlogPost["blocks"][number]): BlogSection {
  if (block.type === "heading") return { type: "h2", content: block.text };
  if (block.type === "list") return { type: "ul", content: block.items };
  return { type: "paragraph", content: block.text };
}

function estimateReadTime(post: StoredBlogPost): number {
  const text = post.blocks
    .map((block) => block.type === "list" ? block.items.join(" ") : block.text)
    .join(" ");
  return Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200));
}

function normalizeDate(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : value;
}

function formatDate(value: string): string {
  const date = new Date(normalizeDate(value));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
