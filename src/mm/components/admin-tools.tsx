"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogPost, City, Keyword, Review, Therapist, User } from "@/mm/types";
import { Button, Card, Input, Select, Textarea } from "@/mm/components/primitives";

type StatusMap = Record<string, string>;

function useMutationStatus(): [StatusMap, (key: string, value: string) => void] {
  const [statusMap, setStatusMap] = useState<StatusMap>({});

  return [
    statusMap,
    (key, value) => {
      setStatusMap((current) => ({
        ...current,
        [key]: value,
      }));
    },
  ];
}

async function postJson(url: string, body: object, method = "POST"): Promise<{ error?: string }> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "DELETE" ? undefined : JSON.stringify(body),
  });

  const payload = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}

export function AdminTherapistsTable({
  cities,
  therapists,
}: {
  cities: City[];
  therapists: Therapist[];
}) {
  const router = useRouter();
  const [statusMap, setStatus] = useMutationStatus();
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("");
  const [city, setCity] = useState("");
  const [status, setListingStatus] = useState("");

  const filtered = useMemo(() => {
    return therapists.filter((therapist) => {
      const matchesQuery = query
        ? [therapist.displayName, therapist.bio, therapist.slug].join(" ").toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesTier = tier ? therapist.tier === tier : true;
      const matchesCity = city ? therapist.citySlug === city : true;
      const matchesStatus = status ? therapist.status === status : true;

      return matchesQuery && matchesTier && matchesCity && matchesStatus;
    });
  }, [city, query, status, therapists, tier]);

  async function runAction(therapistId: string, action: "approve" | "suspend" | "delete") {
    try {
      await postJson("/api/admin/therapists", { therapistId, action });
      setStatus(therapistId, `${action}d`);
      startTransition(() => router.refresh());
    } catch (error) {
      setStatus(therapistId, error instanceof Error ? error.message : "Unable to update therapist.");
    }
  }

  return (
    <Card>
      <div className="grid gap-4 md:grid-cols-4">
        <Input placeholder="Search therapists" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={tier} onChange={(event) => setTier(event.target.value)}>
          <option value="">All tiers</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="featured">Featured</option>
        </Select>
        <Select value={city} onChange={(event) => setCity(event.target.value)}>
          <option value="">All cities</option>
          {cities.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(event) => setListingStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="suspended">Suspended</option>
        </Select>
      </div>

      <div className="mt-6 space-y-4">
        {filtered.map((therapist) => (
          <div key={therapist.id} className="rounded-2xl border border-border p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-display text-2xl">{therapist.displayName}</h3>
                <p className="text-sm text-muted-foreground">
                  {therapist.citySlug} • {therapist.tier} • {therapist.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="secondary" onClick={() => void runAction(therapist.id, "approve")}>
                  Approve
                </Button>
                <Button type="button" variant="secondary" onClick={() => void runAction(therapist.id, "suspend")}>
                  Suspend
                </Button>
                <Button type="button" variant="danger" onClick={() => void runAction(therapist.id, "delete")}>
                  Delete
                </Button>
              </div>
            </div>
            {statusMap[therapist.id] ? <p className="mt-3 text-sm text-muted-foreground">{statusMap[therapist.id]}</p> : null}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AdminUsersTable({ users }: { users: User[] }) {
  const router = useRouter();
  const [statusMap, setStatus] = useMutationStatus();

  async function updateRole(userId: string, role: "admin" | "therapist") {
    try {
      await postJson("/api/admin/users", { userId, role });
      setStatus(userId, "Role updated.");
      startTransition(() => router.refresh());
    } catch (error) {
      setStatus(userId, error instanceof Error ? error.message : "Unable to update role.");
    }
  }

  return (
    <Card className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="rounded-2xl border border-border p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{user.fullName}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Select value={user.role} onChange={(event) => void updateRole(user.id, event.target.value as "admin" | "therapist")}>
              <option value="therapist">Therapist</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          {statusMap[user.id] ? <p className="mt-3 text-sm text-muted-foreground">{statusMap[user.id]}</p> : null}
        </div>
      ))}
    </Card>
  );
}

export function AdminReviewsQueue({
  reviews,
  therapistMap,
}: {
  reviews: Review[];
  therapistMap: Record<string, Therapist>;
}) {
  const router = useRouter();
  const [statusMap, setStatus] = useMutationStatus();

  async function moderate(reviewId: string, action: "approve" | "remove") {
    try {
      await postJson("/api/admin/reviews", { reviewId, action });
      setStatus(reviewId, `Review ${action}d.`);
      startTransition(() => router.refresh());
    } catch (error) {
      setStatus(reviewId, error instanceof Error ? error.message : "Unable to update review.");
    }
  }

  return (
    <Card className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-2xl border border-border p-4">
          <p className="text-sm font-semibold text-foreground">
            {review.authorName} on {therapistMap[review.therapistId]?.displayName || "Unknown therapist"}
          </p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{review.body}</p>
          <div className="mt-4 flex gap-3">
            <Button type="button" variant="secondary" onClick={() => void moderate(review.id, "approve")}>
              Approve
            </Button>
            <Button type="button" variant="danger" onClick={() => void moderate(review.id, "remove")}>
              Remove
            </Button>
          </div>
          {statusMap[review.id] ? <p className="mt-3 text-sm text-muted-foreground">{statusMap[review.id]}</p> : null}
        </div>
      ))}
    </Card>
  );
}

export function AdminCitiesManager({
  cities,
  therapistCounts,
}: {
  cities: City[];
  therapistCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    description: "",
    hero: "",
    latitude: "30.2672",
    longitude: "-97.7431",
    name: "",
    slug: "",
    state: "",
    stateCode: "",
  });

  async function submit() {
    try {
      await postJson("/api/admin/cities", {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });
      setStatus("City saved.");
      setForm({
        description: "",
        hero: "",
        latitude: "30.2672",
        longitude: "-97.7431",
        name: "",
        slug: "",
        state: "",
        stateCode: "",
      });
      startTransition(() => router.refresh());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save city.");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="City name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <Input placeholder="Slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
          <Input placeholder="State" value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} />
          <Input placeholder="State code" value={form.stateCode} onChange={(event) => setForm((current) => ({ ...current, stateCode: event.target.value }))} />
        </div>
        <Textarea placeholder="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
        <Input placeholder="Hero copy" value={form.hero} onChange={(event) => setForm((current) => ({ ...current, hero: event.target.value }))} />
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Latitude" value={form.latitude} onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value }))} />
          <Input placeholder="Longitude" value={form.longitude} onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value }))} />
        </div>
        <Button type="button" onClick={() => void submit()}>
          Save city
        </Button>
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </Card>

      <Card className="space-y-3">
        {cities.map((city) => (
          <div key={city.id} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm">
            <span>{city.name}, {city.stateCode}</span>
            <span className="text-muted-foreground">{therapistCounts[city.slug] || 0} therapists</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

export function AdminKeywordsManager({ keywords }: { keywords: Keyword[] }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    category: "modality",
    label: "",
    slug: "",
  });

  async function submit() {
    try {
      await postJson("/api/admin/keywords", form);
      setStatus("Keyword saved.");
      setForm({
        category: "modality",
        label: "",
        slug: "",
      });
      startTransition(() => router.refresh());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save keyword.");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Input placeholder="Label" value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} />
          <Input placeholder="Slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
          <Select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
            <option value="modality">Modality</option>
            <option value="identity">Identity</option>
            <option value="intent">Intent</option>
          </Select>
        </div>
        <Button type="button" onClick={() => void submit()}>
          Save keyword
        </Button>
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </Card>

      <Card className="grid gap-3 md:grid-cols-2">
        {keywords.map((keyword) => (
          <div key={keyword.id} className="rounded-2xl border border-border px-4 py-3 text-sm">
            <p className="font-semibold text-foreground">{keyword.label}</p>
            <p className="text-muted-foreground">{keyword.slug} • {keyword.category}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}

export function AdminBlogManager({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    content: "",
    excerpt: "",
    seoDescription: "",
    slug: "",
    tags: "directory, seo",
    title: "",
  });

  async function submit() {
    try {
      await postJson("/api/admin/blog", {
        ...form,
        tags: form.tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setStatus("Blog post saved.");
      setForm({
        content: "",
        excerpt: "",
        seoDescription: "",
        slug: "",
        tags: "directory, seo",
        title: "",
      });
      startTransition(() => router.refresh());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save blog post.");
    }
  }

  async function remove(id: string) {
    try {
      await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
      setStatus("Blog post deleted.");
      startTransition(() => router.refresh());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to delete blog post.");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <Input placeholder="Slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
        </div>
        <Textarea placeholder="Excerpt" value={form.excerpt} onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))} />
        <Textarea
          placeholder="SEO description"
          value={form.seoDescription}
          onChange={(event) => setForm((current) => ({ ...current, seoDescription: event.target.value }))}
        />
        <Input placeholder="Tags" value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
        <Textarea placeholder="Content" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} />
        <Button type="button" onClick={() => void submit()}>
          Save blog post
        </Button>
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </Card>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="font-display text-2xl">{post.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
              </div>
              <Button type="button" variant="danger" onClick={() => void remove(post.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
