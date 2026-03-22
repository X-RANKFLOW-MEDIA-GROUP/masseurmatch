import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { BlogPost } from "@/app/blog/posts";

export interface StoredBlogPost extends BlogPost {
  updatedAt: string;
}

export interface StoredCity {
  slug: string;
  name: string;
  state: string;
  stateCode: string;
  intro: string;
  updatedAt: string;
}

export interface StoredKeyword {
  slug: string;
  term: string;
  city: string | null;
  intent: string | null;
  isActive: boolean;
  updatedAt: string;
}

interface ContentStore {
  blogPosts: StoredBlogPost[];
  cities: StoredCity[];
  keywords: StoredKeyword[];
}

const cwdValue = process.cwd() as unknown;
const cwdPath = cwdValue instanceof URL ? fileURLToPath(cwdValue) : String(cwdValue);
const storePath = path.join(cwdPath, "src", "app", "api", "_data", "admin-content.json");

function normalizeStore(raw: Partial<ContentStore> | null | undefined): ContentStore {
  return {
    blogPosts: Array.isArray(raw?.blogPosts) ? raw.blogPosts : [],
    cities: Array.isArray(raw?.cities) ? raw.cities : [],
    keywords: Array.isArray(raw?.keywords) ? raw.keywords : [],
  };
}

export async function readContentStore(): Promise<ContentStore> {
  try {
    const contents = await readFile(storePath, "utf8");
    return normalizeStore(JSON.parse(contents) as Partial<ContentStore>);
  } catch {
    return normalizeStore(null);
  }
}

export async function writeContentStore(store: ContentStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}
