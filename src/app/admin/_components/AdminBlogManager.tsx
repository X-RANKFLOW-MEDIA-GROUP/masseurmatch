"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteJson, postJson } from "@/app/_lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };

type AdminBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  updatedAt: string;
  blocks: BlogBlock[];
};

type BlogFormState = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  body: string;
};

const EMPTY_FORM: BlogFormState = {
  slug: "",
  title: "",
  excerpt: "",
  author: "",
  publishedAt: "",
  body: "",
};

function blocksToBody(blocks: BlogBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === "heading") {
        return `# ${block.text}`;
      }

      if (block.type === "list") {
        return block.items.map((item) => `- ${item}`).join("\n");
      }

      return block.text;
    })
    .join("\n\n");
}

function bodyToBlocks(body: string): BlogBlock[] {
  return body
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce<BlogBlock[]>((accumulator, chunk) => {
      const lines = chunk
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (!lines.length) {
        return accumulator;
      }

      if (lines[0]?.startsWith("# ")) {
        const heading = lines[0].replace(/^#\s+/, "").trim();
        const remainder = lines.slice(1).join(" ").trim();

        accumulator.push({ type: "heading", text: heading });
        if (remainder) {
          accumulator.push({ type: "paragraph", text: remainder });
        }

        return accumulator;
      }

      if (lines.every((line) => line.startsWith("- "))) {
        accumulator.push({
          type: "list",
          items: lines.map((line) => line.replace(/^- /, "").trim()).filter(Boolean),
        });
        return accumulator;
      }

      accumulator.push({ type: "paragraph", text: lines.join(" ") });
      return accumulator;
    }, []);
}

function toFormState(post: AdminBlogPost): BlogFormState {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    author: post.author,
    publishedAt: post.publishedAt,
    body: blocksToBody(post.blocks),
  };
}

export default function AdminBlogManager({
  initialPosts,
}: {
  initialPosts: AdminBlogPost[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<BlogFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      const blocks = bodyToBlocks(form.body);
      if (!blocks.length) {
        throw new Error("Add at least one paragraph, heading, or list.");
      }

      await postJson("/api/admin/blog", {
        slug: form.slug || undefined,
        title: form.title,
        excerpt: form.excerpt,
        author: form.author || undefined,
        publishedAt: form.publishedAt || undefined,
        blocks,
      });

      toast({
        title: "Blog post saved",
        description: form.slug ? "The post was updated." : "A new post was created.",
      });
      setForm(EMPTY_FORM);
      router.refresh();
    } catch (error) {
      toast({
        title: "Could not save post",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    setDeletingSlug(slug);

    try {
      await deleteJson("/api/admin/blog", { slug });
      toast({
        title: "Blog post deleted",
        description: `${slug} was removed.`,
      });

      if (form.slug === slug) {
        setForm(EMPTY_FORM);
      }

      router.refresh();
    } catch (error) {
      toast({
        title: "Could not delete post",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSave} className="rounded-lg border border-border p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            required
          />
          <Input
            placeholder="Slug (optional)"
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
          />
          <Input
            placeholder="Author"
            value={form.author}
            onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))}
          />
          <Input
            type="date"
            value={form.publishedAt}
            onChange={(event) => setForm((current) => ({ ...current, publishedAt: event.target.value }))}
          />
        </div>

        <Textarea
          className="mt-4 min-h-24"
          placeholder="Excerpt"
          value={form.excerpt}
          onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
          required
        />
        <Textarea
          className="mt-4 min-h-64"
          placeholder={"Body blocks. Use blank lines between paragraphs, '# ' for headings, and '- ' for lists."}
          value={form.body}
          onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
          required
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : form.slug ? "Save changes" : "Create post"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setForm(EMPTY_FORM)} disabled={saving}>
            Reset
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {initialPosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blog posts saved yet.</p>
        ) : null}

        {initialPosts.map((post) => (
          <article key={post.slug} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {post.publishedAt} · {post.slug}
                </p>
                <h2 className="mt-1 font-semibold">{post.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setForm(toFormState(post))}>
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deletingSlug === post.slug}
                  onClick={() => void handleDelete(post.slug)}
                >
                  {deletingSlug === post.slug ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
