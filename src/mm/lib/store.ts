import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BlogPost, City, DemoStore, Keyword, Review, Subscription, Therapist, User } from "@/mm/types";
import { createSeedStore } from "@/mm/data/seed";

const storePath = path.join(process.cwd(), ".runtime", "demo-store.json");

async function ensureStore(): Promise<DemoStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    return JSON.parse(raw) as DemoStore;
  } catch {
    const seedStore = createSeedStore();
    await mkdir(path.dirname(storePath), { recursive: true });
    await writeFile(storePath, JSON.stringify(seedStore, null, 2), "utf8");
    return seedStore;
  }
}

async function saveStore(store: DemoStore): Promise<void> {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function readStore(): Promise<DemoStore> {
  return ensureStore();
}

export async function updateStore<T>(mutator: (store: DemoStore) => T): Promise<T> {
  const store = await ensureStore();
  const result = mutator(store);
  await saveStore(store);
  return result;
}

export async function listUsers(): Promise<User[]> {
  const store = await readStore();
  return store.users;
}

export async function listCities(): Promise<City[]> {
  const store = await readStore();
  return store.cities;
}

export async function listKeywords(): Promise<Keyword[]> {
  const store = await readStore();
  return store.keywords;
}

export async function listTherapists(): Promise<Therapist[]> {
  const store = await readStore();
  return store.therapists;
}

export async function listReviews(): Promise<Review[]> {
  const store = await readStore();
  return store.reviews;
}

export async function listBlogPosts(): Promise<BlogPost[]> {
  const store = await readStore();
  return store.blogPosts;
}

export async function listSubscriptions(): Promise<Subscription[]> {
  const store = await readStore();
  return store.subscriptions;
}
