import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import seedContent from "../_data/admin-content.json";
import { createAdminClient } from "@/lib/supabase/admin";
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

// Durable persistence lives in the `admin_content` singleton row (see
// migration 20260713000000_admin_content_store.sql). The temp-dir file below is
// only a fallback for environments where the table isn't available yet, so a
// missing migration degrades gracefully instead of losing every write.
const storePath = path.join(os.tmpdir(), "masseurmatch", "admin-content.json");
const SINGLETON_ID = "singleton";

let memoryStore: ContentStore | null = null;

// admin_content is not in the generated Supabase types.
type LooseAdmin = { from: (table: string) => any } | null;

function looseAdminClient(): LooseAdmin {
  try {
    return createAdminClient() as unknown as { from: (table: string) => any };
  } catch {
    return null;
  }
}

function normalizeStore(raw: Partial<ContentStore> | null | undefined): ContentStore {
  return {
    blogPosts: Array.isArray(raw?.blogPosts) ? raw.blogPosts : [],
    cities: Array.isArray(raw?.cities) ? raw.cities : [],
    keywords: Array.isArray(raw?.keywords) ? raw.keywords : [],
  };
}

// ── Supabase (durable) ──────────────────────────────────────────────────────

async function readFromSupabase(): Promise<ContentStore | null> {
  const admin = looseAdminClient();
  if (!admin) return null;
  try {
    const { data, error } = await admin
      .from("admin_content")
      .select("blog_posts, cities, keywords")
      .eq("id", SINGLETON_ID)
      .maybeSingle();
    if (error || !data) return null;
    return normalizeStore({
      blogPosts: data.blog_posts,
      cities: data.cities,
      keywords: data.keywords,
    });
  } catch {
    return null;
  }
}

async function writeToSupabase(store: ContentStore): Promise<boolean> {
  const admin = looseAdminClient();
  if (!admin) return false;
  try {
    const { error } = await admin.from("admin_content").upsert(
      {
        id: SINGLETON_ID,
        blog_posts: store.blogPosts,
        cities: store.cities,
        keywords: store.keywords,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    return !error;
  } catch {
    return false;
  }
}

// ── Temp-dir fallback ───────────────────────────────────────────────────────

async function persistToDisk(store: ContentStore): Promise<void> {
  try {
    await mkdir(path.dirname(storePath), { recursive: true });
    await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  } catch {
    // Serverless filesystems are read-only outside the temp dir.
  }
}

async function readFromDisk(): Promise<ContentStore | null> {
  try {
    const contents = await readFile(storePath, "utf8");
    return normalizeStore(JSON.parse(contents) as Partial<ContentStore>);
  } catch {
    return null;
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function readContentStore(): Promise<ContentStore> {
  if (memoryStore) {
    return memoryStore;
  }

  // Prefer the durable Supabase copy, then the runtime temp-dir copy, then the
  // seed bundled with the app.
  const fromDb = await readFromSupabase();
  if (fromDb) {
    memoryStore = fromDb;
    return memoryStore;
  }

  const fromDisk = await readFromDisk();
  if (fromDisk) {
    memoryStore = fromDisk;
    return memoryStore;
  }

  memoryStore = normalizeStore(seedContent as unknown as Partial<ContentStore>);
  // Seed the durable store on first run so subsequent instances share it.
  await writeToSupabase(memoryStore);
  await persistToDisk(memoryStore);
  return memoryStore;
}

export async function writeContentStore(store: ContentStore) {
  const normalized = normalizeStore(store);
  memoryStore = normalized;
  await writeToSupabase(normalized);
  await persistToDisk(normalized);
}
