import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import seedContent from "../_data/admin-content.json";
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

// The original implementation wrote into the project tree under
// `process.cwd()`, which is read-only on serverless platforms (Vercel) and
// threw on the first admin write. Persist into the OS temp dir instead and keep
// an in-memory cache so reads/writes never crash a request even when the
// filesystem is fully read-only.
const storePath = path.join(os.tmpdir(), "masseurmatch", "admin-content.json");

let memoryStore: ContentStore | null = null;

function normalizeStore(raw: Partial<ContentStore> | null | undefined): ContentStore {
  return {
    blogPosts: Array.isArray(raw?.blogPosts) ? raw.blogPosts : [],
    cities: Array.isArray(raw?.cities) ? raw.cities : [],
    keywords: Array.isArray(raw?.keywords) ? raw.keywords : [],
  };
}

// Best-effort persistence: swallow read-only filesystem errors so admin writes
// still succeed (the in-memory cache keeps them live for the instance's life).
async function persist(store: ContentStore): Promise<void> {
  try {
    await mkdir(path.dirname(storePath), { recursive: true });
    await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  } catch {
    // Ignore — serverless filesystems are read-only outside the temp dir.
  }
}

export async function readContentStore(): Promise<ContentStore> {
  if (memoryStore) {
    return memoryStore;
  }

  // Prefer the runtime-persisted copy in the writable temp dir.
  try {
    const contents = await readFile(storePath, "utf8");
    memoryStore = normalizeStore(JSON.parse(contents) as Partial<ContentStore>);
    return memoryStore;
  } catch {
    // No runtime copy yet — fall back to the seed bundled with the app.
  }

  memoryStore = normalizeStore(seedContent as unknown as Partial<ContentStore>);
  await persist(memoryStore);
  return memoryStore;
}

export async function writeContentStore(store: ContentStore) {
  const normalized = normalizeStore(store);
  memoryStore = normalized;
  await persist(normalized);
}
